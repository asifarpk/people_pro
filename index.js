require('dotenv').config();
const express = require("express");
const hbs = require ("hbs");
const app = express();
const users = require ("./models/users");
require ("./db/conn");
const bodyParser = require('body-parser')
const bcrypt = require ("bcryptjs");
const jwt = require ("jsonwebtoken");
const {check, validationResult} = require("express-validator");

const port = process.env.PORT || 5000;


console.log (process.env.DATABASE);


// Public Folder
app.use('/public', express.static(__dirname + "/public"));

// View Engine
app.set ("view engine", "hbs");
hbs.registerPartials("views/partials");

// bodyParser
// var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })


// hbs.registerHelper('ifeq', function (a, b, options) {
//     if (a == b) { return options.fn(this); }
//     return options.inverse(this);
// });


app.get ("/login", (req, res) => {
    res.render ("login", 
        {
            title: "Login",
            success: false

        }
    )
})
app.post ("/login", urlencodedParser, [
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
                        const token = await jwt.sign({_id: result._id.toString(), type: "log"}, `${result.first_name}${result.last_name}`); 
                        await users.updateOne ({_id: result._id}, {$push: {'tokens': {"token": token}}});
                        
                        // Login and redirecting to dashboard
                        res.render ("dashboard", 
                            {
                                loginSuccess: `Welcome ${result.first_name + " " + result.last_name}`,
                                logouut: true
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






// Routing
app.get ("/", (req, res) => {
    res.render ("index", {title: "Home"});
})
app.get ("/register", (req, res) => {
    res.render ("register", 
        {
            title: "Register",
            success: false
        }
    );
})



app.post ("/register", urlencodedParser, [
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


app.listen (port, () => {
    console.log(`Listening to port: ${port}`);
})