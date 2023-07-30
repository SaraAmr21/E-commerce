const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const util = require('util')
const jwt = require('jsonwebtoken')
const secretKey = 'fsas'
const AsyncSign = util.promisify(jwt.sign)


const productSchema= new mongoose.Schema({
    name: String,
    description: String,
    type: {
        type: String,
        enum: ['Food', 'Clothes', 'Electronics'],
    
    },
    price: Number
});


productSchema.methods.genTokPro = async function () {
    const token = await AsyncSign(
        {
            id: this.id
        },
        secretKey
    );

    return token;
};

module.exports = productSchema

