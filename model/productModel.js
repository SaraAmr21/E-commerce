const mongoose = require('mongoose')
const productSchema = require('../Schemas/productSchema')
const productModel = mongoose.model('Product', productSchema)

module.exports = productModel