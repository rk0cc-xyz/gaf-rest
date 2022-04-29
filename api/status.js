const status = require("express").Router();
const { getGAFAll } = require("../gaf/handler");
const gafAction = require("../gaf/communciate");
const buildRateLimit = require("./ratelimit");

status.get("/", buildRateLimit(), (req, res) => {
    var defaultStatus = {
        total_repository: 0
    };

    gafAction(res, async () => {
        var gaf = await getGAFAll();

        if (Object.keys(gaf).length === 0) {
            res.json(defaultStatus);
            return;
        }

        defaultStatus.total_repository = gaf.context.length;

        res.setHeader("X-GAF-Last-Updated-At", gaf.last_update);

        res.json(defaultStatus);
    });
});

module.exports = status;