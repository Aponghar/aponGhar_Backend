const logger =
    require("./logger");



const errorLogger =
    (
        err,
        req,
        res,
        next
    ) => {

        logger.error({

            message:
                err.message,

            stack:
                err.stack,

            route:
                req.originalUrl,

            method:
                req.method,

            ip:
                req.ip
        });

        next(err);
};



module.exports =
    errorLogger;