const Q = require('q');
const orderModel = require('../models/orderModel');
const {
    validate
} = require('jsonschema');
const configuration = require('../../config/config');
const listOrderValidator = require("../validations/listOrder.json");
const mongoValidate = require('../../resources/mongooseValidate');

module.exports = {
    /**
     * Paginate orders list
     * @param {*} req 
     * @param {*} res 
     */
    list: function (req, res) {

        const deferred = Q.defer();
        const validation = validate(req.query, listOrderValidator);

        if (!validation.valid || req.query.page <= 0 || req.query.limit <= 0 || req.query.limit > configuration.pageSizeMax) {
            const error = {status: 400, message: 'INVALID_PARAMETERS'};
            deferred.reject(error);
            return deferred.promise;
        }

        const page = parseInt(req.query.page), limit = parseInt(req.query.limit);
        const fields = {distance: 1, status: 1};
        const offset = ((page-1) * limit);
        let orderData = [];

        orderModel.find(null, fields, { skip: offset, limit: limit }).sort({ _id: -1 })
            .cursor() //looping through orders to change _id to id
            .on('data', data => {
                let datum = data.toObject();
                datum.id = datum._id;
                delete datum._id;
                orderData.push(datum);
            }).on('close', () => {
                if(orderData.length > 0)
                    deferred.resolve(orderData);
                else
                    deferred.reject({status: 404, message: 'No records found'});
            });

        return deferred.promise;
    },
};