const mongoose = require('mongoose');

module.exports = {

    /**
     * Check if passed id is a valid BSON id
     * @param {*} id 
     */
    isValidMongoId: function (id) {
        return mongoose.Types.ObjectId.isValid(id);
    },
};