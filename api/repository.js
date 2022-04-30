const repos = require("express").Router();
const { getGAFPaged } = require("../gaf/handler");
const GAFProcessor = require("../gaf/communciate");
const buildRateLimit = require("./ratelimit");

class RepositoryProcessor extends GAFProcessor {
    async onHandle(req, res) {
        var reqp = req.query.page;
        var reqppi = req.query.ppi;

        if (Array.isArray(reqp)) {
            reqp = reqp[0];
        }

        if (Array.isArray(reqppi)) {
            reqppi = reqppi[0];
        }

        var gaf = await getGAFPaged(parseInt(reqp), parseInt(reqppi));

        if (Object.keys(gaf).length === 0) {
            res.json([]);
            return;
        }

        res.setHeader("X-GAF-Last-Updated-At", gaf.last_update);
        if (gaf.has_prev) {
            res.setHeader("X-GAF-Previous-Page", parseInt(reqp) - 1);
        }
        if (gaf.has_next) {
            res.setHeader("X-GAF-Next-Page", parseInt(reqp) + 1);
        }
        res.json(gaf.context);
    }
}

repos.get("/", buildRateLimit(1, 500), new RepositoryProcessor().process);

module.exports = repos;