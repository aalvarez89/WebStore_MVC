const express = require("express"); 
const exphbs = require('express-handlebars'); 

const products = require("./models/products"); 
const { getAllProducts } = require("./models/products"); 

const app = express(); 

app.engine('handlebars', exphbs()); 
app.set('view engine', 'handlebars'); 

app.use(express.static("public")); 

app.use(bodyParser.urlencoded({ extended: false }));

// HOME
app.get("/", (req, res)=> {
    res.render("index", {
        title: "Home Page", 
        slogan: "Canada's #1 Meal Kit!",
        data: products.getAllProducts()
    })
}); 

// PRODUCTS
app.get("/productListing", (req, res)=> {
    res.render("productListing", {
        title: "Meal Packages", 
        slogan: "Handcrafted Meal Kits",
        data: products.getAllProducts()
    })
}); 

// REGISTRATION
app.get("/register", (req, res)=> {
    res.render("register", {
        title: "Register",
        slogan: "Register Today"
    })
}); 

// LOGIN
app.get("/login", (req, res)=> {
    res.render("login", {
        title: "Login",
        slogan: "Enjoy Your Meal!"
    })
}); 

const port = 3000; 

app.listen(port, ()=> {
    console.log(`The web server is up and running`); 
})