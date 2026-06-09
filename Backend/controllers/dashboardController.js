const Transaction = require("../models/Transaction");

const getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const transactions = await Transaction.find({ userId });

        let income = 0;
        let expense = 0;

        transactions.forEach((t) => {
            if (t.type === "income") {
                income += t.amount;
            } else {
                expense += t.amount;
            }
        });

        const balance = income - expense;

        let insight = "Your spending looks healthy.";

        if (income > 0) {
            const spendingPercentage = (expense / income) * 100;

            if (spendingPercentage >= 80) {
                insight = "⚠️ You have spent more than 80% of your income.";
            } else if (spendingPercentage >= 50) {
                insight = "📊 You have spent more than 50% of your income.";
            } else {
                insight = "✅ Great! Your expenses are under control.";
            }
        }

        res.json({
            income,
            expense,
            balance,
            insight,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = { getDashboard };