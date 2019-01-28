const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const server = 'localhost:8080';

/*
 * Add order
 */
describe('/POST orders', () => {
    it('Error for missing request data - destination is not there', (done) => {
        chai.request(server)
            .post('/orders')
            .send({
                origin: ["28", "70"],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.error).to.be.equal('INVALID_PARAMETERS');
                done();
            });
    });

    it('Error for invalid request format - need to provide valid json format', (done) => {
        chai.request(server)
            .post('/orders')
            .send({
                origin: ["28", "70"],
                destination: ["29.754", 70]
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.error).to.be.equal('INVALID_PARAMETERS');
                done();
            });
    });

    it('Success Create Order based on origin and destination', (done) => {
        chai.request(server)
            .post('/orders')
            .send({
                "origin": ["23.685", "72"],
                "destination": ["28", "79.786"]
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('distance');
                expect(res.body.distance).to.be.a('number');
                expect(res.body.status).to.be.equal('UNASSIGNED');
                done();
            });
    });

    it('should return error because of invalid coordinates', (done) => {
        chai.request(server)
            .post('/orders')
            .send({
                origin: ["2", "70.786"],
                destination: ["28.6756", "7"]
            })
            .end((err, res) => {
                expect(res).to.have.status(500);
                expect(res.body.error).to.be.equal('Result error: ZERO_RESULTS');
                done();
            });
    });
});

/*
 * 404
 */
describe('GET /', () => {
    it('404 Invalid url', (done) => {
        chai.request(server)
            .get('/')
            .end(function (err, res) {
                expect(res).to.have.status(404);
                done();
            });
    });
});

/*
 * 405
 */
describe('DELETE ordersid/123456', () => {
    it('405 for invalid method and path', (done) => {
        chai.request(server)
            .post('/order')
            .send({
                origin: ["2", "70.786"],
                destination: ["28.6756", "7"]
            })
            .end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
    });
});

/*
 * Patch order
 */
describe('/PATCH /orders/:id', () => {
    it('returns error due to non-present mongo id', (done) => {
        chai.request(server)
            .patch('/orders/5beb29b8e7c73b234a1fe6dc')
            .send({
                status: "TAKEN"
            })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body.error).to.be.equal('Order id not found');
                done();
            });
    });

    it('should return error due to wrong param passed (statuses instead of status)', (done) => {
        chai.request(server)
            .get('/orders?page=1&limit=1')
            .end((err, res) => {
                chai.request(server)
                    .patch('/orders/' + res.body[0].id)
                    .send({
                        statuses: "TAKEN"
                    }).end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body.error).to.be.equal('INVALID_PARAMETERS');
                        done();
                    })
            });
    });

    it('should return error due to wrong param value passed (status value = TOOK)', (done) => {
        chai.request(server)
            .get('/orders?page=1&limit=1')
            .end((err, res) => {
                chai.request(server)
                    .patch('/orders/' + res.body[0].id)
                    .send({
                        status: "TOOK"
                    }).end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body.error).to.be.equal('INVALID_PARAMETERS');
                        done();
                    })
            });
    });

    it('should return success for patched order', (done) => {
        chai.request(server)
            .get('/orders?page=1&limit=1')
            .end((err, res) => {
                chai.request(server)
                    .patch('/orders/' + res.body[0].id)
                    .send({
                        status: "TAKEN"
                    }).end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body.status).to.be.equal('SUCCESS');
                        done();
                    })
            });
    });

    it('should return failure for updating status to TAKEN of already taken order', (done) => {
        chai.request(server)
            .get('/orders?page=1&limit=1')
            .end((err, res) => {
                let order = res;
                chai.request(server)
                    .patch('/orders/' + res.body[0].id)
                    .send({
                        status: "TAKEN"
                    }).end((err, res) => {
                        expect(res).to.have.status(409);
                        expect(res.body.error).to.be.equal('Order id is not available for updation');
                        done();
                    })
            });
    });
});

/*
 * List orders
 */
describe('GET /', () => {

    it('should return error for imcomplete params (no limit passed)', (done) => {
        chai.request(server)
            .get('/orders?page=1')
            .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.body.error).to.be.equal('INVALID_PARAMETERS');
                done();
            });
    });

    it('should return error due to invalid value of params (invalid page)', (done) => {
        chai.request(server)
            .get('/orders?page=jhdj&limit=10')
            .end(function (err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should return error due to invalid value of params (invalid limit)', (done) => {
        chai.request(server)
            .get('/orders?page=1&limit=kjj6')
            .end(function (err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should return only 1 order, with correct format', (done) => {
        chai.request(server)
            .get('/orders?page=1&limit=1')
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body[0]).to.have.property('distance');
                expect(res.body[0].distance).to.be.a('number');
                expect(res.body[1]).to.be.undefined;
                done();
            });
    });

    it('should return error due to page num = 0', (done) => {
        chai.request(server)
            .get('/orders?page=0&limit=1')
            .end(function (err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
});
