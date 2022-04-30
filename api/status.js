const status = require("express").Router();
const { getGAFAll } = require("../gaf/handler");
const GAFProcessor = require("../gaf/communciate");
const buildRateLimit = require("./ratelimit");

class StatusProcessor extends GAFProcessor {
    async onHandle(req, res) {
        var defaultStatus = {
            total_repository: 0
        };

        var gaf = await getGAFAll();

        if (Object.keys(gaf).length === 0) {
            res.json(defaultStatus);
            return;
        }

        defaultStatus.total_repository = gaf.context.length;

        res.setHeader("X-GAF-Last-Updated-At", gaf.last_update);

        res.json(defaultStatus);
    }
}

status.get("/", buildRateLimit(), new StatusProcessor().process);

module.exports = status;