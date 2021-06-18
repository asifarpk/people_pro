require('dotenv').config();
require ("../db/conn");

const express = require ("express");
const bodyParser = require('body-parser')
const cookieParser = require ("cookie-parser");
const {check, validationResult} = require("express-validator");
const jwt = require ("jsonwebtoken");
const bcrypt = require ("bcryptjs");

const users = require ("../models/users");

const router = new express.Router()

// bodyParser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
// bodyParser
router.use(cookieParser());


router.get ("/", (req, res) => {
    res.render ("register", 
        {
            title: "Register",
            success: false
        }
    );
})

router.post ("/", urlencodedParser, [
    check("first_name", "First name must be 3+ characters long")
        .exists()
        .isLength({ min: 3}),
    check("last_name", "Last name must be 3+ characters long")
        .exists()
        .isLength({ min: 3}),
    check("email", "Email is not valid")
        .exists()
        .isEmail()
        .normalizeEmail(),
    check("password", "Passwords Error")
        .exists()
        .isLength({ min: 6}),
    check("terms", "Terms and Conditions not accepted.")
        .exists(),
    check("gender", "Gender not selected")
        .exists(),
    check("phone", "Not a valid phone number")
        .exists()
        .isLength({min: 11}),
    check("age", "Only 18+ are allowed")
        .exists()
        .isFloat({min: 18, max: 100})
], (req, res) => {
    const errors = validationResult(req);
    var allErrors = null;
    
    if (!errors.isEmpty()) {

        if (req.body.password != req.body.re_password) {
            var passNotMatch = true;
        }
        
        allErrors = errors.mapped();
        res.render ("register",
            {
                title: "Validation ERRORS",
                allErrors: allErrors,
                first_name_value: req.body.first_name,
                last_name_value: req.body.last_name,
                email_value: req.body.email,
                gender_value: req.gender,
                phone_value: req.body.phone,
                age_value: req.body.age,
                password_value: req.body.password,
                re_password_value: req.body.re_password,
                terms_value: req.body.age,
                passwords_status: passNotMatch
            }
        );
    }else {
        const createDoc = async () => {
            try {
                const thisDoc = new users (
                    {
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        email: req.body.email,
                        gender: req.body.gender,
                        phone: req.body.phone,
                        age: req.body.age,
                        password: req.body.password
                    }
                );

                const result = await thisDoc.save();  
                res.render ("register",
                    {
                        info: "Account created succesfully!"
                    }
                );
            } catch (error) {
                    
                res.render ("register",
                    {
                        info: "An account already exist with this information.",
                        allErrors: allErrors,
                        first_name_value: req.body.first_name,
                        last_name_value: req.body.last_name,
                        email_value: req.body.email,
                        gender_value: req.gender,
                        phone_value: req.body.phone,
                        age_value: req.body.age,
                        password_value: req.body.password,
                        re_password_value: req.body.re_password,
                        terms_value: req.body.age,
                        passwords_status: passNotMatch
                    }
                );
            }
        }
        createDoc();         
    }   
})

module.exports = router;