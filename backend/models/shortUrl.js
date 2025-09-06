import mongoose, { model } from "mongoose";

const shortUrlSchema = new mongoose.Schema({
    shortId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    redirectUrl: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Please provide a valid URL starting with http:// or https://'
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, 
        index: true 
    },
    isPublic: {
        type: Boolean,
        default: false 
    },
    customAlias: {
        type: String,
        default: null,
        sparse: true,
        minlength: 3,
        maxlength: 50
    },
    expiryDate: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    visitHistory: [
        {
            timestamp: {
                type: Date,
                default: Date.now
            },
        }
    ],
    metadata: {
        title: {
            type: String,
            default: null
        },
        description: {
            type: String,
            default: null
        },
        domain: {
            type: String,
            default: null
        },
        favicon: {
            type: String,
            default: null
        }
    },
    clickCount: {
        type: Number,
        default: 0
    },
    lastAccessedAt: {
        type: Date,
        default: null
    }
}, { 
    timestamps: true,
    indexes: [
        { userId: 1, createdAt: -1 }, 
        { userId: 1, clickCount: -1 }, 
        { shortId: 1 }, 
        { expiryDate: 1 },
    ]
});

shortUrlSchema.methods.isExpired = function() {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
};

shortUrlSchema.methods.addVisit = function(ip = null, userAgent = null, referrer = null) {
    this.visitHistory.push({
        timestamp: new Date(),
        ip,
        userAgent,
        referrer
    });
    this.clickCount += 1;
    this.lastAccessedAt = new Date();
    return this.save();
};

shortUrlSchema.statics.getUserUrls = function(userId, options = {}) {
    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = ''
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build query
    const query = { 
        userId,
        isActive: true
    };

    // Add search if provided
    if (search) {
        query.$or = [
            { redirectUrl: { $regex: search, $options: 'i' } },
            { shortId: { $regex: search, $options: 'i' } },
            { customAlias: { $regex: search, $options: 'i' } }
        ];
    }

    return this.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email');
};

shortUrlSchema.statics.getUserStats = function(userId) {
    return this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), isActive: true } },
        {
            $group: {
                _id: null,
                totalUrls: { $sum: 1 },
                totalClicks: { $sum: '$clickCount' },
                avgClicksPerUrl: { $avg: '$clickCount' },
                mostRecentUrl: { $max: '$createdAt' }
            }
        }
    ]);
};

export const ShortUrl = model("ShortUrl", shortUrlSchema);
