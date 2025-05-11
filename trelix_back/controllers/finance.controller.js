const FinancialEvent = require('../models/FinancialEvent');
const User = require('../models/userModel');
const Pack = require('../models/packs.model');
const PDFDocument = require("pdfkit");
const stream = require("stream");
const { Parser } = require("json2csv");

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

const getPackAnalytics = async (req, res) => {
    const { id } = req.params;

    try {
        const pack = await Pack.findById(id);
        if (!pack) return res.status(404).json({ message: "Pack not found" });

        const events = await FinancialEvent.find({
            relatedObject: id,
            relatedModel: 'Product',
            type: 'balance_topup',
        }).sort({ createdAt: -1 });

        const totalPurchases = events.length;
        const uniqueBuyers = new Set(events.map((e) => e.user.toString())).size;
        const lastPurchase = events[0]?.createdAt || null;

        const allPacks = await Pack.find();
        const packStats = await Promise.all(
            allPacks.map(async (p) => {
                const count = await FinancialEvent.countDocuments({
                    relatedObject: p._id,
                    relatedModel: 'Product',
                    type: 'balance_topup',
                });
                return { id: p._id.toString(), count };
            })
        );

        const sorted = packStats.sort((a, b) => b.count - a.count);
        const rank = sorted.findIndex((p) => p.id === id) + 1;

        res.json({
            totalPurchases,
            uniqueBuyers,
            lastPurchase,
            rank,
            totalPacks: allPacks.length,
        });
    } catch (err) {
        console.error("Failed to get pack analytics:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


const generatePDF = (transactions) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        doc.fontSize(18).text("User Transactions Report", { align: "center" });
        doc.moveDown();

        transactions.forEach((txn, index) => {
            doc
                .fontSize(12)
                .fillColor("black")
                .text(`#${index + 1}`, { continued: true })
                .text(` | ${new Date(txn.createdAt).toLocaleString()}`);

            doc
                .fontSize(10)
                .fillColor("gray")
                .text(`User: ${txn.user.firstName} ${txn.user.lastName} (${txn.user.email})`)
                .text(`Type: ${txn.type}`)
                .text(`Amount: ${txn.amount} | Balance: ${txn.balanceBefore} ➝ ${txn.balanceAfter}`)
                .text(`Metadata: ${JSON.stringify(txn.metadata)}`)
                .moveDown();
        });

        doc.end();
    });
};



const generateCSV = (transactions) => {
    const fields = [
        { label: "Date", value: (row) => new Date(row.createdAt).toLocaleString() },
        { label: "User", value: (row) => `${row.user.firstName} ${row.user.lastName}` },
        { label: "Email", value: (row) => row.user.email },
        { label: "Type", value: "type" },
        { label: "Amount", value: "amount" },
        { label: "Balance Before", value: "balanceBefore" },
        { label: "Balance After", value: "balanceAfter" },
        { label: "Metadata", value: (row) => JSON.stringify(row.metadata) },
    ];

    const parser = new Parser({ fields });
    return parser.parse(transactions);
};

const getDateRange = (range) => {
    const now = new Date();
    switch (range) {
        case 'week': return new Date(now.setDate(now.getDate() - 7));
        case 'month': return new Date(now.setMonth(now.getMonth() - 1));
        case '3months': return new Date(now.setMonth(now.getMonth() - 3));
        case '6months': return new Date(now.setMonth(now.getMonth() - 6));
        default: return null;
    }
};

const exportTransactions = async (req, res) => {
    const { userId, type, range, format } = req.query;
    const fromDate = getDateRange(range);
    const filter = {};

    if (userId) filter.user = userId;
    if (type && type !== "all") {
        filter.type = { $in: Array.isArray(type) ? type : [type] };
    }
    if (fromDate) filter.createdAt = { $gte: fromDate };

    try {
        const transactions = await FinancialEvent.find(filter)
            .populate('user', 'firstName lastName email') // email added
            .sort({ createdAt: -1 });

        if (format === 'csv') {
            const csv = generateCSV(transactions);
            res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
            res.setHeader('Content-Type', 'text/csv');
            return res.send(csv);
        } else if (format === 'pdf') {
            const pdf = await generatePDF(transactions); // <-- await here
            res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            return res.send(pdf);
        }

        res.status(400).json({ error: "Invalid format specified." });
    } catch (error) {
        console.error('Export failed:', error);
        res.status(500).json({ error: 'Failed to export transactions' });
    }
};



module.exports = {
    getRecentTransactions,
    getAvgTimeToFirstPurchase,
    getTopSpenders,
    getTotalRevenue,
    getPackAnalytics,
    exportTransactions
};
