import mongoose from "mongoose"
import { ShortUrl } from "../models/shortUrl.js"
import {nanoid} from "nanoid"

async function handleGenerateNewShortUrl(req, res) {
    try {
        const { url: redirectUrl, customAlias, expiryDate, isPublic } = req.body;
        
        const userId = req.user ? req.user._id : null;

        if (!redirectUrl) {
            return res.status(400).json({
                success: false,
                message: 'URL is required'
            });
        }

        // Check if custom alias is available
        let shortId;
        if (customAlias) {
            const existingAlias = await ShortUrl.findOne({ 
                $or: [
                    { shortId: customAlias },
                    { customAlias: customAlias }
                ]
            });
            
            if (existingAlias) {
                return res.status(409).json({
                    success: false,
                    message: 'Custom alias already exists'
                });
            }
            
            shortId = customAlias;
        } else {
            shortId = nanoid(8);
            
            // Ensure uniqueness
            let attempts = 0;
            while (await ShortUrl.findOne({ shortId }) && attempts < 5) {
                shortId = nanoid(8);
                attempts++;
            }
            
            if (attempts === 5) {
                return res.status(500).json({
                    success: false,
                    message: 'Unable to generate unique short ID'
                });
            }
        }

        const shortUrl = await ShortUrl.create({
            shortId,
            redirectUrl,
            userId,
            customAlias: customAlias || null,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            isPublic: isPublic || false,
            visitHistory: [],
            clickCount: 0
        });

        res.status(201).json({
            success: true,
            message: 'Short URL created successfully',
            data: {
                shortId: shortUrl.shortId,
                shortUrl: `${req.protocol}://${req.get('host')}/${shortUrl.shortId}`,
                redirectUrl: shortUrl.redirectUrl,
                customAlias: shortUrl.customAlias,
                expiryDate: shortUrl.expiryDate,
                createdAt: shortUrl.createdAt,
                isPublic: shortUrl.isPublic
            }
        });

    } catch (error) {
        console.error('Error creating short URL:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function handleRedirect(req, res) {
    try {
        const shortId = req.params.shortId;
        
        const entry = await ShortUrl.findOne({ shortId, isActive: true });
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Short URL not found'
            });
        }

        if (entry.isExpired()) {
            return res.status(410).json({
                success: false,
                message: 'This short URL has expired'
            });
        }

        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const referrer = req.get('Referer') || req.get('Referrer');
        
        setImmediate(() => {
            entry.addVisit(ip, userAgent, referrer);
        });

        return res.redirect(entry.redirectUrl);

    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function handleGetAnalytics(req, res) {
    try {
        const shortId = req.params.shortId;
        const userId = req.user ? req.user._id : null;
        
        const query = { shortId, isActive: true };
        if (!userId) {
            query.isPublic = true; 
        } else {
            query.$or = [
                { userId },
                { isPublic: true }
            ];
        }
        
        const entry = await ShortUrl.findOne(query);
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Short URL not found or access denied'
            });
        }

        const analytics = {
            shortId: entry.shortId,
            redirectUrl: entry.redirectUrl,
            totalClicks: entry.clickCount,
            createdAt: entry.createdAt,
            lastAccessedAt: entry.lastAccessedAt,
            isExpired: entry.isExpired(),
            expiryDate: entry.expiryDate,
            visitHistory: entry.visitHistory.map(visit => ({
                timestamp: visit.timestamp,
            })),
            dailyClicks: getDailyClickData(entry.visitHistory)
        };

        res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
}

async function handleGetUserUrls(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = ''
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder,
            search
        };

        const urls = await ShortUrl.getUserUrls(req.user._id, options);
        
        // Get total count for pagination
        const totalQuery = { userId: req.user._id, isActive: true };
        if (search) {
            totalQuery.$or = [
                { redirectUrl: { $regex: search, $options: 'i' } },
                { shortId: { $regex: search, $options: 'i' } },
                { customAlias: { $regex: search, $options: 'i' } }
            ];
        }
        const total = await ShortUrl.countDocuments(totalQuery);

        const formattedUrls = urls.map(url => ({
            id: url._id,
            shortId: url.shortId,
            shortUrl: `${req.protocol}://${req.get('host')}/${url.shortId}`,
            redirectUrl: url.redirectUrl,
            customAlias: url.customAlias,
            clickCount: url.clickCount,
            createdAt: url.createdAt,
            lastAccessedAt: url.lastAccessedAt,
            isPublic: url.isPublic,
            expiryDate: url.expiryDate,
            isExpired: url.isExpired(),
            metadata: url.metadata
        }));

        res.status(200).json({
            success: true,
            data: {
                urls: formattedUrls,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get user URLs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching URLs'
        });
    }
}

async function handleUpdateUrl(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const shortId = req.params.shortId;
        const { customAlias, expiryDate, isPublic } = req.body;

        const url = await ShortUrl.findOne({ shortId, userId: req.user._id });
        
        if (!url) {
            return res.status(404).json({
                success: false,
                message: 'URL not found or access denied'
            });
        }

        if (customAlias && customAlias !== url.customAlias) {
            const existingAlias = await ShortUrl.findOne({ 
                $or: [
                    { shortId: customAlias },
                    { customAlias: customAlias }
                ],
                _id: { $ne: url._id }
            });
            
            if (existingAlias) {
                return res.status(409).json({
                    success: false,
                    message: 'Custom alias already exists'
                });
            }
        }

        if (customAlias !== undefined) url.customAlias = customAlias || null;
        if (expiryDate !== undefined) url.expiryDate = expiryDate ? new Date(expiryDate) : null;
        if (isPublic !== undefined) url.isPublic = isPublic;

        await url.save();

        res.status(200).json({
            success: true,
            message: 'URL updated successfully',
            data: {
                shortId: url.shortId,
                customAlias: url.customAlias,
                expiryDate: url.expiryDate,
                isPublic: url.isPublic
            }
        });

    } catch (error) {
        console.error('Update URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating URL'
        });
    }
}

async function handleDeleteUrl(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const shortId = req.params.shortId;
        
        const url = await ShortUrl.findOne({ shortId, userId: req.user._id });
        
        if (!url) {
            return res.status(404).json({
                success: false,
                message: 'URL not found or access denied'
            });
        }

        url.isActive = false;
        await url.save();

        res.status(200).json({
            success: true,
            message: 'URL deleted successfully'
        });

    } catch (error) {
        console.error('Delete URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting URL'
        });
    }
}

async function handleGetUserStats(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const stats = await ShortUrl.getUserStats(req.user._id);
        
        const userStats = stats[0] || {
            totalUrls: 0,
            totalClicks: 0,
            avgClicksPerUrl: 0,
            mostRecentUrl: null
        };

        res.status(200).json({
            success: true,
            data: userStats
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user statistics'
        });
    }
}

function getDailyClickData(visitHistory) {
    const dailyClicks = {};
    
    visitHistory.forEach(visit => {
        const date = new Date(visit.timestamp).toISOString().split('T')[0];
        dailyClicks[date] = (dailyClicks[date] || 0) + 1;
    });

    return Object.entries(dailyClicks).map(([date, clicks]) => ({
        date,
        clicks
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
}

export { 
    handleGenerateNewShortUrl, 
    handleRedirect, 
    handleGetAnalytics,
    handleGetUserUrls,
    handleUpdateUrl,
    handleDeleteUrl,
    handleGetUserStats
};