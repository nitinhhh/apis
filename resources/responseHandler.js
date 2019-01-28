/**
 * Erroneous Response 
 * @param {*} req 
 * @param {*} res 
 * @param {*} error 
 */
const responseWithError = function (req, res, error) {

    if (!error.status) {
        error.status = 500;
    }
    if (!error.body && !error.message) {
        error.body = "ERROR_OCCURRED";
    }
    res.status(error.status).send({ error: error.body || error.message });
};

/**
 * Success response
 * @param {*} req 
 * @param {*} res 
 * @param {*} data 
 */
const responseWithSuccess = function (req, res, data, status) {

    res.status(status || 200).json(data);
}

/**
 * Handling all syntax and type errors while request
 * @param {*} error 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const bodyParserHandle = function(error, req, res, next) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
        responseWithError(req, res, {status: 400, message: 'Malformed expression'});
    }
}

/**
 * Mail error handler
 * @param {*} error 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const errorHandler = function(error, req, res, next) {
    console.log(error)
    responseWithError(req, res, {status: 500, message: 'Some error occurred'});
}

module.exports = {
    responseWithError: responseWithError,
    responseWithSuccess: responseWithSuccess,
    bodyParserHandle: bodyParserHandle,
    errorHandler: errorHandler
}