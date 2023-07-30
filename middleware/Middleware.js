const util = require('util')
const jwt = require('jsonwebtoken')
const CustomError = require('./CustomError.js')
const secretKey = 'hll1'
const asyncverify = util.promisify(jwt.verify)


const admin = async (req, res, next) => {
    const { authorization: token } = req.headers;

    if (!token) {
        return next(CustomError({
            statusCode: 401,
            message: "Token not provided"
        }));
    }

    try {
        const decoded = await asyncverify(token, secretKey);
        if (decoded.role !== 'admin') {
            return next(CustomError({
                statusCode: 401,
                message: "Not an admin"
            }));
        }
        next();
    } catch (err) {
        return next(CustomError({
            statusCode: 401,
            message: "Invalid token"
        }));
    }
};





module.exports = admin