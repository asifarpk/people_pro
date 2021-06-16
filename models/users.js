const mongoose = require ("mongoose");
const validator = require ("validator");
const bcrypt = require ("bcryptjs");
const jwt = require ("jsonwebtoken");


const usersSchema = new mongoose.Schema (
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
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }]
    }
)
// Hashing Password (using Schema) before the recored is saved
usersSchema.pre ("save", async function (next) {
    if (this.isModified("password")) {
        // hashing password
        this.password = await bcrypt.hash(this.password, 10);

        // Generating and Hashing Token
        const token = await jwt.sign({_id: this._id.toString(), type: "reg"}, `${this.first_name}${this.last_name}`);
        console.log (token);

        // adding token field in the database
        this.tokens = this.tokens.concat({token:token});

        next();
    }
})

const users = mongoose.model ("User", usersSchema);
module.exports = users;