const { triggerEngagementEmail, sendAdminSummaryReport } = require('../API/mailer');
const User = require('../models/userModel');
const ActivityLog = require('../models/ActivityLog.model');
const { emitEngagementSummary } = require('./socket');

async function cleanOldActivityLogs() {
    const now = new Date();
    const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

    try {
        const result = await ActivityLog.deleteMany({
            action: { $in: ['login'] },
            createdAt: { $lt: ninetyDaysAgo },
        });
        console.log(`✅ Cleaned ${result.deletedCount} old login logs.`);
    } catch (err) {
        console.error('❌ Error cleaning old activity logs:', err);
    }
}

async function getUserEngagementSummary() {
    const now = new Date();
    const summary = {
        timestamp: now,
        stages: {
            active: [],
            idle: [],
            at_risk: [],
            churned: []
        },
        counts: {
            active: 0,
            idle: 0,
            at_risk: 0,
            churned: 0
        },
        total: 0,
        metrics: {
            userDistribution: {
                premium: {
                    count: 0,
                    percentage: 0,
                    description: "Users who have purchased courses"
                },
                certified: {
                    count: 0,
                    percentage: 0,
                    description: "Users who have earned certificates"
                },
                verified: {
                    count: 0,
                    percentage: 0,
                    description: "Users with verified email addresses"
                }
            },
            engagementStatus: {
                description: "Current distribution of users across engagement stages",
                stages: {
                    active: {
                        count: 0,
                        percentage: 0
                    },
                    idle: {
                        count: 0,
                        percentage: 0
                    },
                    at_risk: {
                        count: 0,
                        percentage: 0
                    },
                    churned: {
                        count: 0,
                        percentage: 0
                    }
                }
            }
        }
    };

    // Get engagement data
    const userEngagementData = await ActivityLog.aggregate([
        {
            $match: {
                action: 'login',
                user: { $ne: null }
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: '$user',
                lastLoginAt: { $first: '$createdAt' },
                isLegacyRecord: { $max: '$isLegacyMigration' }
            }
        },
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
                _id: 1,
                lastLoginAt: 1,
                isLegacyRecord: 1,
                email: '$user.email',
                name: {
                    $cond: {
                        if: { $and: ['$user.firstName', '$user.lastName'] },
                        then: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                        else: {
                            $cond: {
                                if: '$user.firstName',
                                then: '$user.firstName',
                                else: {
                                    $cond: {
                                        if: '$user.lastName',
                                        then: '$user.lastName',
                                        else: 'Unknown User'
                                    }
                                }
                            }
                        }
                    }
                },
                role: '$user.role',
                purchasedCourses: '$user.purchasedCourses',
                certificatesOwned: '$user.certificatesOwned',
                isVerified: '$user.isVerified',
                accountCreatedAt: '$user.accountCreatedAt'
            }
        }
    ]);

    let premiumUserCount = 0;
    let certifiedUserCount = 0;
    let verifiedUserCount = 0;

    for (const userData of userEngagementData) {
        const daysSinceLastLogin = Math.floor((now - userData.lastLoginAt) / (1000 * 60 * 60 * 24));

        let currentStage = 'active';
        if (daysSinceLastLogin >= 7 && daysSinceLastLogin <= 14) {
            currentStage = 'idle';
        } else if (daysSinceLastLogin >= 15 && daysSinceLastLogin <= 30) {
            currentStage = 'at_risk';
        } else if (daysSinceLastLogin > 30) {
            currentStage = 'churned';
        }

        // Count premium users
        if (userData.purchasedCourses?.length > 0) {
            premiumUserCount++;
        }

        // Count certified users
        if (userData.certificatesOwned?.length > 0) {
            certifiedUserCount++;
        }

        // Count verified users
        if (userData.isVerified) {
            verifiedUserCount++;
        }

        summary.stages[currentStage].push({
            id: userData._id,
            email: userData.email,
            name: userData.name,
            lastLogin: userData.lastLoginAt,
            daysSinceLogin: daysSinceLastLogin,
            role: userData.role,
            isVerified: userData.isVerified,
            hasPurchases: userData.purchasedCourses?.length > 0,
            hasCertificates: userData.certificatesOwned?.length > 0
        });

        summary.counts[currentStage]++;
        summary.total++;
    }

    // Calculate user distribution percentages
    if (userEngagementData.length > 0) {
        summary.metrics.userDistribution = {
            premium: {
                count: premiumUserCount,
                percentage: Math.round((premiumUserCount / userEngagementData.length) * 100),
                description: "Users who have purchased courses"
            },
            certified: {
                count: certifiedUserCount,
                percentage: Math.round((certifiedUserCount / userEngagementData.length) * 100),
                description: "Users who have earned certificates"
            },
            verified: {
                count: verifiedUserCount,
                percentage: Math.round((verifiedUserCount / userEngagementData.length) * 100),
                description: "Users with verified email addresses"
            }
        };

        // Calculate engagement stage percentages
        summary.metrics.engagementStatus.stages = {
            active: {
                count: summary.counts.active,
                percentage: Math.round((summary.counts.active / summary.total) * 100)
            },
            idle: {
                count: summary.counts.idle,
                percentage: Math.round((summary.counts.idle / summary.total) * 100)
            },
            at_risk: {
                count: summary.counts.at_risk,
                percentage: Math.round((summary.counts.at_risk / summary.total) * 100)
            },
            churned: {
                count: summary.counts.churned,
                percentage: Math.round((summary.counts.churned / summary.total) * 100)
            }
        };
    }

    return summary;
}

async function processUserEngagementStages() {
    const now = new Date();
    const updatedUsers = [];

    const userLastLogins = await ActivityLog.aggregate([
        {
            $match: {
                action: 'login',
                user: { $ne: null }
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: '$user',
                lastLoginAt: { $first: '$createdAt' },
            }
        }
    ]);

    for (const login of userLastLogins) {
        const userId = login._id;
        const lastLoginAt = login.lastLoginAt;
        const daysSinceLastLogin = Math.floor((now - lastLoginAt) / (1000 * 60 * 60 * 24));

        let newStage = 'active';
        if (daysSinceLastLogin >= 7 && daysSinceLastLogin <= 14) {
            newStage = 'idle';
        } else if (daysSinceLastLogin >= 15 && daysSinceLastLogin <= 30) {
            newStage = 'at_risk';
        } else if (daysSinceLastLogin > 30) {
            newStage = 'churned';
        }

        const user = await User.findById(userId);
        if (!user) continue;

        if (user.engagementStage !== newStage) {
            user.engagementStage = newStage;
            user.lastEngagementEmailSent = now;
            await user.save();

            await triggerEngagementEmail(user, newStage);
            updatedUsers.push({
                email: user.email,
                stage: newStage,
                daysSinceLastLogin
            });
        }
    }

    await sendAdminSummaryReport(updatedUsers);
    emitEngagementSummary({
        timestamp: now,
        updatedCount: updatedUsers.length,
        updatedUsers,
    });

    console.log('Engagement stage processing completed', {
        processedUsers: userLastLogins.length,
        updatedUsers: updatedUsers.length
    });
}

module.exports = { processUserEngagementStages, cleanOldActivityLogs, getUserEngagementSummary }