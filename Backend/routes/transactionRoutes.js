const express = require("express");

const {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction,
} = require("../controllers/transactionController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ===================== CREATE =====================
router.post("/", authMiddleware, addTransaction);

// ===================== READ =====================
router.get("/", authMiddleware, getTransactions);

// ===================== DELETE =====================
router.delete("/:id", authMiddleware, deleteTransaction);

// ===================== UPDATE =====================
router.put("/:id", authMiddleware, updateTransaction);

module.exports = router;