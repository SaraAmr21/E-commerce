const express = require('express')
const router = express.Router()
const userModel = require('../model/userModel.js')
const productModel = require('../model/productModel.js')
const CustomError = require('../middleware/CustomError.js');
const bcrypt = require('bcrypt')
const util = require('util')
const jwt = require('jsonwebtoken')
const admin = require('../middleware/Middleware.js')


//add product
router.post('/', admin, async (req, res, next) => {
    try {
        const { description, name, type, price } = req.body;

        const newProduct = new productModel({
            description,
            name,
            type, 
            price
        });

        await newProduct.save();
        productID= newProduct.id
        res.json({ message: "Product created successfully", productID });
    } catch (error) {
        next( CustomError({
            stateCod: 400,
            message: "Invalid parameters"
        }));
    }
});


router.get('/', admin, async (req, res, next) => {
    try {
        const allProducts = await productModel.find()
        res.status(200).send(allProducts)

    }
    catch (error) {
        next(CustomError({
            stateCod: 400,
            message: "Products empty"
        }))
    }
})



router.patch('/edit/:id', admin, async (req, res, next) => {
    try {
        const { description, name, type, price } = req.body;
        const id = req.params.id.trim();

        const productCheck = await productModel.findOne({ name, _id: { $ne: id } });
        if (productCheck) {
            return next(CustomError({
                stateCod: 409,
                message: "Product already exists"
            }));
        }

        const editProduct = await productModel.findByIdAndUpdate(id, {
            description,
            name,
            type,
            price
        }, { new: true });

        if (!editProduct) {
            return next(CustomError({
                stateCod: 404,
                message: "Product not found"
            }));
        }

        const token = await editProduct.genTokPro();
        if (!token) {
            return next(CustomError({
                stateCod: 401,
                message: "Update failed"
            }));
        }

        res.json({ token });
    } catch (error) {
        next(CustomError({
            stateCod: 500,
            message: "Internal server error"
        }));
    }
});

router.delete('/:id', admin, async (req, res, next) => {
    try {
        const deleted = await productModel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Product deleted successfully',
        });
        const token = await deleted.genTokPro();
        res.json({ message: "Delete successful", token })
    }
    catch {
        next(CustomError({
            stateCod: 400,
            message: "User not deleted"
        }))
    }
});

module.exports = router
