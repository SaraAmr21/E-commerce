const mongoose = require('mongoose')
const cartSchema = require('../Schemas/cartSchema')
const cartModel = mongoose.model('cart', cartSchema)

module.exports = cartModel