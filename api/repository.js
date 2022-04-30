const repos = require("express").Router();
const { getGAFPaged } = require("../gaf/handler");

repos.get("/", async (req, res) => {
    var reqp = req.query.page || "1";
    var reqppi = req.query.ppi || "10";

    if (Array.isArray(reqp)) {
        reqp = reqp[0];
    }

    if (Array.isArray(reqppi)) {
        reqppi = reqppi[0];
    }

    try {
        var ip, ippi;

        try {
            ip = parseInt(reqp)
            ippi = parseInt(reqppi)
        } catch (e) {
            res.status(403).json({
                error: "Page and ppi must be integer."
            });
            return;
        }

        var gaf = await getGAFPaged(ip, ippi);

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
    } catch (e) {
        res.status(500).json({
            error: "GAF internal error"
        });
    }
});

module.exports = repos;