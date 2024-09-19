const express = require('express');
const praviteRouter = require('./private');
const publicRouter = require('./public');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests, please try again later.'
});
const router = express.Router();

router.use('/', praviteRouter, limiter);
router.use('/', publicRouter, limiter);

// router.use('/', praviteRouter);
// router.use('/', publicRouter);

module.exports = router;