const entry = require("express").Router();

entry.get("/", (req, res) => {
    res.json({
        repository: "./repository",
        counts: "./counts",
        status: "./status"
    });
});

module.exports = entry;