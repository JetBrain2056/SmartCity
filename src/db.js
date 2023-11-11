const { Sequelize } = require('sequelize')
// const { Client } = require('pg'); 
 
// const client = new Client({
//     host: process.env.DB_HOST, 
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,     
//     password: process.env.DB_PASSWORD, 

// }); 
// client.connect(); 

// client.query('CREATE DATABASE "' + process.env.DB_NAME+'";',(err, res) => {
//     console.log(err, res);
//     client.end();
// });

let sequelize;

try {
    sequelize = new Sequelize(
    process.env.DB_NAME,    
    process.env.DB_USER,     
    process.env.DB_PASSWORD, 
        {
            dialect: 'postgres',
            host: process.env.DB_HOST,
            port: process.env.DB_PORT
        }
    )
} catch (err) {
    console.log(err);
}
    
module.exports = sequelize;