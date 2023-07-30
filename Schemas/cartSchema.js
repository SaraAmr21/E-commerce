const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const util = require('util')
const jwt = require('jsonwebtoken')
const secretKey = 'fsas'
const AsyncSign = util.promisify(jwt.sign)

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
  
      quantity: {
        type: Number,
        default: 1,
        min: 1
      }
     
    }]
  });

cartSchema.methods.genTokPro = async function () {
    const token = await AsyncSign(
        {
            id: this.id
        },
        secretKey
    );

    return token;
};

module.exports = cartSchema

