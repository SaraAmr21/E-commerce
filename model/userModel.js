const mongoose=require('mongoose')
const userSchema=require('../Schemas/userSchema')
const userModel=mongoose.model('User', userSchema)

module.exports=userModel