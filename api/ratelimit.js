const rateLimit = require("express-rate-limit");

module.exports = function (second, maxreq) {
    return rateLimit({
        windowMs: second * 1000,
        max: maxreq,
        skip: (req, res) => req.ip === "127.0.0.1" || res.status === 301 || req.method.toUpperCase() === "HEAD" || /\.rk0cc\.xyz/gi.test(req.origin || ""),
        message: {
            error: "Rate limit reached"
        }
    });
}