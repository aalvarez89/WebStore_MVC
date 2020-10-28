const express = require("express"); 
const exphbs = require('express-handlebars'); 

const products = require("./models/products"); 
const { getAllProducts } = require("./models/products"); 

const app = express(); 

app.engine('handlebars', exphbs()); 
app.set('view engine', 'handlebars'); 

app.use(express.static("public")); 

app.use(bodyParser.urlencoded({ extended: false }));

// email a2
const apiKey = require("./models/email"); 
const emailService = new apiKey(); 

const m_apiKey = emailService.getKey(); 
const m_domain = emailService.getDomain(); 
const mailgun = require("mailgun-js")({apiKey: m_apiKey, domain: m_domain}); 
// 


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

// REGISTRATION -> FORM VALIDATION
app.post("/register", (req, res)=> {
    let errors = {
        m_messages: [], 
        m_firstName: "",
        m_lastName: "", 
        m_email: ""
    }
    // FIRST NAME
    if (req.body.FirstName == "") {
        errors.m_messages.push("Enter your first name"); 
    } else {
        errors.m_firstName = req.body.FirstName; 
    }
    // LAST NAME
    if (req.body.LastName == "") {
        errors.m_messages.push("Enter your last name"); 
    } else {
        errors.m_lastName = req.body.LastName; 
    }
    // EMAIL
    if (req.body.email == "") {
        errors.m_messages.push("Enter your email"); 
    } else {
        // must be anystring@anystring.anystring
        if (!req.body.email.match(/\S+@\S+\.\S+/)) {
            errors.m_messages.push("Enter a valid email"); 
        } else {
            errors.m_email = req.body.email; 
        }
    }
    // PASSWORD
    if (req.body.password =="") {
        errors.m_messages.push("Enter a password"); 
    } else if (!req.body.password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)) {
        errors.m_messages.push("Password must have at least 8 characters, a letter, a number, and a special character"); 
    }
    
    if (errors.m_messages.length>0) {
        res.render("register", errors);
        console.log(errors.m_messages); 
    } else {
        const info = {
            from: 'Food Delivery Service <mailgun@samples.mailgun.org>',
            to: req.body.email, 
            subject: `Welcome ${req.body.FirstName}`, 
            text: "Thank you for signing up with our delivery service"
        };
        mailgun.messages().send(info, (error, body)  => {
            console.log(body); 
        });
        res.redirect('/'); 
    }
})


// LOGIN
app.get("/login", (req, res)=> {
    res.render("login", {
        title: "Login",
        slogan: "Enjoy Your Meal!"
    })
}); 

// LOGIN -> FORM VALIDATION
app.post("/login", (req, res)=> {
    let errors = {
        m_messages: [], 
        m_email: ""
    }
    // EMAIL
    if (req.body.email == "") {
        errors.m_messages.push("Enter your email"); 
    } else {
        // must be anystring@anystring.anystring
        if (!req.body.email.match(/\S+@\S+\.\S+/)) {
            errors.m_messages.push("Enter a valid email"); 
        } else {
            errors.m_email = req.body.email; 
        }
    }
    // PASSWORD
    if (req.body.password =="") {
        errors.m_messages.push("Enter a password"); 
        // must be minimum 8 characters, 1+ letter, 1+ number, 1+ special character
    }
    
    if (errors.m_messages.length>0) {
        res.render("login", errors);
        console.log(errors.m_messages); 
    } 
    res.redirect('/'); 
})
const PORT = process.env.PORT || 3000;  

app.listen(PORT, ()=> {
    console.log(`The web server is up and running`); 
})