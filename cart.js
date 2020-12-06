let storeCart = [];

module.exports.addItem = (inItem) => {
    console.log("Adding cart " + inItem._id);
    return new Promise((resolve, reject) => {
        storeCart.push(inItem);
        resolve(storeCart.length);
    });
}

module.exports.removeItem = (inItem) => {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < storeCart.length; i++) {
            if (storeCart[i].name == inItem) {
                storeCart.splice(i, 1);
                i = storeCart.length;
            }
        }
        resolve();
    });
}

module.exports.getCart = () => {
    return new Promise((resolve, reject) => {
        resolve(storeCart);
    });
}

module.exports.checkout = () => {
    return new Promise((resolve, reject) => {
        console.log("storeCart - Cart is empty")
        storeCart = [];
        resolve(storeCart.length);
    });
}