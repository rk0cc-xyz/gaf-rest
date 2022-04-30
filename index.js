const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

app.all(/.*/, function (req, res, next) {
    var host = req.header("host");
    if (host.match(/^www\..*/i)) {
        next();
    } else {
        res.redirect(301, "https://www." + host + req.originalUrl);
    }
});

app.set("query parser", "simple");

const rl = rateLimit({
    windowMs:  1000,
    max: 500,
    skip: (req, res) => req.ip === "127.0.0.1" || res.status === 301,
    message: {
        error: "Rate limit reached"
    }
});

app.use("/api/github", rl);

app.use("/api/github", cors({
    methods: ["GET"],
    maxAge: 900
}));

app.use("/api/github", (req, res, next) => {
    res.setHeader("X-Powered-By", "GAF");
    next();
});

const apiroot = express.Router();

const subroutes = [
    {
        path: "/",
        route: require("./api/entry")
    },
    {
        path: "/repository",
        route: require("./api/repository")
    },
    {
        path: "/counts",
        route: require("./api/counts")
    },
    {
        path: "/status",
        route: require("./api/status")
    }
];

subroutes.forEach((sr) => {
    apiroot.use(sr.path, sr.route);
});

app.use("/api/github", apiroot);

const server = app.listen();

server.setTimeout(30 * 1000);