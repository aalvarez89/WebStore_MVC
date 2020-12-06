const express = require('express');
const router = express.Router();

const db = require('../database.js');


router.get("/", (req, res) => {

    db.getMeals().then((data) => {
        res.render('index', {
            title: "Home Page",
            slogan: "Canada's #1 Meal Kit!",
            data: data
        });
    }).catch((err) => {
        res.render('/');
    })
}); 

router.get("/productListing", (req, res) => {

    db.getMeals().then((data) => {
        res.render('productListing', {
            title: "Meal Packages",
            slogan: "Handcrafted Meal Kits",
            data: data
        });
    }).catch((err) => {
        res.render('/');
    })
}); 





module.exports = router;