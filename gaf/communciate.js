const { Response } = require("express");
const GAFExecutionError = require("./handler").GAFExecuteError;

/**
 * @param {Response} res 
 * @param {() => Promise<void>} action 
 */
module.exports = function (res, action) {
    action()
        .catch((e) => {
            if (e.name === GAFExecutionError.name) {
                res.status(503).json({
                    error: "GAF executed with error."
                });
            } else {
                res.status(500).json({
                    error: "Unexpected internal error happened when making request."
                });
            }
        });
}