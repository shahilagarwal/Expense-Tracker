import React, { useState, useRef } from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { MdOutlineDocumentScanner } from "react-icons/md";
import SideMenu from "./SideMenu";
// import ScanResult from '../Cards/ScanResult'; // Uncomment when you create/use it

const Navbar = ({ activeMenu, onScanComplete }) => { // Added onScanComplete prop
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [scanError, setScanError] = useState(null);
    // const [scannedData, setScannedData] = useState(null); // State to hold scanned data, if displayed directly in Navbar's parent

    const fileInputRef = useRef();

    const handleScanClick = () => {
        setScanError(null); // Clear previous errors on new scan attempt
        fileInputRef.current.click();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true); // Start loading
        setScanError(null); // Clear any previous errors

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/api/v1/expense/expense-bill-info", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                // Server responded with an error status (e.g., 400, 500)
                const errorMessage = data.message || data.error || "An unknown error occurred during scan.";
                setScanError(errorMessage);
                console.error("Backend Error Response:", data);
                // If you want to stop processing here, you can return
                return;
            }

            console.log("Structured Bill Info:", data);
            // setScannedData(data.structured); // If you want to store it in Navbar's state

            // Call a prop function to pass the scanned data up to a parent component
            // The parent can then decide how to display the ScanResult or integrate it.
            if (onScanComplete) {
                onScanComplete(data);
            }

        } catch (error) {
            // Network errors (e.g., server not reachable, CORS issues)
            setScanError("Network error: Could not connect to the server. Please check your server status.");
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false); // End loading
            // Clear the file input value to allow re-uploading the same file if needed
            e.target.value = null;
        }
    };

    return (
        <div className="flex gap-5 bg-white border border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30">
            <button
                className='block lg:hidden text-black'
                onClick={() => {
                    setOpenSideMenu(!openSideMenu);
                }}
            >
                {openSideMenu ? (
                    <HiOutlineX className='text-2xl' />
                ) : (
                    <HiOutlineMenu className='text-2xl' />
                )}
            </button>
            <h2 className="text-lg font-medium text-black whitespace-nowrap">Expense Tracker</h2>

            <input
                type="file"
                accept='image/*,application/pdf'
                className='hidden'
                ref={fileInputRef}
                onChange={handleFileUpload}
            />

            <div className="w-full flex justify-end items-center">
                <button
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors duration-200"
                    onClick={handleScanClick}
                    disabled={isLoading} // Disable button while loading
                >
                    {isLoading ? (
                        <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
                    ) : (
                        <MdOutlineDocumentScanner className='text-xl' />
                    )}
                    <span className="hidden sm:inline">{isLoading ? "Scanning..." : "Scan Bill"}</span>
                </button>
            </div>

            {scanError && (
                <div className="absolute top-full left-0 right-0 p-2 bg-red-100 text-red-700 text-sm rounded-b-md shadow-lg z-40">
                    Error: {scanError}
                </div>
            )}

            {openSideMenu && (
                <div className="fixed top-[61px] -ml-4 bg-white z-20"> {/* Adjusted z-index */}
                    <SideMenu activeMenu={activeMenu} />
                </div>
            )}

            {/* {scannedData && <ScanResult data={scannedData} />} */}
            {/* The ScanResult component should likely be rendered by a parent component
                that receives 'scannedData' via a prop from Navbar, or directly manages
                the state that Navbar updates via 'onScanComplete'. */}
        </div>
    );
};

export default Navbar;
