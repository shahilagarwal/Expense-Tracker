// utils/parseWithGCPVision.js

const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

/**
 * Helper function to map vendor names/keywords to a general category.
 * This is a heuristic and can be expanded for better accuracy.
 * @param {string} vendorName
 * @param {Array<Object>} items (optional, for more granular categorization)
 * @returns {string} Inferred category
 */
const mapToCategory = (vendorName, items) => {
    const lowerVendor = vendorName.toLowerCase();

    if (lowerVendor.includes('grocery') || lowerVendor.includes('supermart') || lowerVendor.includes('fresh') || lowerVendor.includes('market')) {
        return 'Groceries';
    }
    if (lowerVendor.includes('restaurant') || lowerVendor.includes('cafe') || lowerVendor.includes('diner') || lowerVendor.includes('hotel')) {
        // Since the bill is from SAMCO (restaurant), this will hit
        return 'Food & Dining';
    }
    if (lowerVendor.includes('gas') || lowerVendor.includes('petrol') || lowerVendor.includes('fuel')) {
        return 'Transportation';
    }
    if (lowerVendor.includes('pharmacy') || lowerVendor.includes('hospital') || lowerVendor.includes('clinic')) {
        return 'Health';
    }
    if (lowerVendor.includes('clothing') || lowerVendor.includes('fashion') || lowerVendor.includes('boutique')) {
        return 'Shopping';
    }
    if (lowerVendor.includes('utility') || lowerVendor.includes('electric') || lowerVendor.includes('water') || lowerVendor.includes('internet')) {
        return 'Utilities';
    }

    // Check item names for more specific categories if vendor is generic
    if (items && items.length > 0) {
        const itemNames = items.map(item => item.name.toLowerCase());
        if (itemNames.some(name => name.includes('movie') || name.includes('ticket') || name.includes('entertainment'))) {
            return 'Entertainment';
        }
        // Add more item-based rules as needed
    }

    return 'Miscellaneous'; // Default category if no match
};

/**
 * Assigns a default icon based on category.
 * In a real app, you'd use a more sophisticated icon mapping or allow user selection.
 * @param {string} category
 * @returns {string} Icon name (e.g., for a UI library like Font Awesome)
 */
const getCategoryIcon = (category) => {
    switch (category) {
        case 'Food & Dining': return 'utensils'; // FontAwesome icon name
        case 'Groceries': return 'shopping-cart';
        case 'Transportation': return 'car';
        case 'Health': return 'heartbeat';
        case 'Shopping': return 'bag-shopping';
        case 'Utilities': return 'lightbulb';
        case 'Entertainment': return 'ticket';
        default: return 'money-bill'; // Generic icon
    }
};


/**
 * Performs OCR using Google Cloud Vision AI's DOCUMENT_TEXT_DETECTION
 * and attempts to extract structured data in the format expected by addExpense.
 *
 * @param {Buffer} imageBuffer The image file buffer.
 * @returns {Object} An object containing rawText and structured data (category, amount, date, icon).
 * @throws {Error} If the Vision AI API call fails or returns no text.
 */
const parseWithGCPVision = async (imageBuffer) => {
    console.log("Attempting OCR with Google Cloud Vision AI (DOCUMENT_TEXT_DETECTION)...");

    try {
        const [result] = await client.documentTextDetection({
            image: {
                content: imageBuffer,
            },
            imageContext: {
                languageHints: ['en'],
            },
        });

        const fullText = result.fullTextAnnotation ? result.fullTextAnnotation.text.trim() : "";

        if (!fullText) {
            console.warn("Google Cloud Vision AI returned no text.");
            return { rawText: "", structured: {} };
        }

        console.log("📝 Google Vision Extracted Full Text:\n", fullText);

        const lines = fullText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // --- Extract core receipt data first ---
        let vendorName = null;
        if (lines.length > 0) {
            vendorName = lines[0]; // Heuristic: first non-empty line
        }

        let date = null;
        const dateRegex = /(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})|(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},\s+\d{4}\b)/i;
        const dateMatch = fullText.match(dateRegex);
        if (dateMatch) {
            date = dateMatch[0];
        }

        let totalAmount = 0;
        const totalRegex = /(?:Total|TOTAL|Amount Due|Balance|Grand Total|Net Total)\s*[:\$€£]?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i;
        const totalMatch = fullText.match(totalRegex);
        if (totalMatch && totalMatch[1]) {
            const cleanTotal = totalMatch[1].replace(/,/g, '');
            totalAmount = parseFloat(cleanTotal);
        } else {
            const priceMatches = fullText.match(/(\d+\.\d{2})\s*$/gm);
            if (priceMatches && priceMatches.length > 0) {
                totalAmount = parseFloat(priceMatches[priceMatches.length - 1]);
            }
        }

        // --- Extract Line Items (for potential category inference) ---
        const items = [];
        let inItemsSection = false;
        const itemLineRegex = /^(.+?)\s+(\d+\.\d{2})\s+(\d+)\s+(\d+\.\d{2})$/; // Item Name, Price, QTY, SUB

        for (const line of lines) {
            if (line.includes("ITEM NAME") && line.includes("PRICE")) {
                inItemsSection = true;
                continue;
            }
            if (inItemsSection && (line.includes("Sub Total Rs.") || line.includes("Total Rs."))) { // Added "Total Rs." as an end marker
                inItemsSection = false;
                break;
            }

            if (inItemsSection) {
                const itemMatch = line.match(itemLineRegex);
                if (itemMatch) {
                    items.push({
                        name: itemMatch[1].trim(),
                        price: parseFloat(itemMatch[2]),
                        quantity: parseInt(itemMatch[3]),
                        subtotal: parseFloat(itemMatch[4])
                    });
                }
            }
        }

        // --- Transform to addExpense function's expected format ---
        const category = mapToCategory(vendorName || '', items);
        const icon = getCategoryIcon(category);
        const amount = totalAmount; // 'totalAmount' maps to 'amount' in addExpense

        const structuredForAddExpense = {
            icon: icon,
            category: category,
            amount: amount,
            date: date // Keep as string for addExpense to convert to Date object
        };

        console.log("📊 Parsed Structured Data (for addExpense):", structuredForAddExpense);

        return {
            rawText: fullText,
            structured: structuredForAddExpense,
            // Optionally, you can still return the detailed items/vendorName for debugging/future use
            // detailedReceipt: { vendorName, items, totalAmount }
        };

    } catch (error) {
        console.error("🚫 Error calling Google Cloud Vision AI:", error.message);
        throw new Error(`Google Cloud Vision AI processing failed: ${error.message}`);
    }
};

module.exports = parseWithGCPVision;
