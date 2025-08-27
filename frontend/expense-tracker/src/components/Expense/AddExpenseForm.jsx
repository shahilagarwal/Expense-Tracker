// import React, { useState } from 'react'
// import Input from '../Inputs/Input';
// import EmojiPickerPopup from '../layouts/EmojiPickerPopup';

// const AddExpenseForm = ({onAddExpense}) => {
//     const [income,setIncome] = useState({
//         category:"",
//         amount:"",
//         date:"",
//         icon:"",
//     });
//     const handleChange = (key,value)=>setIncome({...income,[key]:value});
//   return (
//     <div>
//         <EmojiPickerPopup
//             icon={income.icon}
//             onSelect={(selectedIcon)=> handleChange("icon",selectedIcon)}
//         />
//         <Input
//             value={income.category}
//             onChange={({target})=>handleChange("category",target.value)}
//             label="Category"
//             placeholder="Rent, Groceries,etc"
//             type="text"
//         />
//         <Input
//             value={income.amount}
//             onChange={({target})=>handleChange("amount",target.value)}
//             label="Amount"
//             placeholder=""
//             type="number"
//         />
//         <Input
//             value={income.date}
//             onChange={({target})=>handleChange("date",target.value)}
//             label="Date"
//             placeholder=""
//             type="date"
//         />
//         <div className="flex justify-end mt-6">
//             <button 
//                 type='button'
//                 className='add-btn add-btn-fill'
//                 onClick={()=>onAddExpense(income)}
//             >
//                 Add Expense
//             </button>
//         </div>
//     </div>
//   )
// }

// export default AddExpenseForm


//----------------------------------------------------------------------------------------------------------------


// AddExpenseForm.jsx

import React, { useState } from 'react';
import Input from '../Inputs/Input'; // Assuming this component exists
import EmojiPickerPopup from '../layouts/EmojiPickerPopup'; // Assuming this component exists

const AddExpenseForm = ({ onAddExpense }) => {
    // State for the expense data, renamed for clarity
    const [expense, setExpense] = useState({
        category: "",
        amount: "", // Keep as string initially for input type="number"
        date: "",
        icon: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Consistent list of categories (can be moved to a shared constants file)
    const categories = [
        'Food & Dining', 'Groceries', 'Transportation', 'Health',
        'Shopping', 'Utilities', 'Entertainment', 'Miscellaneous'
    ];

    const handleChange = (key, value) => {
        setError(null); // Clear error on input change
        setExpense(prevExpense => ({
            ...prevExpense,
            [key]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setIsLoading(true);
        setError(null); // Clear previous errors

        // Client-side validation
        if (!expense.category || !expense.amount || !expense.date || !expense.icon) {
            setError("All fields (Category, Amount, Date, Icon) are required.");
            setIsLoading(false);
            return;
        }

        const parsedAmount = parseFloat(expense.amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Amount must be a positive number.");
            setIsLoading(false);
            return;
        }

        try {
            // Call the onAddExpense prop with the validated and parsed data
            // Ensure the amount is a number when passing
            await onAddExpense({
                ...expense,
                amount: parsedAmount,
            });
            // Clear the form after successful submission
            setExpense({
                category: "",
                amount: "",
                date: "",
                icon: "",
            });
        } catch (err) {
            // Error from the onAddExpense function (e.g., API call failure)
            setError(err.message || "Failed to add expense. Please try again.");
            console.error("Error adding expense:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Add New Expense</h3>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            <div className="mb-4">
                <label htmlFor="icon" className="block text-gray-700 text-sm font-bold mb-2">
                    Icon:
                </label>
                <EmojiPickerPopup
                    icon={expense.icon}
                    onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
                />
                {/* Optional: Display Font Awesome icon preview if you integrate it */}
                {/* {expense.icon && (
                    <FontAwesomeIcon icon={expense.icon} className="ml-2 text-xl text-gray-600" />
                )} */}
            </div>

            <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
                    Category:
                </label>
                <select
                    id="category"
                    name="category"
                    value={expense.category}
                    onChange={({ target }) => handleChange("category", target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <Input
                value={expense.amount}
                onChange={({ target }) => handleChange("amount", target.value)}
                label="Amount"
                placeholder="e.g., 50.00"
                type="number"
                name="amount" // Add name prop for consistency
            />

            <Input
                value={expense.date}
                onChange={({ target }) => handleChange("date", target.value)}
                label="Date"
                placeholder=""
                type="date"
                name="date" // Add name prop for consistency
            />

            <div className="flex justify-end mt-6">
                <button
                    type='submit' // Changed to submit type
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
                    ) : (
                        <span>Add Expense</span>
                    )}
                </button>
            </div>
        </form>
    );
};

export default AddExpenseForm;
