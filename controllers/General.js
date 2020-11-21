const express = require('express');
const router = express.Router();

const products = require("../models/products"); //REMOVE
const { getAllProducts } = require("../models/products"); //REMOVE

router.get("/", (req, res)=> {
    res.render("index", {
        title: "Home Page", 
        slogan: "Canada's #1 Meal Kit!",
        data: products.getAllProducts()
    })
}); 

router.get("/productListing", (req, res)=> {
    res.render("productListing", {
        title: "Meal Packages", 
        slogan: "Handcrafted Meal Kits",
        data: products.getAllProducts()
    })
}); 

module.exports = router;