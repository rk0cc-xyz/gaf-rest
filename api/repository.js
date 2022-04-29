const repos = require("express").Router();
const { getGAFPaged } = require("../gaf/handler");
const gafAction = require("../gaf/communciate");
const buildRateLimit = require("./ratelimit");

repos.get("/", buildRateLimit(1, 500), (req, res) => {
    var reqp = req.query.page;
    var reqppi = req.query.ppi;

    if (Array.isArray(reqp)) {
        reqp = reqp[0];
    }

    if (Array.isArray(reqppi)) {
        reqppi = reqppi[0];
    }

    gafAction(res, async () => {
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
    });
});