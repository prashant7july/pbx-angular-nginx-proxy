const { knex } = require("../config/knex.db");

function createModuleLog(tableName, data) {
  let sql = knex(tableName)
    .insert(data)     
    sql.then(() => {
      console.log(`module logged created on ${tableName}`);
    })
    .catch((err) => {
      console.log({ code: err.errno, message: err.sqlMessage, tableName });
    });
}

module.exports = {
  createModuleLog,
};
