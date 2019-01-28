const Q = require('q');
const orderModel = require('../models/orderModel');
const {
    validate
} = require('jsonschema');
const googleApi = require('../../resources/googleApi');
const configuration = require('../../config/config');
const createOrderValidator = require("../validations/createOrder.json");

module.exports = {

    /** 
     * Create order
     * @param {*} req 
     * @param {*} res 
     */
    add: function (req, res) {

        const deferred = Q.defer();
        const validation = validate(req.body, createOrderValidator);

        if (!validation.valid) {
            const error = {status: 400, message: 'INVALID_PARAMETERS'};
            deferred.reject(error);
            return deferred.promise;
        }

        googleApi.calculateDistance(req.body.origin, req.body.destination).then(totalDistance => {

            const order = orderModel({
                distance: totalDistance.distanceValue,
                status: configuration.orderStatuses.UNASSIGNED,
                origin: req.body.origin,
                destination: req.body.destination,
                createdAt: new Date(),
                updatedAt: new Date()
            });
    
            order.save().then(newOrder => {
                deferred.resolve({
                    id: newOrder._id,
                    distance: parseInt(newOrder.distance),
                    status: newOrder.status
                });
            }).catch(err => {
                const error = { status: 500, message: err.message };
                deferred.reject(error);
            });
        }).catch(err => {
            console.log(err)
            const error = {status: 500, message: err.message};
            deferred.reject(error);
        })

        return deferred.promise;
    }
};