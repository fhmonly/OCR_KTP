const {
    MYSQL_ERROR,
    BCRYPT_ERROR,
    JWT_ERROR,
    AXIOS_ERROR
} = require("./errorType");
const fs = require('fs')
const path = require('path')
const {sentSlackNotifications} = require("../../util/util");

/**
 * 404 error handler
 *
 * @param {Error} err
 * @param {e.Request} req
 * @param {e.Response} res
 */
exports.render404Error = (err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
    // res.status(err.status || 500).json({
    //     message: err.message,
    //     error: req.app.get('env') === 'development' ? err : {}
    // })
}

/**
 * global default error handler
 *
 * @param {Error} err
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 */
exports.defaultErrorhandler = (err, req, res, next) => {
    console.log(err.response)
    if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
            message: 'Internal server error',
        });
    }

    sentSlackNotifications("failed hit axios", err.response)
    return res.status(err.response?.status || 500).json({message: "error hitting axios", error: err.response.data})
}

/**
 * function for error handler syntax
 *
 * @param {string} type
 * @param {any} error
 * @return Object
 */
exports.errorHandlerSyntax = (type, error) => ({
    type,
    error
})
