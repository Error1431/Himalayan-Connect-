const PageView = require('../models/PageView');
const User = require('../models/User');

// POST /api/analytics/track
// Body: { path, sessionId, referrer }
// Called once per page navigation from the frontend (see
// Frontend/src/utils/analytics.js). Fire-and-forget from the client's
// perspective — failures here should never block the user's actual page.
exports.trackPageView = async (req, res) => {
  try {
    const { path, sessionId, referrer } = req.body;
    if (!path) {
      return res.status(400).json({ success: false, message: 'path is required' });
    }

    await PageView.create({
      path,
      sessionId: sessionId || undefined,
      user: req.user?.id || req.user?._id || null,
      userAgent: req.headers['user-agent'],
      referrer: referrer || req.headers['referer'] || '',
    });

    res.status(201).json({ success: true });
  } catch (error) {
    // Analytics failing should never surface as an error to the user.
    res.status(200).json({ success: false });
  }
};

// GET /api/analytics/summary
// Admin-only. Returns visit counts, unique-visitor estimate, registered
// user counts, and simple time-series/breakdown data for a dashboard.
exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const since24h = new Date(now - 24 * 60 * 60 * 1000);
    const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const since30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalViews,
      views24h,
      views7d,
      views30d,
      totalUsers,
      usersByRole,
      newUsers7d,
      topPages,
      dailySeries,
    ] = await Promise.all([
      PageView.countDocuments({}),
      PageView.countDocuments({ createdAt: { $gte: since24h } }),
      PageView.countDocuments({ createdAt: { $gte: since7d } }),
      PageView.countDocuments({ createdAt: { $gte: since30d } }),
      User.countDocuments({}),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.countDocuments({ createdAt: { $gte: since7d } }),
      PageView.aggregate([
        { $match: { createdAt: { $gte: since30d } } },
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      PageView.aggregate([
        { $match: { createdAt: { $gte: since30d } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            views: { $sum: 1 },
            uniqueSessions: { $addToSet: '$sessionId' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Unique-visitor estimate over the last 30 days (distinct anonymous
    // session ids — not perfectly precise, but a real, honest approximation
    // rather than a fake number, and doesn't require cookies/tracking pixels).
    const uniqueSessions30d = (await PageView.distinct('sessionId', { createdAt: { $gte: since30d } })).filter(Boolean).length;

    res.status(200).json({
      success: true,
      traffic: {
        totalViews,
        views24h,
        views7d,
        views30d,
        uniqueVisitors30d: uniqueSessions30d,
        topPages: topPages.map((p) => ({ path: p._id, views: p.count })),
        dailySeries: dailySeries.map((d) => ({ date: d._id, views: d.views, uniqueVisitors: d.uniqueSessions.filter(Boolean).length })),
      },
      users: {
        total: totalUsers,
        newLast7Days: newUsers7d,
        byRole: usersByRole.reduce((acc, r) => ({ ...acc, [r._id || 'unknown']: r.count }), {}),
      },
    });
  } catch (error) {
    console.error('Analytics summary error:', error.message);
    res.status(500).json({ success: false, message: 'Could not load analytics' });
  }
};
