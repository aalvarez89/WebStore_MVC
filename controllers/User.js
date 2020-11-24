const express = require('express');
const db = require('../database.js');
const router = express.Router();
const mailgun = require("mailgun-js")({apiKey: process.env.EMAILPW, domain: process.env.EDOMAIN}); 


function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/user/login");
    } 
    else {
      next();
    }
}

function ensureAdmin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/user/login");
    } 
    else {
        if (req.session.user[0].isAdmin) {
            next();
        } else {
            res.redirect("/user/login");
        }
    }
}

router.get("/register", (req, res)=> {
    res.render("register", {
        title: "Register",
        slogan: "Register Today"
    })
}); 

router.post("/register", (req, res)=> {
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
    if (req.body.password == "") {
        errors.m_messages.push("Enter a password"); 
    } else if (!req.body.password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)) {
        errors.m_messages.push("Password must have at least 8 characters, a letter, a number, and a special character"); 
    }
    
    if (errors.m_messages.length > 0) {
        res.render("register", errors);
        console.log(errors.m_messages); 
    } else {
        let info = {
            from: 'Food Delivery Service <mailgun@samples.mailgun.org>',
            to: req.body.email, 
            subject: `Welcome ${req.body.FirstName}`, 
            text: "Thank you for signing up with our delivery service"
        };
        mailgun.messages().send(info, (error, body)  => {
            console.log(body); 
        });

        db.addUser(req.body).then((inData) => {
            res.redirect('/user/dashboard')
        }).catch((err) => {
            console.log(`Error adding user: ${err}`)
            res.redirect('/register')
        })
    }
})

router.get("/login", (req, res)=> {
    res.render("login", {
        title: "Login",
        slogan: "Enjoy Your Meal!"
    })
}); 

router.post("/login", (req, res)=> {
    let errors = {
        m_messages: [], 
        m_email: ""
    }
    // EMAIL
    if (req.body.email == "") {
        errors.m_messages.push("Enter your email"); 
    } else {
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
    
    if (errors.m_messages.length > 0) {
        res.render("login", errors);
        console.log(errors.m_messages); 
    } else {
        db.validateUser(req.body)
        .then((inData) => {
            // Logs in a user
            console.log(inData)
            req.session.user = inData;

            res.render("dashboard", {
                title: "Dashboard",
                users: inData[0]
            })

        }).catch((err) => {
            console.log(err)
            res.redirect("/login")
        })
    }
})

router.get("/dashboard", ensureLogin, (req, res) => {
    res.render("dashboard", {
        title: "Dashboard",
        users: req.session.user[0]
    });
});

router.get("/createmeals", ensureAdmin, (req, res)=> {
    res.render("createmeals", {
        // title: "Create Meals",
        slogan: "Create Meals"
    })
}); 

router.post("/createmeals", ensureAdmin, (req, res)=> {
    let errors = {
        messages : [],
        fName: '',
        lName: '',
        email: ''
    };


    if (errors.messages.length > 0) {
        res.render('createmeals', errors)
        console.log(errors.messages)
    } else {
        db.createMeal(req.body).then((inData) => {
            req.session.user = inData;
            res.render('dashboard', {
                title: "Dashboard",
                users: req.session.user[0]
            }) 
        }).catch((err) => {
            console.log(`Error adding meal ${err}`)
            res.redirect('/user/createmeals')
        })
          
    }
}); 



router.get("/logout", function(req, res) {
    req.session.destroy()
    res.redirect("/user/login")
  });

module.exports = router;