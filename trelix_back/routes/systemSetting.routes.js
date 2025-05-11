const express = require('express');
const SystemSetting = require('../models/SystemSetting.model');
const { getUserEngagementSummary } = require('../utils/getInactiveUsers');
const router = express.Router();

router.get('/api/system-settings', async (req, res) => {
    try {
        const allSettings = await SystemSetting.find({});
        const adminEmailsSetting = allSettings.find(setting => setting.key === 'admin_emails');
        const visibleSettings = allSettings.filter(setting => setting.key !== 'admin_emails');
        const response = {
            settings: visibleSettings,
            notificationRecipients: adminEmailsSetting ? adminEmailsSetting.value : []
        };

        res.json(response);
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.put('/api/system-settings/:id', async (req, res) => {
    const { value } = req.body;
    try {
        const setting = await SystemSetting.findById(req.params.id);
        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }
        setting.value = value;
        await setting.save();
        res.json(setting);
    } catch (err) {
        console.error('Error updating setting:', err);
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

// POST /api/system-settings
router.post('/api/system-settings/add', async (req, res) => {
    const { key, description, value } = req.body;
    try {
        const newSetting = new SystemSetting({ key, description, value });
        await newSetting.save();
        res.status(201).json(newSetting);
    } catch (err) {
        console.error('Error creating setting:', err);
        res.status(500).json({ error: 'Failed to create setting' });
    }
});

router.get('/api/user-engagement/summary', async (req, res) => {
    try {
        const summary = await getUserEngagementSummary();
        const format = req.query.format || 'full';

        if (format === 'minimal') {
            // Minimal format - just essential counts and key metrics
            res.json({
                success: true,
                timestamp: summary.timestamp,
                counts: summary.counts,
                total: summary.total,
                metrics: {
                    userDistribution: {
                        premium: summary.metrics.userDistribution.premium,
                        certified: summary.metrics.userDistribution.certified
                    },
                    engagementStatus: {
                        stages: summary.metrics.engagementStatus.stages
                    }
                }
            });
        } else {
            // Full format - return everything
            res.json({
                success: true,
                ...summary
            });
        }
    } catch (error) {
        console.error('Error fetching engagement summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate engagement summary',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;