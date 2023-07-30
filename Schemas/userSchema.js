const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const util = require('util')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const secretKey = process.env.secret_Key;
const AsyncSign = util.promisify(jwt.sign)
const saltRound = 8;
const cartModel=require("../model/cartModel.js")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        validate: {
          validator: function (value) {
            return /^[a-zA-Z]+$/.test(value);
          },
        },
        required: true,
      },
      lastName: {
        type: String,
        validate: {
          validator: function (value) {
            return /^[a-zA-Z]+$/.test(value);
          },
        },
        required: true,
      },
    userName: {
        type: String,
        validate: {
            validator: function (value) {
                const userNameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
                return userNameRegex.test(value);
            },
          
        },
        required: true
    },
    phoneNumber: Number,
    address: String,
    email: {
        type: String,
        validate: {
            validator: function (value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },

        },
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    password: {
        type: String,
        validate: {
            validator: function (value) {
                const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
                return passwordRegex.test(value);
            },
          
        },
        required: true
    },
   
});
userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const hashPass = await bcrypt.hash(this.password, saltRound)
        this.password = hashPass;
    }

})

userSchema.methods.comparePassword = async function (newPass) {
    try {
        return await bcrypt.compare(newPass, this.password);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false; 
    }
};

userSchema.methods.genTok = async function () {
    const token = await AsyncSign(
        {
            id: this.id,
            role: this.role,

        },
        secretKey
    );

    return token;
};

module.exports = userSchema

