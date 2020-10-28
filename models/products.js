const product = {
    fakedb:[], 
    initDB() {
        
        this.fakedb.push({
            img: "i1.PNG", 
            title: "Maple-Mustard Glazed Mini Meatloaves", 
            included: "Meat and Vegetables",
            synopsis: "over Mashed Potatoes and Roasted Broccoli", 
            category: "Classic", 
            price: 15.99, 
            cookTime: "30 Minutes",
            noOfMeals: 2, 
            calories: "900",
            topPackage: true
        })
        this.fakedb.push({
            img: "i2.PNG", 
            title: "Cider Braised Chicken and Apples", 
            included: "Meat and Vegetables",
            synopsis: "with Kale and Roasted Potatoes", 
            category: "Easy Prep", 
            price: 16.99, 
            cookTime: "20 Minutes",
            noOfMeals: 2, 
            calories: "800",
            topPackage: false           
        })
        this.fakedb.push({
            img: "i3.PNG", 
            title: "Hearty Roasted Root Vegetable Coconut Curry", 
            included: "Vegetables and Curry",
            synopsis: "with Chickpeas and Warm Naan", 
            category: "Family", 
            price: 18.99, 
            cookTime: "25 Minutes",
            noOfMeals: 4, 
            calories: "1000",
            topPackage: true          
        })
        this.fakedb.push({
            img: "i4.PNG", 
            title: "Sesame-Cashew Butter Shanghai Noodles", 
            included: "Vegetables and Noodles",
            synopsis: "with Sauteed Vegetables and Celery-Radish Slaw", 
            category: "Classic", 
            price: 16.99, 
            cookTime: "15 Minutes",
            noOfMeals: 3, 
            calories: "750",
            topPackage: true           
        })

    },
    getAllProducts() {
        return this.fakedb; 
    },
    getFeaturedProducts() {
        // create arr that only has topPackages = true
        this.fakedb.forEach((value)=> {
            var temp = []; 
            if (value.topPackage == true) {
                temp.push(value); 
            }
        })
        return temp; 
    }

}

product.initDB(); 
module.exports = product; 