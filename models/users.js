const mongoose = require ("mongoose");
const validator = require ("validator");
const users = mongoose.model ("User", 
    {
        first_name: {
            type: String,
            required: true,
            default: "firstname",
            minlength: 3,
            maxlength: 50
        },
        last_name: {
            type: String,
            required: true,
            default: "lastname",
            minlength: 3,
            maxlength: 50
        },
        email: {
            type: String,
            required: true,
            default: "somename",            
            minlength: 3,
            maxlength: 50,
            createIndexes: true,
            validate (value) {
                if (!validator.isEmail(value)) {
                    throw new Error ("Email is invalid.");
                }
            }
        },
        gender: {
            type: String,
            required: true,
            default: "somename"
        },
        phone: {
            type: String,
            required: true,
            default: "somename",
            minlength: 11,
            maxlength: 12

        },
        age: {
            type: String,
            required: true,
            default: "somename",
            minlength: 1,
            maxlength: 2
        },
        password: {
            type: String,
            required: true,
            default: "somename",
            minlength: 5,
            maxlength: 25
        }
    }
)

module.exports = users;