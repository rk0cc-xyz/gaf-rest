const counts = require("express").Router();
const { getGAFAll } = require("../gaf/handler");
const buildRateLimit = require("./ratelimit");

class Countainer {
    /**
     * @type {Record<string, BigInt>}
     */
    #count = {};

    /**
     * @param {string} name 
     */
    count(name) {
        if (this.#count[name]) {
            this.#count[name] += BigInt(1);
        } else {
            this.#count[name] = BigInt(1);
        }
    }

    /**
     * @return {Record<string, string>}
     */
    exportObject() {
        var cloned = { ...this.#count };
        var sorted = {};

        while (Object.keys(cloned).length !== 0) {
            var cmn = "";
            var cmc = BigInt(0);

            for (var [k, v] of Object.entries(cloned)) {
                if (cmc < v || (cmc === v && k.localeCompare(cmn) < 0)) {
                    cmn = k;
                    cmc = v;
                }
            }

            sorted[cmn] = cmc.toString();
            delete cloned[cmn];
        }

        return sorted;
    }
}

counts.get("/", (req, res) => {
    res.json({
        language: "./language",
        license: "./license",
        topics: "./topics"
    });
});

counts.get("/:section", buildRateLimit(), (req, res) => {
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
                    .forEach(analyse.concat);
                break;
            default:
                throw new Error("Undefined section reached analysing process is not allowed.");
        }

        var countainer = new Countainer();
        analyse.forEach(countainer.count);

        res.setHeader("X-GAF-Last-Updated-At", gaf.last_update);
        res.json(countainer.exportObject);
    } catch (e) {
        res.status(500).json({
            error: "GAF internal error"
        });
    }
});

module.exports = counts;