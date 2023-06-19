const mongoose = require('mongoose');
const { CONNECTION_STRING }=require('../config/index')

// const CONNECTION_STRING = "mongodb+srv://msagheer:0090msagheer0090@cluster0.7zsa1nt.mongodb.net/coin-bounce?retryWrites=true&w=majority";

const dbconnect = async () => {
    try {
        const conn = await mongoose.connect(CONNECTION_STRING);
        console.log("Database is connected " + conn.connection.host);

    } catch (err) {
        console.log(err);
    }
};

module.exports = dbconnect;
// const mongoose = require('mongoose');
// const {MONGODB_CONNECTION_STRING}=require('../config/index')

// // const MONGODB_CONNECTION_STRING = MONGODB_CONNECTION_STRING

// const dbconnect = async () => {
//     try {
//        const corn= await mongoose.connect(MONGODB_CONNECTION_STRING);
//        console.log("conection is established : "+ corn.connection.host )

//     } catch (err) {
//         console.log("Errr" + err)
//     }
// }
// module.exports = dbconnect;