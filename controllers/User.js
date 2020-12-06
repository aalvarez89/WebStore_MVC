//Framework
const express = require('express');
const router = express.Router();

//Database module
const db = require('../database.js');

//Cart module
const cart = require('../cart.js');

//Email App
const mailgun = require("mailgun-js")({
    apiKey: process.env.EMAILPW,
    domain: process.env.EDOMAIN
});

const url = require('url');

// Login Middleware
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/user/login");
    } else {
        next();
    }
}

function ensureAdmin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/user/login");
    } else {
        if (req.session.user[0].isAdmin) {
            next();
        } else {
            res.redirect("/user/login");
        }
    }
}



// Register Middleware
router.get("/register", (req, res) => {
    res.render("register", {
        title: "Register",
        slogan: "Register Today"
    })
});

router.post("/register", (req, res) => {
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
        mailgun.messages().send(info, (error, body) => {
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

router.get("/login", (req, res) => {
    res.render("login", {
        title: "Login",
        slogan: "Enjoy Your Meal!"
    })
});

router.post("/login", (req, res) => {
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
    if (req.body.password == "") {
        errors.m_messages.push("Enter a password");
        // must be minimum 8 characters, 1+ letter, 1+ number, 1+ special character
    }

    if (errors.m_messages.length > 0) {
        res.render("login", errors);
        console.log(errors.m_messages);
    } else {
        db.validateUser(req.body)
            .then((inData) => {
                req.session.user = inData;
                res.redirect("/user/dashboard")

            }).catch((err) => {
                console.log(err)
                res.redirect("/login")
            })
    }
})



// Dashboard
router.get("/dashboard", ensureLogin, (req, res) => {
    cart.getCart().then((data) => {
        res.render("dashboard", {
            title: "Dashboard",
            users: req.session.user[0],
            cartItemsQty: data.length
        });

    })
});



// Meal Management Middleware
router.get("/createmeals", ensureAdmin, (req, res) => {
    res.render("createmeals", {
        // title: "Create Meals",
        slogan: "Create Meals"
    })
});

router.post("/createmeals", ensureAdmin, (req, res) => {
    let errors = {
        messages: [],
        fName: '',
        lName: '',
        email: ''
    };

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files')
    }
    let imageFile = req.files.file;
    // console.log(imageFile)
    // req.files.profilePic.name = `pro_pic_${userSaved._id}${path.parse(req.files.profilePic.name).ext}`;

    imageFile.mv(`public/img/${imageFile.name}`)

    console.log(req.body.imgUrl)
    req.body.imgUrl = imageFile.name;

    if (errors.messages.length > 0) {
        res.render('createmeals', errors)
    } else {
        // console.log(req.session.user[0].FirstName) // USE THIS!!!
        db.createMeal(req.body).then((inData) => {
            // console.log(inData)
            // console.log(req.files)
            res.redirect('/user/dashboard')
        }).catch((err) => {
            console.log(`Error adding meal ${err}`)
            res.redirect('/user/createmeals')
        })

    }

});

router.get("/editmeals", ensureAdmin, (req, res) => {
    res.render("editmeals", {
        slogan: "Edit Meals"
    })
});

router.post("/editmeals", ensureAdmin, (req, res) => {
    db.editMeal(req.body).then(() => {
        res.redirect("/dashboard");
    }).catch((err) => {
        console.log(err);
        res.redirect("/user/editmeals");
    })
});

router.get("/viewmeals", ensureAdmin, (req, res) => {
    db.getMeals().then((inData) => {
        res.render('viewMeals', {
            title: "View Meals",
            slogan: "Meals List",
            data: inData
        });
    }).catch((err) => {
        res.redirect('/');
    })
})



// Shopping Cart Middleware
router.get("/productListing/:id", (req, res) => {
    db.getMealById(req.params.id).then((data) => {
        // console.log(data)
        res.render('mealTemplate', {
            mealData: data,
        })
    }).catch((err) => {
        res.redirect('/productListing')
    })
})

router.post("/productListing/:id/add", ensureLogin, (req, res) => {
    db.getMealById(req.body.mealId).then((data) => {
        // console.log(data)
        cart.addItem(data)
        res.redirect('/user/dashboard')

    }).catch((err) => {
        res.redirect('/login')
    })
})

router.get("/cart", ensureLogin, (req, res) => {
    // console.log(req.session.user[0].email)
    cart.getCart().then((data) => {
        // console.log(data)
        // let total = data.reduce((acc, item) => acc + item.price, 0);
        res.render("cart", {
            title: "Shopping Cart",
            slogan: "Ready to Checkout?",
            cartData: data,
            cartTotal: data.reduce((acc, item) => acc + item.price, 0),
            cartItemsQty: data.length
        })

    }).catch((err) => {
        res.redirect('/user/dashboard')
    })

});

router.post("/cart", ensureLogin, (req, res) => {
    cart.getCart().then((data) => {

        let orderString = "\n";
        data.forEach(m => {
            orderString += "$" + m.price + " __________ " + m.title + "\n";
        })
        
        let info = {
            from: 'Food Delivery Service <mailgun@samples.mailgun.org>',
            to: req.session.user[0].email,
            subject: `Order Invoice`,
            text: `Thank you for your order of: ${orderString}Your items will be shipped as soon as they're ready.\nTotal: $${data.reduce((acc, item) => acc + item.price, 0)}.`
        };
        
        mailgun.messages().send(info, (error, body) => {
            console.log(body);
        });

        cart.checkout().then((inData) => {
            res.redirect('/user/dashboard')
        }).catch((err) => {
            console.log(`Error emptying cart: ${err}`)
            res.redirect('/user/dashboard')
        })
    }).catch((err) => {
        res.redirect('/user/dashboard')
    })

});



// Logout
router.get("/logout", function (req, res) {
    req.session.destroy()
    res.redirect("/user/login")
});






module.exports = router;