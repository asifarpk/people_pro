// Server
const express = require("express");
const app = express();
const hbs = require ("hbs");

// Requiring Routes
const login = require ("./routes/login");
const register = require ("./routes/register");
const about = require ("./routes/about");

const port = process.env.PORT || 5000;

app.use('/public', express.static(__dirname + "/public"));

// Routing
app.use("/login", login);
app.use("/register", register);
app.use("/about", about);

// View Engine
app.set ("view engine", "hbs");
hbs.registerPartials("views/partials");


// index
app.get ("/", (req, res) => {
    res.render ("index", {title: "Home"});
})


app.listen (port, () => {
    console.log(`Listening to port: ${port}`);
})