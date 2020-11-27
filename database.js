const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');



const Schema = mongoose.Schema;

const userSchema = new Schema({
    
    FirstName: String,
    LastName: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    isAdmin: Boolean
})

const mealSchema = new Schema({
    title: String,
    included: String,
    synopsis: String,
    category: String,
    price: Number,
    cookTime: String,
    noOfMeals: Number,
    calories: String,
    isTopPkg: Boolean,
    imgUrl: String,
})



let Users;
let Meals;


module.exports.initialize = () => {
    return new Promise ((resolve, reject) => {
        let db = mongoose.createConnection(`mongodb+srv://eforrester:${process.env.DB_PASS}@cluster0.t6zhk.gcp.mongodb.net/db_w322?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
        
        mongoose.set('useCreateIndex', true);

        db.on('error', (err) => {
            reject(err)
        })

        db.once('open', () => {
            Users = db.model('user_dbs', userSchema);
            Meals = db.model('meal_dbs', mealSchema);
            resolve()
        })
    })

    
}


// MANAGE USERS

module.exports.addUser = (data) => {
    return new Promise ((resolve, reject) => {
        
        for (let formEntry in data) {
            if (data[formEntry] == '') data[formEntry] = null;
        }

        let newUser = new Users(data);

        bcrypt.genSalt(10)
        .then(salt=>bcrypt.hash(newUser.password,salt))
        .then(hash=>{
            newUser.password = hash;
            newUser.isAdmin = false;

            newUser.save((err) => {
                if (err) {
                    console.log(`ERROR: ${err}`)
                    reject()
                }
                else {
                    console.log('User stored in database.')
                    resolve()
                }
            })
        })
        .catch(err=>{
            console.log(err);
            reject("Hashing Error")
        });

    })
}

module.exports.getUsers = (data) => {
    return new Promise ((resolve, reject) => {
        Users.find()
        .exec()
        .then((returnedUsers) => {
            resolve(returnedUsers.map((user) => user.toObject()))
        }).catch((err) => {
            console.log(`Error retrieving Users: ${err}`)
            reject(err)
        })
    })
}

module.exports.getUsersByEmail = (inEmail) => {
    return new Promise ((resolve, reject) => {
        Users.find({email: inEmail})
        .exec()
        .then((returnedUsers) => {

            if(returnedUsers.length != 0) resolve(returnedUsers.map((user) => user.toObject()))
            else reject('No Users found')

        }).catch((err) => {
            console.log(`Error retrieving Users: ${err}`)
            reject(err)
        })
    })
}

module.exports.validateUser = (data) => {
    return new Promise((resolve, reject) => {
        if (data) {
            this.getUsersByEmail(data.email).then((foundStudent) => {
                bcrypt.compare(data.password, foundStudent[0].password).then((pwMatches) => {
                    if (pwMatches) {
                        resolve(foundStudent)

                    } else {
                        reject("Passwords don't match")
                        return

                    }
                    
                });

            }).catch((err) => {
                reject(err)
                return
            })
        }

    })
}

// MANAGE MEALS

module.exports.createMeal = (data) => {
    return new Promise ((resolve, reject) => {
        
        data.isTopPkg = (data.isTopPkg)? true: false;

        for (let formEntry in data) {
            console.log(formEntry, formEntry.valueOf())
            if (data[formEntry] == '') data[formEntry] = null;
        }

        let newMeal = new Meals(data);

        newMeal.save((err) => {
            if (err) {
                console.error(`ERROR: ${err}`)
                reject()
            }
            else {
                console.log(`Meal [${data.name}] stored in database: `)
                resolve()
            }
        })
    })
}

module.exports.getMeals = (data) => {
    return new Promise ((resolve, reject) => {
        Meals.find()
        .exec()
        .then((returnedMeals) => {
            resolve(returnedMeals.map((meal) => meal.toObject()))
        }).catch((err) => {
            console.log(`Error retrieving Meals: ${err}`)
            reject(err)
        })
    })
}

module.exports.editMeal = (editData)=>{
    return new Promise((resolve, reject)=>{
        editData.isTopPkg = (editData.isTopPkg)? true: false;
       
        Meals.updateOne(
        {title : editData.title},
        {$set: { 
            title: editData.title,
            included: editData.included,
            category: editData.category,
            price: editData.price,
            synopsis: editData.synopsis,
            imageUrl: editData.imageUrl,
            cookTime: editData.cookTime,
            noOfMeals: editData.noOfMeals,
            calories: editData.calories,
            isTopPkg: editData.isTopPkg
        }})
        .exec() //calls the updateOne as a promise
        .then(()=>{
            console.log(`Meal ${editData.name} has been updated`);
            resolve();
        }).catch((err)=>{
            reject(err);
        });
     
    });
}