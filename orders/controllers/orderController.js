const Q = require('q');
const orderModel = require('../models/orderModel');
const {
    validate
} = require('jsonschema');
const googleApi = require('../../resources/googleApi');
const configuration = require('../../config/config');
const createOrderValidator = require("../validations/createOrder.json");
const updateOrderValidator = require("../validations/updateOrder.json");
const listOrderValidator = require("../validations/listOrder.json");
const mongoValidate = require('../../resources/mongooseValidate');

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
    },

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
    },

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