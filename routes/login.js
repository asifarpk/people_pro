require('dotenv').config();
require ("../db/conn");

const express = require ("express");
const bodyParser = require('body-parser')
const cookieParser = require ("cookie-parser");
const {check, validationResult} = require("express-validator");
const jwt = require ("jsonwebtoken");
const users = require ("../models/users");
const bcrypt = require ("bcryptjs");

const router = new express.Router()

// bodyParser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
// bodyParser
router.use(cookieParser());

router.get ("/", (req, res) => {
    res.render ("login", 
        {
            title: "Login",
            success: false

        }
    )
})

router.post ("/", urlencodedParser, [
    check("email", "Email is not Valid")
        .isEmail()
        .normalizeEmail(),
    check("password", "Password is not valid")
        .isLength({min: 6})
], (req, res) => {
    const errors = validationResult(req);
    const allErrors = errors.mapped();
    
    if (!errors.isEmpty()) {

        res.render ("login", 
            {
                allErrors: allErrors,
                email_value: req.body.email,
                password_value: req.body.password
            }
        )
    }
    else {
        const userEmail = req.body.email;
        const userPassword = req.body.password;

        // find DOC
        const findDoc = async () => {
            const result = await users.findOne({email:userEmail})

            if (!result) {
                res.render ("login", 
                    {
                        info: "Invalid Login Details.",
                        email_value: req.body.email,
                        password_value: req.body.password                        

                    }
                )
            } 
            else {
                const auth = async (userPassword) => {

                    // Compares with hashed password
                    const passStatus = await bcrypt.compare (userPassword, result.password);

                    if (passStatus) {

                        // Before Login, Generates Login Token and pushes into Tokens.
                        // const token = await jwt.sign({_id: result._id.toString(), type: "log"}, `${result.first_name}${result.last_name}`); 
                        // await users.updateOne ({_id: result._id}, {$push: {'tokens': {"token": token}}});

                        // Setting cookies
                        res.cookie ("token", result.tokens[0].token, {
                            expires: new Date(Date.now() + 30000)
                        });                        
                        
                        // Login and redirecting to dashboard
                        res.render ("dashboard", 
                            {
                                loginSuccess: `Welcome ${result.first_name + " " + result.last_name}`,
                                logouut: true,
                                title: "Dashboard"
                                
                            }
                        )
                    }
                    else {
                        res.render ("login", 
                            {
                                info: "Invalid Login Details.",
                                email_value: req.body.email,
                                password_value: req.body.password                        
        
                            }
                        )
                    }
                }
                auth(userPassword);
                
            }
        }
        findDoc();
        
    }
})

module.exports = router;