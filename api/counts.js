const counts = require("express").Router();
const { getGAFAll } = require("../gaf/handler");
const buildRateLimit = require("./ratelimit");

counts.get("/", (req, res) => {
    res.json({
        language: "./language",
        license: "./license",
        topics: "./topics"
    });
});

counts.get("/:section", buildRateLimit(), async (req, res) => {
    const section = req.params.section;
    if (!["language", "license", "topics"].includes(section)) {
        res.status(404).json({
            error: "No counting analysis in this section, and ensure use lower case only."
        });
        return;
    }

    var pio = req.query["with-other"] || "";
    if (Array.isArray(pio)) {
        pio = pio[0];
    }
    var pin = req.query["with-none"] || "";
    if (Array.isArray(pin)) {
        pin = pin[0];
    }
    var top = req.query.top || "0";
    if (Array.isArray(top)) {
        top = top[0];
    }

    const inc_other = pio.toLowerCase() === "true";
    const inc_none = pin.toLowerCase() === "true";

    try {
        var gaf = await getGAFAll();
        var analyse;

        if (Object.keys(gaf).length === 0) {
            res.json({});
            return;
        }

        switch (section) {
            case "language":
                analyse = gaf.context.map((v) => v.language);
                if (!inc_other) {
                    analyse = analyse.filter((v) => v !== "Other");
                }
                break;
            case "license":
                analyse = gaf.context.map((v) => v.license);
                if (!inc_other) {
                    analyse = analyse.filter((v) => v !== "Other");
                }
                if (!inc_none) {
                    analyse = analyse.filter((v) => v !== "None");
                }
                break;
            case "topics":
                analyse = [];
                gaf.context.map((v) => v.topics)
                    .forEach((v) => {
                        analyse = analyse.concat(v);
                    });
                break;
            default:
                throw new Error("Undefined section reached analysing process is not allowed.");
        }

        var analyser = {};

        analyse.forEach((sk) => {
            if (Object.keys(analyser).includes(sk)) {
                analyser[sk] += BigInt(1);
            } else {
                analyser[sk] = BigInt(1);
            }
        });

        var ca = { ...analyser };
        var sorteda = {};

        var tc;

        try {
           tc = parseInt(top);
           if (tc < 0) {
               throw "";
           }
        } catch (e) {
            res.status(403).json({
                error: "Top number must be non-negative integer."
            })
        }

        var processed = 0;
        while (Object.keys(ca).length !== 0) {
            var cmn = "";
            var cmc = BigInt(0);
            
            for (var [k, v] of Object.entries(ca)) {
                if (cmc < v || (cmc === v && k.localeCompare(cmn) < 0)) {
                    cmn = k;
                    cmc = v;
                }
            }

            sorteda[cmn] = cmc.toString();
            delete ca[cmn];

            if (tc !== 0 && ++processed >= tc) {
                break;
            }
        }

        res.setHeader("X-GAF-Last-Updated-At", gaf.last_update);
        res.contentType("application/json").send(JSON.stringify(sorteda));
    } catch (e) {
        res.status(500).json({
            error: "GAF internal error"
        });
    }
});

module.exports = counts;