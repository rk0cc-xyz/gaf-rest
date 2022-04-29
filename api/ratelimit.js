const { rateLimit } = require("express-rate-limit");

module.exports = (second = 1, reqmax = 100) => rateLimit({
    windowMs: second * 1000,
    max: reqmax,
    legacyHeaders: true,
    standardHeaders: true,
    skip: (req, res) => req.ip === "127.0.0.1" || res.status === 301,
    message: {
        error: "Rate limit reached"
    }
});