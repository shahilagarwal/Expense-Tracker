const User = require('../models/User');
const Expense = require('../models/Expense');
const xlsx = require('xlsx');


exports.addExpense = async(req,res)=>{
    const userId = req.user ? req.user.id : '60d5ec49f8c7e00015f8e2e0';
    try{
        const {icon,category,amount,date} = req.body;
        if (!category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required." });
        }
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number." });
        }
        const newExpense = new Expense({
            userId,
            icon :icon||'money-bill',
            category,
            amount,
            date:new Date(date)
        });
        await newExpense.save();
        res.status(201).json(newExpense);
    }
    catch(e){
        res.status(500).json({message:"Server Error"});
    } 
}

exports.getAllExpense = async(req,res)=>{
    const userId = req.user.id;
    try{
        const expense = await Expense.find({userId}).sort({date:-1});
        res.json(expense);
    }
    catch(e){
        res.status(500).json({message:"Server Error"});
    }
}

exports.deleteExpense = async(req,res)=>{
    const userId = req.user.id;
    try{
        await Expense.findByIdAndDelete(req.params.id);
        res.json({message:"Expense deleted successfully"});
    }
    catch(e){
        res.status(500).json({message:"Server Error"});
    }
}

exports.downloadExpenseExcel = async(req,res)=>{
    const userId = req.user.id;
    try{
        const expense = await Expense.find({userId}).sort({date:-1});

        //prepare data for Excel
        const data = expense.map((item)=>({
            category:item.category,
            Amount:item.amount,
            Date:item.date,
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb,ws,"Expense");
        xlsx.writeFile(wb,'expense_details.xlsx');
        res.download('expense_details.xlsx');
    }
    catch(e){
        res.status(500).json({message:"Server Error"});
    }
}