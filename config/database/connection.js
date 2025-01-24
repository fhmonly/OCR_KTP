require("dotenv").config({
    path: ".env"
})

module.exports = require("knex")({
    client: process.env.DB_CONNECTION,
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        timezone: 'Asia/Bangkok',
    },
    debug: true
})
