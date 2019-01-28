const Q = require('q');
const orderModel = require('../models/orderModel');
const {
    validate
} = require('jsonschema');
const configuration = require('../../config/config');
const updateOrderValidator = require("../validations/updateOrder.json");
const mongoValidate = require('../../resources/mongooseValidate');

module.exports = {
    /**
     * update order status
     * @param {*} req 
     * @param {*} res 
     */
    patch: function (req, res) {

        const deferred = Q.defer();
        const validation = validate(req.body, updateOrderValidator);

        if (req.body.status !== configuration.orderStatuses.TAKEN || !validation.valid || !mongoValidate.isValidMongoId(req.params.id)) {
            const error = {status: 400, message: 'INVALID_PARAMETERS'};
            deferred.reject(error);
            return deferred.promise;
        }

        const query = { _id: req.params.id };
        const update = { status: configuration.orderStatuses.TAKEN };
        const options = { new: false };

        orderModel.findOneAndUpdate(query, update, options).then(orderData => {
            if(!orderData) {
                deferred.reject({status: 404, message: 'Order id not found'});
            } else {
                if(orderData.status !== configuration.orderStatuses.UNASSIGNED)
                    deferred.reject({status: 409, message: 'Order id is not available for updation'});
                else
                    deferred.resolve({status: 'SUCCESS'});
            }
        }).catch(err => {
            const error = { status: 500, message: err.message };
            deferred.reject(error);
        });

        return deferred.promise;
    }
};