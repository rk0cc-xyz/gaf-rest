const status = require("express").Router();
const { getGAFAll } = require("../gaf/handler");
const buildRateLimit = require("./ratelimit");

status.use(buildRateLimit());

status.get("/", async (req, res) => {
    var defaultStatus = {
        total_repository: 0
    };

    try {
        var gaf = await getGAFAll();

        if (Object.keys(gaf).length === 0) {
            res.json(defaultStatus);
            return;
        }

        defaultStatus.total_repository = gaf.context.length;

        res.setHeader("X-GAF-Last-Updated-At", gaf.last_update);

        res.json(defaultStatus);
    } catch (e) {
        res.status(500).json({
            error: "GAF internal error"
        });
    }
});

module.exports = status;