// Dashboard.jsx

import React, { useState } from 'react';
import Navbar from './Navbar';
import ScanResult from '../Cards/ScanResult';
import SideMenu from './SideMenu';

const Dashboard = () => {
    const [scannedExpense, setScannedExpense] = useState(null); // State to hold the parsed expense data

    const handleScanComplete = (data) => {
        setScannedExpense(data.structured); // Store the transformed structured data (icon, category, amount, date)
    };

    const handleSaveExpense = async (expenseData) => {
        try {
            // Make API call to your backend to save the expense
            // This endpoint should match where your addExpense function is routed
            const response = await fetch("http://localhost:8000/api/v1/expense/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // IMPORTANT: If your addExpense function uses req.user.id,
                    // you need to send an authentication token here (e.g., JWT).
                    // For testing without full auth, you might add a custom header:
                    'x-user-id': 'test-user-id-123', // REMOVE/REPLACE IN PRODUCTION
                },
                body: JSON.stringify(expenseData), // expenseData now contains icon, category, amount, date
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save expense.");
            }

            const result = await response.json();
            console.log("Expense saved successfully:", result);
            alert("Expense saved successfully!"); // Replace with a custom modal/notification
            setScannedExpense(null); // Clear the scanned data after saving
        } catch (error) {
            console.error("Error saving expense:", error);
            alert(`Error saving expense: ${error.message}`); // Replace with a custom modal/notification
        }
    };

    return (
        <div className="flex">
            <SideMenu activeMenu="dashboard" />

            <div className="flex-1 flex flex-col">
                <Navbar onScanComplete={handleScanComplete} activeMenu="dashboard" />

                <main className="p-4 flex-1 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>

                    {scannedExpense && (
                        <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Review & Save Scanned Expense</h2>
                            <ScanResult
                                scannedData={scannedExpense} // Pass the transformed data
                                onSave={handleSaveExpense}
                                onCancel={() => setScannedExpense(null)}
                            />
                        </div>
                    )}

                    {/* Your other dashboard content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                        <div className="bg-blue-100 p-4 rounded-lg shadow-sm">Total Spent: $1234.56</div>
                        <div className="bg-green-100 p-4 rounded-lg shadow-sm">Income: $2000.00</div>
                        <div className="bg-yellow-100 p-4 rounded-lg shadow-sm">Balance: $765.44</div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;