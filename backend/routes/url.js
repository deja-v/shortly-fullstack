import express from 'express';
import {
    handleGenerateNewShortUrl,
    handleRedirect,
    handleGetAnalytics,
    handleGetUserUrls,
    handleUpdateUrl,
    handleDeleteUrl,
    handleGetUserStats
} from '../controllers/url.js';
import { authenticateToken, optionalAuth } from '../middlewares/auth.middleware.js';
import { urlShortenRateLimit, generalRateLimit } from '../middlewares/rateLimiter.js';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

export const validateUrlCreation = [
    body('url')
        .isURL()
        .withMessage('Please provide a valid URL')
        .isLength({ max: 2048 })
        .withMessage('URL too long'),
    body('customAlias')
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage('Custom alias must be 3-50 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),
    body('expiryDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid expiry date format'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

export const validateShortId = [
    param('shortId')
        .isLength({ min: 1, max: 50 })
        .withMessage('Invalid short ID'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid short ID'
            });
        }
        next();
    }
];


router.post('/shorten', 
    urlShortenRateLimit,
    optionalAuth, 
    validateUrlCreation,
    handleGenerateNewShortUrl
);

router.get('/analytics/:shortId', 
    generalRateLimit,
    optionalAuth, 
    validateShortId,
    handleGetAnalytics
);


router.get('/dashboard/urls', 
    generalRateLimit,
    authenticateToken,
    handleGetUserUrls
);

router.get('/dashboard/stats', 
    generalRateLimit,
    authenticateToken,
    handleGetUserStats
);

router.put('/urls/:shortId', 
    generalRateLimit,
    authenticateToken,
    validateShortId,
    [
        body('customAlias')
            .optional()
            .isLength({ min: 3, max: 50 })
            .withMessage('Custom alias must be 3-50 characters')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),
        body('expiryDate')
            .optional()
            .isISO8601()
            .withMessage('Invalid expiry date format'),
        body('isPublic')
            .optional()
            .isBoolean()
            .withMessage('isPublic must be boolean'),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            next();
        }
    ],
    handleUpdateUrl
);

router.delete('/urls/:shortId', 
    generalRateLimit,
    authenticateToken,
    validateShortId,
    handleDeleteUrl
);

// Bulk operations route 
router.post('/urls/bulk-delete', 
    generalRateLimit,
    authenticateToken,
    [
        body('shortIds')
            .isArray({ min: 1, max: 50 })
            .withMessage('shortIds must be an array with 1-50 items'),
        body('shortIds.*')
            .isString()
            .isLength({ min: 1, max: 50 })
            .withMessage('Invalid short ID in array'),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            next();
        }
    ],
    async (req, res) => {
        try {
            const { shortIds } = req.body;
            
            const result = await ShortUrl.updateMany(
                { 
                    shortId: { $in: shortIds },
                    userId: req.user._id,
                    isActive: true
                },
                { isActive: false }
            );

            res.status(200).json({
                success: true,
                message: `${result.modifiedCount} URLs deleted successfully`,
                deletedCount: result.modifiedCount
            });

        } catch (error) {
            console.error('Bulk delete error:', error);
            res.status(500).json({
                success: false,
                message: 'Error performing bulk delete'
            });
        }
    }
);

export default router;