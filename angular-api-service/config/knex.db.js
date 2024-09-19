var knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.DB_WRITE_HOST || '103.151.107.47',
        // host: process.env.DB_WRITE_HOST || '192.168.4.10',
        // host: process.env.DB_WRITE_HOST || '127.0.0.1',
        user: process.env.DB_USERNAME || 'ccuser',
        password: process.env.DB_PASSWORD || 'cloudVirAmiNag119',
        // password: process.env.DB_PASSWORD || 'kakashi',        
        database: process.env.DB_DATABASE || 'cc_master',
        port: process.env.DB_PORT || 3306,
        connectTimeout: 90000

    },
    pool: { min: 5, max: 50 }
});
module.exports = { knex };
