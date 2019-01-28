const chai = require('chai');
const expect = chai.expect;
const sinon = require("sinon");
const mongoValidate = require('../lib/mongooseValidate');
const googleApi = require('../lib/googleApi');
const distance = require('google-distance');
const mockDirectionResponse = {
    index: 1,
    distance: '1,069 km',
    distanceValue: 1069464,
    duration: '21 hours 2 mins',
    durationValue: 75732,
    origin: 'Unnamed Road, Agara, Gujarat 389170, India',
    destination: 'D.no 22-3-274/8/c,1st floor, Beside Andhra bank, jyothinagar,, TTS Twp, Ramagundam, Telangana 505215, India',
    mode: 'driving',
    units: 'metric',
    language: 'en',
    avoid: null,
    sensor: false
};

describe('Google Maps lib', () => {
    describe('calculateDistance()', () => {
        it('should return distance between origin and destination', (done) => {
            const distanceStub = sinon
                .stub(distance, 'get')
                .yields(null, mockDirectionResponse);

            googleApi.calculateDistance(["23", "72"], ["28", "79"]).then(data => {
                distanceStub.restore()
                expect(data.distanceValue).equal(1069464);
                done();
            });
        });
        it('should return an error due to wrong coordinates', (done) => {
            const distanceStub = sinon
                .stub(distance, 'get')
                .yields({message: 'Result error: ZERO_RESULTS'}, null);

            googleApi.calculateDistance(["2", "72"], ["28", "79"]).then(null, err => {
                distanceStub.restore();
                expect(err.message).equal('Result error: ZERO_RESULTS');
                done();
            });
        });
    });
});

describe('Constants initialisation', () => {
    it('should have port defined', () => {
        const configuration = require('../config/config');
        expect(configuration.defaultPort).equal(8080);
    });
});

describe('Mongo validity', () => {
    describe('isValidMongoId()', () => {
        it('should return true for valid mongo id', () => {
            let validity = mongoValidate.isValidMongoId('5beb36e29828252f4c1a9876');
            expect(validity).equal(true);
        });
        it('should return true for invalid mongo id', () => {
            let validity = mongoValidate.isValidMongoId('51234');
            expect(validity).equal(false);
        });
    });
});

describe.skip('Db connection', () => {
    it('should show db has conencted', (done) => {
        require('../lib/db');
        const mongoose = require('mongoose');
        mongoose.connection.on('connected', function(test){
            expect(mongoose.connection.readyState).equal(1);
            mongoose.disconnect()
            done();
        });
    });
});