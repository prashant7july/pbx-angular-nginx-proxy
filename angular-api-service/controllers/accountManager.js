const { knex } = require("../config/knex.db");
const table = require("../config/table.macros.js");

function getAccountManager(req, res) {
  let customerId = parseInt(req.query.customerId);
  if (req.query.userType == "1") {
    let sql = knex
      .from(table.tbl_Customer)
      .where("id", "=", "" + customerId + "")
      .select("account_manager_id", "created_by");
    sql
      .then((response) => {
        let create_by = Object.values(JSON.parse(JSON.stringify(response)));
        let createdBy = create_by[0].created_by;
        if (response.length > 0) {
          let accountManagerId = Object.values(
            JSON.parse(JSON.stringify(response))
          );
          let lastInsertedAccountManagerId =
            accountManagerId[0].account_manager_id;
            console.log(createdBy,"-----------");
          if (createdBy != 2) {

            let sql1 = knex
              .from(table.tbl_Customer)
              .where("id", "=", "" + createdBy + "")
              .select(
                "id",
                knex.raw("CONCAT(first_name, ' ',last_name) as name"),
                "mobile",
                "email"
              );
              console.log(sql1.toQuery());
            sql1
              .then((response) => {
                if (response.length > 0) {
                  res.json({
                    response,
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(401)
                  .send({
                    error: "error",
                    message: "DB Error: " + err.message,
                  });
                throw err;
              });
          } else {
            //console.log((knex.from(table.tbl_Customer).where('account_manager_id','=',""+lastInsertedAccountManagerId+"")
            let sql1 = knex
              .from(table.tbl_Customer)
              .where("id", "=", "" + lastInsertedAccountManagerId + "")
              .select(
                "id",
                knex.raw("CONCAT(first_name, ' ',last_name) as name"),
                "mobile",
                "email"
              );
            sql1
              .then((response) => {
                if (response.length > 0) {
                  res.json({
                    response,
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(401)
                  .send({
                    error: "error",
                    message: "DB Error: " + err.message,
                  });
                throw err;
              });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  } else if (req.query.userType == "4") {
    var sql = knex
      .from(table.tbl_Customer)
      .whereIn("role_id", ["5"])
      .whereIn("status", ["1"])
      .select(
        "id",
        knex.raw("CONCAT(first_name, ' ',last_name) as name"),
        "mobile",
        "email"
      );

    sql
      .then((response) => {
        if (response.length > 0) {
          res.json({
            response,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  } else if (req.query.userType == "3") {
    var sql = knex
      .from(table.tbl_Customer)
      .where("created_by", req.query.customerId)
      .whereIn("status", ["1"])
      .select(
        "id",
        knex.raw("CONCAT(first_name, ' ',last_name) as name"),
        "mobile",
        "email",
        "company_name"
      );
    sql
      .then((response) => {
        if (response.length > 0) {
          res.json({
            response,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  } else {
    var sql = knex
      .from(table.tbl_Customer)
      .whereIn("role_id", ["4", "5"])
      .whereIn("status", ["1"])
      .select(
        "id",
        knex.raw("CONCAT(first_name, ' ',last_name) as name"),
        "mobile",
        "email"
      );

    sql
      .then((response) => {
        if (response.length > 0) {
          res.json({
            response,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  }
  // else if(req.query.userType == '4'){
  //     var sql = knex.from(table.tbl_Customer).whereIn('role', ['5','4']).whereIn('status',['1'])
  //     .select('id',knex.raw('CONCAT(first_name, \' \',last_name) as name'),'mobile','email');

  //     sql.then((response) => {
  //         if (response.length > 0) {
  //             res.json({
  //                 response
  //             });
  //         }
  //     }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });  throw err });
  // }
}

module.exports = { getAccountManager };
