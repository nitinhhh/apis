const configuration = require('../config/config');

const mongoose = require('mongoose');
const mongooseOptions = {
    auto_reconnect: true,
    connectTimeoutMS: 3600000,
    socketTimeoutMS: 3600000,
    // retry to connect for 60 times
    reconnectTries: 60,
    // wait 5 second before retrying
    reconnectInterval: 5000,
    useNewUrlParser: true
};
// use createConnection instead of calling mongoose.connect so we can use
// multiple connections
mongoose.connection.on('open', function (ref) {
    console.info('Connected to mongo server.');
});
mongoose.connection.on('error', function (err) {
    console.error('Could not connect to mongo server!', err);
});

mongoose.connect(configuration.dbConnection, mongooseOptions);

module.exports = mongoose;