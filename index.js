const express = require("express");
const cors = require("cors");

const app = express();

app.all(/.*/, function (req, res, next) {
    var host = req.header("host");
    if (host.match(/^www\..*/i)) {
        next();
    } else {
        res.redirect(301, "https://www." + host + req.originalUrl);
    }
});

app.set('trust proxy', 1);
app.set("query parser", "simple");

const apiroot = express.Router();

apiroot.use(cors({
    methods: ["GET", "HEAD"],
    maxAge: 900
}));

apiroot.use((req, res, next) => {
    res.setHeader("X-Powered-By", "GAF");
    next();
});

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