const { spawn } = require("child_process");

class GAFExecuteError extends Error {
    constructor() {
        super("GAF exited with error code");
    }

    get name() {
        return "GAFExecuteError";
    }
}

/**
 * @typedef {{name: string, name: string, is_fork: boolean, is_archive: boolean, starred: string, watched: string, forked: string, opened_issue: string, language: string, license: string, topics: string[]}} GAFContextNode
 * @typedef {{last_update: string, context: GAFContextNode[]}} GAFOutput
 * @typedef {{last_update: string, context: GAFContextNode[], has_prev: boolean, has_next: boolean}} GAFOutputPaged
 * 
 * @param {string[]} args 
 * 
 * @return {Promise<GAFOutput|GAFOutputPaged>}
 */
async function runGAF(args) {
    return await Promise(
        /**
         * @param {(gaf: GAFOutput|GAFOutputPaged) => void} resolve 
         * @param {(exitcode: number) => void} reject 
         */
        function (resolve, reject) {
            var result;
            var proc = spawn(process.env.GAF_BIN, ["-get"].concat(args));
            proc.stdout.setEncoding("utf-8");
            proc.stdout.on("data", function (data) {
                result = data.toString();
            });
            proc.on("close", function (code, signal) {
                if (result) {
                    resolve(JSON.parse(result));
                } else {
                    reject(new GAFExecuteError());
                }
            });
        });
}

/**
 * @param {number} page 
 * @param {number} ppi 
 * 
 * @return {Promise<GAFOutputPaged>}
 */
async function getGAFPaged(page, ppi) {
    var intp = ~~page;
    var intppi = ~~ppi;

    if (intp < 1) {
        intp = 1;
    }

    if (intppi > 100) {
        intppi = 100;
    } else if (intppi < 10) {
        intppi = 10;
    } else {
        intppi -= intppi % 10;
    }

    return await runGAF(["-page", intp.toString(), "-ppi", intppi.toString()]);
}

/**
 * @return {Promise<GAFOutput>}
 */
async function getGAFAll() {
    return await runGAF(["-all"]);
}

module.exports.GAFExecuteError = GAFExecuteError;

module.exports = {
    getGAFPaged,
    getGAFAll
};