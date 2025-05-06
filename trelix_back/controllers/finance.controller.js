const FinancialEvent = require('../models/FinancialEvent');
const User = require('../models/userModel');

const getRecentTransactions = async (req, res) => {
    try {
        const transactions = await FinancialEvent.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('user', 'firstName lastName'); 
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

const getAvgTimeToFirstPurchase = async (req, res) => {
    try {
        const result = await FinancialEvent.aggregate([
            { $match: { amount: { $lt: 0 }, type: 'debit' } },
            { $sort: { createdAt: 1 } },
            { $group: { _id: '$user', firstPurchaseDate: { $first: '$createdAt' } } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    daysSinceSignup: {
                        $divide: [{ $subtract: ['$firstPurchaseDate', '$user.createdAt'] }, 1000 * 60 * 60 * 24]
                    }
                }
            },
            { $group: { _id: null, avgDaysToFirstPurchase: { $avg: '$daysSinceSignup' } } }
        ]);
        const avg = result[0]?.avgDaysToFirstPurchase || 0;
        res.json({ avgDaysToFirstPurchase: avg });
    } catch (error) {
        console.error('Error calculating average time to first purchase:', error);
        res.status(500).json({ error: 'Failed to calculate average time' });
    }
};

const getTopSpenders = async (req, res) => {
    try {
        const result = await FinancialEvent.aggregate([
            { $match: { amount: { $lt: 0 }, type: 'debit' } },
            { $group: { _id: '$user', totalSpent: { $sum: '$amount' } } },
            { $sort: { totalSpent: 1 } }, 
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    userId: '$_id',
                    name: '$user.username',
                    totalSpent: 1
                }
            }
        ]);
        res.json(result);
    } catch (error) {
        console.error('Error fetching top spenders:', error);
        res.status(500).json({ error: 'Failed to fetch top spenders' });
    }
};

const getTotalRevenue = async (req, res) => {
    try {
        const result = await FinancialEvent.aggregate([
            { $match: { amount: { $gt: 0 }, type: 'credit' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const total = result[0]?.total || 0;
        res.json({ totalRevenue: total });
    } catch (error) {
        console.error('Error calculating total revenue:', error);
        res.status(500).json({ error: 'Failed to calculate total revenue' });
    }
};

module.exports = {
    getRecentTransactions,
    getAvgTimeToFirstPurchase,
    getTopSpenders,
    getTotalRevenue
};
