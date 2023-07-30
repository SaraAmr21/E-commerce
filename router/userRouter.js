const express = require('express')
const router = express.Router()
const userModel = require('../model/userModel.js')
const CustomError = require('../middleware/CustomError.js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const admin = require('../middleware/Middleware.js')


//sign up
router.post('/signup', async (req, res, next) => {
    try {
        const { firstName, lastName, userName, password, email, role, phoneNumber, address } = req.body;
        const usernameCheck = await userModel.findOne({ userName })
        const emailCheck = await userModel.findOne({ email })
        if (usernameCheck) {
            return next(CustomError({
                stateCod: 409,
                message: "Username already taken"
            }));
        }
        if (emailCheck) {
            return next(CustomError({
                stateCod: 409,
                message: "Email already registered"
            }));
        }

        const newUser = new userModel({
            firstName,
            lastName,
            userName,
            password,
            email,
            role,
            phoneNumber,
            address,
                
        });

        await newUser.save();
        const token = await newUser.genTok();
        res.json({ message: "Sign-up successful", token })
    }
    catch {
        return next(CustomError({
            stateCod: 400,
            message: "Invalid parameters"
        }))


    }
})


//log in

router.post('/login', async (req, res, next) => {
    try {
        const { userName, password } = req.body;
        const user = await userModel.findOne({ userName });

        if (!user) {
            next(CustomError({
                stateCod: 404,
                message: "User not found. Please sign up first."
            }));
        }
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return next(CustomError({
                stateCod: 401,
                message: "Invalid credentials. Please check your username and password."
            }));
        }
        const token = await user.genTok();
        res.json({ message: "Log-in successful", token })

    } catch (err) {
        next(CustomError({
            stateCod: 500,
            message: "Internal server error"
        }));
    }
});


router.get('/login', admin, async (req, res, next) => {
    try {
        const allUsers = await userModel.find()
        res.status(200).send(allUsers)

    }

    catch (error) {
        next(CustomError({
            stateCod: 400,
            message: "Users empty"
        }))
    }
})



router.patch('/login/edit/:id', admin, async (req, res, next) => {
    try {
        const { firstName, lastName, userName, password, email, role, phoneNumber, address } = req.body;
        const id = req.params.id.trim();
        const usernameCheck = await userModel.findOne({ userName, _id: { $ne: id } });

        if (usernameCheck) {
            return next(CustomError({
                stateCod: 409,
                message: "Username already taken"
            }));
        }

        const updates = {
            firstName,
            lastName,
            userName,
            email,
            role,
            phoneNumber,
            address,
        };


        if (password) {

            const hashedPassword = await bcrypt.hash(password, 10);
            updates.password = hashedPassword;
        }

        const editUser = await userModel.findByIdAndUpdate(id, updates, { new: true });

        if (!editUser) {
            return next(CustomError({
                stateCod: 404,
                message: "User not found"
            }));
        }

        const token = await editUser.genTok();

        if (!token) {
            return next(CustomError({
                stateCod: 401,
                message: "Update failed"
            }));
        }

        res.json({ editUser });
    } catch (error) {
        next(CustomError({
            stateCod: 500,
            message: "Internal server error"
        }));
    }
});


router.delete('/login/:id', admin, async (req, res, next) => {
    try {
        const deletedUser = await userModel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'User deleted successfully',
        });
        const token = await deletedUser.genTok();
        res.json({ message: "Delete successful" })
    }
    catch {
        next(CustomError({
            stateCod: 400,
            message: "User not deleted"
        }))
    }
});

module.exports = router
