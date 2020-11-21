//Express
const express = require("express"); 
const app = express(); 

//Dotenv
require('dotenv').config()

//Database
const db = require('./database.js');

//Handlebars
const exphbs = require('express-handlebars'); 
app.engine('handlebars', exphbs()); 
app.set('view engine', 'handlebars'); 

//Static Directory
app.use(express.static("public")); 

//Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

//Email App
const mailgun = require("mailgun-js")({apiKey: process.env.EMAILPW, domain: process.env.EDOMAIN}); 

//Sessions
const session = require("express-session");

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next)=>{
    // res.locals.user is a global handlebars variable.
    // This means that ever single handlebars file can access that user variable
    res.locals.user = req.session.user;
    next();
});

const generalRoutes = require("./controllers/General");
const userRoutes = require("./controllers/User");

app.use("/", generalRoutes);
app.use("/user", userRoutes);


const PORT = process.env.PORT;

db.initialize()
.then(() => {
    console.log('Data read successfully')
    app.listen(PORT, () => {
        console.log(`Server up and listening on Port: ${PORT}!`)
    })

})
.catch((data) => {
    console.log(data)
})