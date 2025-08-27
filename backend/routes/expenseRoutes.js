const express = require("express");
const multer = require("multer");
const {
    addExpense,
    getAllExpense,
    deleteExpense,
    downloadExpenseExcel
} = require("../controllers/expenseController");
const scanfileController = require("../controllers/scanfileController")
const {protect} = require("../middleware/authMiddleware");
const router = express.Router();
const upload = multer();

router.post("/add",protect,addExpense);
router.get("/getexpense",protect,getAllExpense);
router.get("/downloadexcel",protect,downloadExpenseExcel);
router.delete("/:id",protect,deleteExpense);
router.post("/expense-bill-info",upload.single("file"),scanfileController);

module.exports = router;