// import { useState } from "react";

// export default function OCRResultCard({ ocrData, onSave }) {
//   const [data, setData] = useState(ocrData);

//   const handleChange = (field, value) => {
//     setData({ ...data, [field]: value });
//   };

//   const handleItemChange = (index, key, value) => {
//     const updatedItems = [...data.items];
//     updatedItems[index][key] = key === "price" ? parseFloat(value) : value;
//     setData({ ...data, items: updatedItems });
//   };

//   return (
//     <div className="card">
//       <h2>Extracted Bill</h2>
//       <label>Date: <input type="date" value={data.date} onChange={e => handleChange("date", e.target.value)} /></label>

//       <h3>Items:</h3>
//       {data.items.map((item, i) => (
//         <div key={i}>
//           <input
//             value={item.name}
//             onChange={e => handleItemChange(i, "name", e.target.value)}
//           />
//           <input
//             type="number"
//             value={item.price}
//             onChange={e => handleItemChange(i, "price", e.target.value)}
//           />
//         </div>
//       ))}

//       <label>Total:
//         <input type="number" value={data.total} onChange={e => handleChange("total", parseFloat(e.target.value))} />
//       </label>

//       <button onClick={() => onSave(data)}>Save Expense</button>
//     </div>
//   );
// }


//---------------------------------------------------------------------

// Cards/ScanResult.jsx

import React, { useState, useEffect } from 'react';
// You'll need a way to display icons. For example, if using Font Awesome:
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faShoppingCart, faCar, faHeartbeat, faBagShopping, faLightbulb, faTicket, faMoneyBill } from '@fortawesome/free-solid-svg-icons';

const ScanResult = ({ scannedData, onSave, onCancel }) => {
    const [editableData, setEditableData] = useState({
        icon: '',
        category: '',
        amount: 0,
        date: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (scannedData) {
            // Initialize editableData with scannedData, which now contains icon, category, amount, date
            setEditableData({
                icon: scannedData.icon || 'money-bill', // Default icon if not provided
                category: scannedData.category || '',
                amount: scannedData.amount || 0,
                date: scannedData.date || '',
            });
        }
    }, [scannedData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        // Basic validation
        if (!editableData.category || !editableData.date || editableData.amount <= 0) {
            alert('Please fill in Category, Date, and Amount.');
            setIsSaving(false);
            return;
        }
        await onSave(editableData); // Call the onSave function passed from parent
        setIsSaving(false);
    };

    if (!scannedData) {
        return null; // Don't render if no data is available
    }

    // You might want a dropdown for categories instead of a text input
    const categories = [
        'Food & Dining', 'Groceries', 'Transportation', 'Health',
        'Shopping', 'Utilities', 'Entertainment', 'Miscellaneous'
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Review & Save Expense</h3>

            <div className="mb-4 flex items-center">
                <label className="block text-gray-700 text-sm font-bold w-1/4" htmlFor="category">
                    Category:
                </label>
                <select
                    id="category"
                    name="category"
                    value={editableData.category}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="mb-4 flex items-center">
                <label className="block text-gray-700 text-sm font-bold w-1/4" htmlFor="amount">
                    Amount:
                </label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={editableData.amount}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            <div className="mb-4 flex items-center">
                <label className="block text-gray-700 text-sm font-bold w-1/4" htmlFor="date">
                    Date:
                </label>
                <input
                    type="text" // Can be type="date" for a date picker
                    id="date"
                    name="date"
                    value={editableData.date}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            <div className="mb-4 flex items-center">
                <label className="block text-gray-700 text-sm font-bold w-1/4" htmlFor="icon">
                    Icon:
                </label>
                <input
                    type="text"
                    id="icon"
                    name="icon"
                    value={editableData.icon}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="e.g., utensils, car, shopping-cart"
                />
                {/* Optional: Display Font Awesome icon preview if you integrate it */}
                {/* {editableData.icon && (
                    <FontAwesomeIcon icon={editableData.icon} className="ml-2 text-xl text-gray-600" />
                )} */}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
                <button
                    onClick={onCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Expense'}
                </button>
            </div>
        </div>
    );
};

export default ScanResult;
