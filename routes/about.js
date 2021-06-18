require('dotenv').config();
require ("../db/conn");

const express = require ("express");

const router = new express.Router()



router.get ("/", (req, res) => {
    
    res.render ("about", 
        {
            title: "Abnout Us"

        }
    )
})


module.exports = router;