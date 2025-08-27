// controllers/scanfileController.js

const parseWithGCPVision = require('../config/parseWithGCPVision'); // Adjust path if necessary

const scanfileController = async (req, res) => {
    // 1. Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const imageBuffer = req.file.buffer; // Get the image buffer from multer
    try {
        // 2. Call the Google Cloud Vision AI utility to perform OCR and initial parsing
        const { rawText, structured } = await parseWithGCPVision(imageBuffer);

        // 3. Send the extracted raw text and structured data back to the frontend
        res.json({
            message: "Expense bill scanned and parsed successfully with Google Cloud Vision AI.",
            rawText: rawText,
            structured: structured,
        });

    } catch (err) {
        // 4. Handle any errors during the OCR or parsing process
        console.error("OCR/Parsing Pipeline error:", err);
        res.status(500).json({
            error: "Server error during OCR process",
            message: err.message || "An unknown error occurred.",
        });
    }
};

module.exports = scanfileController;
