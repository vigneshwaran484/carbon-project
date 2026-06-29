const CarbonProject = require('../models/CarbonProject');

// GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await CarbonProject.aggregate([
            {
                $group: {
                    _id: '$userId',
                    totalCredits: { $sum: '$credits' },
                    totalCo2: { $sum: '$finalCo2' },
                    projectCount: { $sum: 1 },
                },
            },
            { $sort: { totalCredits: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    _id: 1,
                    totalCredits: 1,
                    totalCo2: 1,
                    projectCount: 1,
                    name: '$userInfo.name',
                    role: '$userInfo.role',
                    points: '$userInfo.points',
                },
            },
        ]);

        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
