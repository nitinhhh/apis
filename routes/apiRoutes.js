const resp = require('../lib/responseHandler');
const orders = require('../orders/controllers/orderController');

module.exports = function (app, router) {
    
    app.use('/', router);

    router.post('/orders', (req, res) => {
        orders.add(req, res).then(function(response) {

            resp.responseWithSuccess(req, res, response);
        }, function(err) {

            resp.responseWithError(req, res, err);
        })
    });

    router.patch('/orders/:id', (req, res) => {
        orders.patch(req, res).then(function(response) {

            resp.responseWithSuccess(req, res, response);
        }, function(err) {

            resp.responseWithError(req, res, err);
        })
    });

    router.get('/orders', (req, res) => {
        orders.list(req, res).then(function(response) {

            if(!response.length)
                resp.responseWithSuccess(req, res, null, 204);
            else
                resp.responseWithSuccess(req, res, response);
        }, function(err) {

            resp.responseWithError(req, res, err);
        })
    });
};