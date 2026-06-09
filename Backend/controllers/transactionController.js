const Transaction = require("../models/Transaction");

// ===================== ADD TRANSACTION =====================
const addTransaction = async (req, res) => {
    try {
        const { type, amount, category, description } = req.body;

        if (!type || !amount || !category) {
            return res.status(400).json({
                message: "Required fields missing",
            });
        }

        const transaction = await Transaction.create({
            userId: req.user.id,
            type,
            amount,
            category,
            description,
        });

        res.status(201).json({
            message: "Transaction Added Successfully",
            transaction,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===================== GET TRANSACTIONS =====================
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            userId: req.user.id,
        }).sort({ createdAt: -1 }); // latest first

        res.status(200).json(transactions);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===================== DELETE TRANSACTION =====================
const deleteTransaction = async (req, res) => {
    try {
        const deleted = await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!deleted) {
            return res.status(404).json({
                message: "Transaction not found",
            });
        }

        res.status(200).json({
            message: "Transaction Deleted Successfully",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===================== UPDATE TRANSACTION =====================
const updateTransaction = async (req, res) => {
    try {
        const updated = await Transaction.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.id,
            },
            {
                $set: req.body,
            },
            {
                new: true,
            }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Transaction not found",
            });
        }

        res.status(200).json({
            message: "Transaction Updated Successfully",
            transaction: updated,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===================== EXPORT =====================
module.exports = {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction,
};