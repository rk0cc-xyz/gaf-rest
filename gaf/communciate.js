const { Request, Response } = require("express");
const GAFExecuteError = require("./handler").GAFExecuteError;

module.exports = class GAFProcessor {
    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    async onHandle(req, res) {
        throw new Error("No implementation");
    }

    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    async process(req, res) {
        try {
            await this.onHandle(req, res);
        } catch (e) {
            if (e instanceof GAFExecuteError) {
                res.status(503).json({
                    error: "GAF executed with error."
                });
            } else {
                res.status(500).json({
                    error: "Unexpected internal error happened when making request."
                });
            }
        }
    }
}
