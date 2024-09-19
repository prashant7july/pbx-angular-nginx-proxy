const { knex } = require("../config/knex.db");
const table = require("../config/table.macros.js");
const pushEmail = require("./pushEmail");
var moment = require("moment");
const { createModuleLog } = require("../helper/modulelogger");

function createTicket(req, res) {
  let request = req.body;    
  request.assigned_to = request.assigned_to ? request.assigned_to : null;
  let message = request.message
    ? String(request.message).replace(/'/g, "\\'")
    : "";
  let modified_by = req.userId;

  if (!request.id) {
    if (!request.assigned_to) {
      knex(table.tbl_Customer)
        .where("id", "=", "" + request.customer_id + "")
        .select("account_manager_id")
        .then((response1) => {
          if (response1.length > 0) {
            let account_manager_id = Object.values(
              JSON.parse(JSON.stringify(response1))
            );
            account_manager_id1 = account_manager_id[0].account_manager_id;

            knex(table.tbl_Product)
              .where("name", "=", "" + request.product + "")
              .select("id")
              .then((response2) => {
                if (response2.length > 0) {
                  let productid = Object.values(
                    JSON.parse(JSON.stringify(response2))
                  );
                  lastproductid = productid[0].id;
                  let arr = {
                    message: request.message,
                    ticket_type: request.ticket_type,
                    assigned_to: request.assigned_to,
                    product: lastproductid,
                    customer: request?.customer,
                    customer_id: request.customer_id,
                    ticket_number: request.ticket_number,
                    id: request?.id,
                    role: request.role,
                    assignedPerson: request.assignedPerson,
                    ticket_type_name: request.ticket_type_name,
                  };

                  knex(table.tbl_Ticket)
                    .insert({
                      customer_id: "" + request.customer_id + "",
                      product_id: "" + lastproductid + "",
                      ticket_number: "" + request.ticket_number + "",
                      ticket_type: "" + request.ticket_type + "",
                      message: "" + message + "",
                      status: "3",
                      assigned_to: "" + account_manager_id1 + "",
                      account_manager_id: "" + request.assignedPerson + "",
                      role: "" + request.role + "",
                    })
                    .then((response) => {
                      if (response.length > 0) {
                        pushEmail
                          .getCustomerNameandEmail(request.assignedPerson)
                          .then((data) => {
                            pushEmail
                              .getEmailContentUsingCategory("TicketCreation")
                              .then((val) => {
                                pushEmail
                                  .sendmail({
                                    data: data,
                                    val: val,
                                    ticket_number: request.ticket_number,
                                    ticket_type: request.ticket_type_name,
                                    product: request.product,
                                    ticketMessage: request.message,
                                  })
                                  .then((data1) => {
                                    //res.json({ data1 })
                                  });
                              });
                          });
                        createModuleLog(
                          table.tbl_pbx_ticket_list_detail_history,
                          {
                            ticket_id: request?.id, // it will be implemented later
                            action: "New Ticket List Detail Created",
                            modified_by,
                            data: "" + JSON.stringify(arr) + "",
                          }
                        );
                        res.json({
                          response,
                        });
                      } else {
                        res.status(401).send({
                          error: "Unauthorized",
                          message: "Ticket Creation error",
                        });
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                      throw err;
                    });
                } else {
                  res.status(401).send({
                    error: "Unauthorized",
                    message: "Ticket Creation error",
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                throw err;
              });
          } else {
            res.status(401).send({
              error: "Unauthorized",
              message: "Ticket Creation error",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    } else {
      knex(table.tbl_Product)
        .where("name", "=", "" + request.product + "")
        .select("id")
        .then((response2) => {
          if (response2.length > 0) {
            let productid = Object.values(
              JSON.parse(JSON.stringify(response2))
            );
            lastproductid = productid[0].id;
            let arr = {
              message: request.message,
              ticket_type: request.ticket_type,
              assigned_to: request.assigned_to,
              product: lastproductid,
              customer: request?.customer,
              customer_id: request.customer_id,
              ticket_number: request.ticket_number,
              id: request?.id,
              role: request.role,
              assignedPerson: request.assignedPerson,
              ticket_type_name: request.ticket_type_name,
            };
            knex(table.tbl_Ticket)
              .insert({
                customer_id: "" + request.customer_id + "",
                product_id: "" + lastproductid + "",
                ticket_number: "" + request.ticket_number + "",
                ticket_type: "" + request.ticket_type + "",
                message: "" + message + "",
                status: "3",
                assigned_to: "" + request.assigned_to + "",
                account_manager_id: "" + request.assignedPerson + "",
                role: "" + request.role + "",
              })
              .then((response) => {
                if (response.length > 0) {
                  pushEmail
                  .getCustomerNameandEmail(request.role == 4 ? request.assigned_to : request.assignedPerson)
                    .then((data) => {
                      pushEmail
                        .getEmailContentUsingCategory("TicketCreation")
                        .then((val) => {
                          pushEmail
                            .sendmail({
                              data: data,
                              val: val,
                              ticket_number: request.ticket_number,
                              ticket_type: request.ticket_type_name,
                              product: request.product,
                              ticketMessage: request.message,
                            })
                            .then((data1) => {
                              //res.json({ data1 })
                            });
                        });
                    });
                  createModuleLog(table.tbl_pbx_ticket_list_detail_history, {
                    ticket_id: request?.id, // it will be implemented later
                    action: "New Ticket List Detail Created",
                    modified_by,
                    data: "" + JSON.stringify(arr) + "",
                  });
                  res.json({
                    response,
                  });
                } else {
                  res.status(401).send({
                    error: "Unauthorized",
                    message: "Ticket Creation error",
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                throw err;
              });
          } else {
            res.status(401).send({
              error: "Unauthorized",
              message: "Ticket Creation error",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    }
  } else {
    if (!request.assigned_to) {
      knex(table.tbl_Customer)
        .where("id", "=", "" + request.customer_id + "")
        .select("account_manager_id")
        .then((response1) => {
          if (response1.length > 0) {
            let account_manager_id = Object.values(
              JSON.parse(JSON.stringify(response1))
            );
            account_manager_id1 = account_manager_id[0].account_manager_id;

            knex(table.tbl_Product)
              .where("name", "=", "" + request.product + "")
              .select("id")
              .then((response2) => {
                if (response2.length > 0) {
                  let productid = Object.values(
                    JSON.parse(JSON.stringify(response2))
                  );
                  lastproductid = productid[0].id;
                  let arr = {
                    message: request.message,
                    ticket_type: request.ticket_type,
                    assigned_to: request.assigned_to,
                    product: lastproductid,
                    customer: request?.customer,
                    customer_id: request.customer_id,
                    ticket_number: request.ticket_number,
                    id: request?.id,
                    role: request.role,
                    assignedPerson: request.assignedPerson,
                    ticket_type_name: request.ticket_type_name,
                  };
                  knex(table.tbl_Ticket)
                    .where("id", "=", "" + request.id + "")
                    .update({
                      customer_id: "" + request.customer_id + "",
                      product_id: "" + lastproductid + "",
                      ticket_number: "" + request.ticket_number + "",
                      ticket_type: "" + request.ticket_type + "",
                      message: "" + message + "",
                      status: "3",
                      assigned_to: "" + account_manager_id1 + "",
                      account_manager_id: "" + request.assignedPerson + "",
                      role: "" + request.role + "",
                    })
                    .then((response) => {
                      if (response.length > 0) {
                        pushEmail
                          .getCustomerNameandEmail(request.assignedPerson)
                          .then((data) => {
                            pushEmail
                              .getEmailContentUsingCategory("TicketCreation")
                              .then((val) => {
                                pushEmail
                                  .sendmail({
                                    data: data,
                                    val: val,
                                    ticket_number: request.ticket_number,
                                    ticket_type: request.ticket_type_name,
                                    product: request.product,
                                    ticketMessage: request.message,
                                  })
                                  .then((data1) => {
                                    //res.json({ data1 })
                                  });
                              });
                          });
                        createModuleLog(
                          table.tbl_pbx_ticket_list_detail_history,
                          {
                            ticket_id: request?.id, // it will be implemented later
                            action: "New Ticket List Detail Created",
                            modified_by,
                            data: "" + JSON.stringify(arr) + "",
                          }
                        );
                        res.send({
                          code: 200,
                          message: "Ticket created successfully!",
                        });
                      } else {
                        res.status(401).send({
                          error: "Unauthorized",
                          message: "Ticket Creation error",
                        });
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                      throw err;
                    });
                } else {
                  res.status(401).send({
                    error: "Unauthorized",
                    message: "Ticket Creation error",
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                throw err;
              });
          } else {
            res.status(401).send({
              error: "Unauthorized",
              message: "Ticket Creation error",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    } else {
      knex(table.tbl_Product)
        .where("name", "=", "" + request.product + "")
        .select("id")
        .then((response2) => {
          if (response2.length > 0) {
            let productid = Object.values(
              JSON.parse(JSON.stringify(response2))
            );
            lastproductid = productid[0].id;
            let arr = {
              message: request.message,
              ticket_type: request.ticket_type,
              assigned_to: request.assigned_to,
              product: lastproductid,
              customer: request?.customer,
              customer_id: request.customer_id,
              ticket_number: request.ticket_number,
              id: request?.id,
              role: request.role,
              assignedPerson: request.assignedPerson,
              ticket_type_name: request.ticket_type_name,
            };
            knex(table.tbl_Ticket)
              .where("id", "=", "" + request.id + "")
              .update({
                customer_id: "" + request.customer_id + "",
                product_id: "" + lastproductid + "",
                ticket_number: "" + request.ticket_number + "",
                ticket_type: "" + request.ticket_type + "",
                message: "" + message + "",
                status: "3",
                assigned_to: "" + request.assigned_to + "",
                account_manager_id: "" + request.assignedPerson + "",
                role: "" + request.role + "",
              })
              .then((response) => {
                if (response.length > 0) {
                  pushEmail
                    .getCustomerNameandEmail(request.role == 4 ? request.assigned_to :  request.assignedPerson)
                    .then((data) => {
                      pushEmail
                        .getEmailContentUsingCategory("TicketUpdation")
                        .then((val) => {
                          pushEmail
                            .sendmail({
                              data: data,
                              val: val,
                              ticket_number: request.ticket_number,
                              ticket_type_name: request.ticket_type_name,
                              product: request.product,
                              ticketMessage: request.message,
                            })
                            .then((data1) => {
                              //res.json({ data1 })
                            });
                        });
                    });
                  createModuleLog(table.tbl_pbx_ticket_list_detail_history, {
                    ticket_id: request?.id, // it will be implemented later
                    action: "Ticket updated",
                    modified_by,
                    data: "" + JSON.stringify(arr) + "",
                  });
                  res.send({
                    code: 200,
                    message: "Ticket updated successfully!",
                  });
                } else {
                  res.status(401).send({
                    error: "Unauthorized",
                    message: "Ticket updation error",
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                throw err;
              });
          } else {
            res.status(401).send({
              error: "Unauthorized",
              message: "Ticket updation error",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    }
  }
}

async function viewTicket(req, res) {
  // req.body.id = req.body.id ? req.body.id : null;
  if (!req.body.id) {
    // if (req.body.ResellerID == 2) {
    //   let sql = knex
    //   .select(
    //     "t.id",
    //     knex.raw(
    //       'DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'
    //     ),
    //     knex.raw(
    //       'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
    //     ),
    //     knex.raw(
    //       'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
    //     ),
    //     "t.message",
    //     "t.ticket_number",
    //     "p.name as product",

        
    //     knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
    //     knex.raw(
    //       'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
    //     ),
    //     "t.customer_id"
    //   )
    //   .from(table.tbl_Ticket + " as t")
    //   .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    //   .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    //   .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    //   if (req.body.role == 3) {
    //     sql.where("t.customer_id", req.body.ResellerID);
    //   }
    //   sql.orderBy("t.id", "desc")
    //   sql.then((response) => {
    //     if (response.length > 0) {
    //       res.json({
    //         response,
    //       });
    //     } else {
    //       res.status(401).send({ error: "Unauthorized", message: "" });
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     throw err;
    //   });
    // }
    if (req.body.ResellerID == 2) {
      let sql = knex
        .select(
          "t.id",
          knex.raw(
            'DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'
          ),
          knex.raw(
            'IF (t.ticket_type = "0", "New feature", IF(t.ticket_type = "1", "Issue", "Others")) as ticket_type'
          ),
          knex.raw(
            'IF (t.status = "0", "Close", IF(t.status = "1", "Open", IF(t.status = "2", "Inprogress", IF(t.status = "3", "New", "View")))) as status'
          ),
          "t.message",
          "t.ticket_number",
          "p.name as product",
          knex.raw(`
            IF(com.role_id = '3', CONCAT(com.first_name, ' ', com.last_name), CONCAT(c.first_name, ' ', c.last_name)) as assignedTo,
            IF(c.role_id NOT IN ('0','2'), IF(c.company_name != '', c.company_name, com.company_name), (SELECT name FROM company_info LIMIT 1)) as company_name
          `),
          "t.customer_id"
        )
        .from(table.tbl_Ticket + " as t")
        .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
        .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
        .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id");
    
      if (req.body.role == 3) {
        sql.where("t.customer_id", req.body.ResellerID);
      }
      sql.orderBy("t.id", "desc")
        .then((response) => {
          if (response.length > 0) {
            res.json({
              response,
            });
          } else {
            res.status(401).send({ error: "Unauthorized", message: "" });
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    }
    else{
  let sql1 = await knex.select('id').from(table.tbl_Customer).where('created_by',req.body.ResellerID)
  let reseller_customer = []
  sql1.map(item =>{
    reseller_customer.push(item.id)
  })
  let sql = knex
      .select(
        "t.id",
        knex.raw(
          'DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'
        ),
        knex.raw(
          'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
        ),
        knex.raw(
          'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
        ),
        "t.message",
        "t.ticket_number",
        "p.name as product",
        knex.raw(`
        IF(com.role_id = '3', CONCAT(com.first_name, ' ', com.last_name), CONCAT(c.first_name, ' ', c.last_name)) as assignedTo`),
        knex.raw(
          'IF(cust.role_id = "1", cust.company_name, ' +
          'IF(c.role_id IN ("1"), ' +
          'IF(c.company_name != "", c.company_name, com.company_name), ' +
          '(SELECT name FROM company_info LIMIT 1))) as company_name'
        ),
        // knex.raw("CONCAT(cust.first_name, ' ',cust.last_name) as assignedTo"),
        // 'c.company_name as company_name'
        // ,
        't.customer_id'
      )
      .from(table.tbl_Ticket + " as t")
      .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
      .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
      .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
      .leftOuterJoin(table.tbl_Customer + " as cust", "t.customer_id", "cust.id")
      if (req.body.role == 3) {
        sql.where("t.customer_id", req.body.ResellerID)
        sql.orWhere("t.assigned_to",req.body.ResellerID)
        sql.orWhereIn("t.customer_id",reseller_customer)
      }
      sql.orderBy("t.id", "desc")
      sql.then((response) => {
        if (response.length > 0) {
          res.json({
            response,
          });
        } else {
          res.status(401).send({ error: "Unauthorized", message: "" });
        }
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
    }
  }
   else {
   let sql = knex
      .select(
        "t.id",
        knex.raw(
          'DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'
        ),
        knex.raw(
          'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
        ),
        knex.raw(
          'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
        ),
        "t.message",
        "t.ticket_number",
        "p.name as product",
        knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
        knex.raw(
          'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
        ),
        "t.customer_id"
      )
      .from(table.tbl_Ticket + " as t")
      .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
      .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
      .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
      if (req.body.role == 3) {
        sql.where("t.customer_id", req.body.ResellerID);
      }
      sql.andWhere("t.id", "=", "" + req.body.id + "")
      .orderBy("t.id", "desc")
      sql.then((response) => {
        if (response.length > 0) {
          res.json({
            response,
          });
        } else {
          res.status(401).send({ error: "Unauthorized", message: "" });
        }
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  }
  // knex.raw("Call pbx_get_ticket(" + req.body.id + ")")
  //     .then((response) => {
  //         if (response) {
  //             res.send({ response: response[0][0] });
  //         }
  //     }).catch((err) => {
  //         res.send({ response: { code: err.errno, message: err.sqlMessage } });
  //     });
}

function viewTicketId(req, res) {
  // let id = parseInt(req.body.ticket);

  let sql = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticketTypeDesp'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress","New"))) as statusDesp'
      ),
      "t.message",
      "t.ticket_number",
      "p.name as product",
      // knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      // knex.raw(
      //   'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      // ),
      knex.raw(`
      IF(com.role_id = '3', CONCAT(com.first_name, ' ', com.last_name), CONCAT(c.first_name, ' ', c.last_name)) as assignedTo`),
      knex.raw(
        'IF(com.role_id = "1", com.company_name, ' +
        'IF(c.role_id IN ("1"), ' +
        'IF(c.company_name != "", c.company_name, com.company_name), ' +
        '(SELECT name FROM company_info LIMIT 1))) as company_name'
      ),
      "c.id as account_manager_id",
      "t.customer_id",
      "t.status",
      "t.ticket_type",
      "com.role_id as role",
      "com.created_by",
      "t.account_manager_id as acctMngr"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    .where("t.id", "=", "" + req.body.ticket + "")
    .orderBy("t.id", "desc");
  sql
    .then((response) => {
      if (response.length > 0) {
        res.json({
          response,
        });
      } else {
        res.status(401).send({ error: "Unauthorized", message: "" });
      }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}

function viewResellerTicketPBX(req, res) {
  let sql = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      "t.message",
      "t.ticket_number",
      "p.name as product",
      knex.raw("CONCAT(com.first_name, ' ',com.last_name) as assignedTo"),
      knex.raw(
        'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      ),
      "t.customer_id"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    // .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    .where("t.product_id", "=", "1")
    .andWhere('t.customer_id',req.query.user_id)
    // .whereIn(
    //   "t.customer_id",
    //   knex.raw(
    //     `SELECT id FROM customer WHERE created_by = ${req.query.user_id}`
    //   )
    // )
    .orderBy("t.id", "desc");
  if (req.query.limit_flag == 1) {
    sql.limit(10);
  }
  sql
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
  // knex.raw("Call pbx_viewTicketFORPBX()").then((response) => {
  //     if (response) {
  //         res.send({ response: response[0][0] });
  //     }
  // }).catch((err) => {
  //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
  // });
}
function viewTicketFORPBX(req, res) {
  let sql = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      "t.message",
      "t.ticket_number",
      "p.name as product",
      knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      knex.raw(
        'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      ),
      "t.customer_id"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    .where("t.product_id", "=", "1")
    .orderBy("t.id", "desc");
  if (req.query.limit_flag == 1) {
    sql.limit(10);
  }
  sql
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
  // knex.raw("Call pbx_viewTicketFORPBX()").then((response) => {
  //     if (response) {
  //         res.send({ response: response[0][0] });
  //     }
  // }).catch((err) => {
  //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
  // });
}

function viewTicketFORPBXForSupport(req, res) {
  let sql = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      "t.message",
      "t.ticket_number",
      "p.name as product",
      // knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      // knex.raw(
      //   'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      // ),
      knex.raw(`
      IF(com.role_id = '3', CONCAT(com.first_name, ' ', com.last_name), CONCAT(c.first_name, ' ', c.last_name)) as assignedTo,
      IF(c.role_id NOT IN ('0','2'), IF(c.company_name != '', c.company_name, com.company_name), (SELECT name FROM company_info LIMIT 1)) as company_name
    `),
      "t.customer_id"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    .where("t.product_id", "=", "1")
    .andWhere("t.role", "!=", "0")
    .orderBy("t.id", "desc");
  if (req.query.limit_flag == 1) {
    sql.limit(10);
  }
  sql
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}

function viewTicketFOROC(req, res) {
  let sql = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      "t.message",
      "t.ticket_number",
      "p.name as product",
      knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      knex.raw(
        'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      ),
      "t.customer_id"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    .where("t.product_id", "=", "2")
    .orderBy("t.id", "desc");
  if (req.query.limit_flag == 1) {
    sql.limit(10);
  }
  sql
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
  // knex.raw("Call pbx_viewTicketFOROC()").then((response) => {
  //     if (response) {
  //         res.send({ response: response[0][0] });
  //     }
  // }).catch((err) => {
  //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
  // });
}

function viewTicketCustomerWise(req, res) {
  let customerId = parseInt(req.body.userId);

  let query = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      knex.raw("strip_tags(t.message) as message"),
      "t.ticket_number",
      "p.name as product",
      knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      "t.customer_id",
      "com.company_name"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    .where("t.customer_id", "=", "" + customerId + "")
    .orderBy("t.id", "desc");
  if (req.query.limit_flag == 1) {
    query.limit(10);
  }
  query
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

function viewTicketProductandCustomerwise(req, res) {
  let query = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      "t.message",
      "t.ticket_number",
      "p.name as product",
      // knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      // knex.raw(
      //   'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      // ),
      knex.raw(`
        IF(com.role_id = '3', CONCAT(com.first_name, ' ', com.last_name), CONCAT(c.first_name, ' ', c.last_name)) as assignedTo`),
      knex.raw(
        'IF(com.role_id = "1", com.company_name, ' +
        'IF(c.role_id IN ("1"), ' +
        'IF(c.company_name != "", c.company_name, com.company_name), ' +
        '(SELECT name FROM company_info LIMIT 1))) as company_name'
      ),
      "t.customer_id"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    .where(" t.product_id", "=", "" + req.body.productId + "")
    .andWhere("t.customer_id", "=", "" + req.body.userId + "")
    .orWhere("t.assigned_to", "=", "" + req.body.userId + "")
    .orderBy("t.id", "desc");
  if (req.body.limit_flag == 1) {
    query.limit(10);
  }
  query
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  // knex.raw("Call pbx_viewTicketProductandCustomerwise(" + req.body.userId + ", " + req.body.productId + ")").then((response) => {
  //     if (response) {
  //         res.send({ response: response[0][0] });
  //     }
  // }).catch((err) => {
  //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
  // });
}

function ticketHistory(req, res) {
  let ticketStatusForEmail;
  // let message = req.body.ticket.reply ? String(req.body.ticket.reply).replace(/"/g, "'") : '';
  let message = req.body.ticket.message;
  let ticket_type_history = req.body.ticket.ticket_type_history
    ? req.body.ticket.ticket_type_history
    : "";

  let description = req.body.ticket.description
    ? String(req.body.ticket.description).replace(/"/g, "'")
    : "";
  if (req.body.ticket.status == "1") ticketStatusForEmail = "ReplyTicket";
  else if (req.body.ticket.status == "0") ticketStatusForEmail = "TicketClosed";
  else if (req.body.ticket.status == "2")
    ticketStatusForEmail = "TicketInProgress";
  else if (req.body.ticket.status == "3") ticketStatusForEmail = "NewTicket";

  if (!req.body.ticket.updateHistoryId) {
    knex(table.tbl_Ticket)
      .where("id", "=", "" + req.body.ticket.ticket_id + "")
      .update({
        status: "" + req.body.ticket.status + "",
        ticket_type: "" + req.body.ticket.ticket_type + "",
        assigned_to: "" + req.body.ticket.assigned_to + "",
        account_manager_id: "" + req.body.ticket.assignedPerson + "",
      })
      .then((response) => {
        if (response >= 1) {
          knex(table.tbl_Ticket_history)
            .where("ticket_id", "=", "" + req.body.ticket.ticket_id + "")
            .max("ticket_sequence as sequence")
            .then((response) => {
              if (response.length > 0) {
                let sequence = Object.values(
                  JSON.parse(JSON.stringify(response))
                );
                sequence =
                  sequence[0].sequence != 0
                    ? sequence[0].sequence + 1
                    : parseInt(req.body.ticket.ticket_id) + 1;
                knex(table.tbl_Ticket_history)
                  .insert({
                    ticket_id: "" + req.body.ticket.ticket_id + "",
                    ticket_sequence: "" + sequence + "",
                    message: "" + message + "",
                    ticket_type: "" + ticket_type_history + "",
                    reply_by: "" + req.body.ticket.uId + "",
                    name: "" + req.body.ticket.reply_by + "",
                  })
                  .then((response) => {
                    if (response.length > 0) {
                      pushEmail
                        .getCustomerNameandEmail(req.body.ticket.assigned_to)
                        .then((data) => {
                          pushEmail
                            .getEmailContentUsingCategory(ticketStatusForEmail)
                            .then((val) => {
                              pushEmail
                                .sendmail({
                                  data: data,
                                  val: val,
                                  ticket_number: req.body.ticket.ticket_number,
                                  ticket_type: req.body.ticket.ticket_type_name,
                                  product: req.body.ticket.product,
                                  ticketMessage: description,
                                  reply: message,
                                })
                                .then((data1) => {});
                            });
                        });
                      pushEmail
                        .getCustomerNameandEmail(req.body.ticket.uId)
                        .then((data) => {
                          pushEmail
                            .getEmailContentUsingCategory(ticketStatusForEmail)
                            .then((val) => {
                              pushEmail
                                .sendmail({
                                  data: data,
                                  val: val,
                                  ticket_number: req.body.ticket.ticket_number,
                                  ticket_type: req.body.ticket.ticket_type_name,
                                  product: req.body.ticket.product,
                                  ticketMessage: description,
                                  reply: message,
                                })
                                .then((data1) => {});
                            });
                        });
                      res.json({
                        response,
                      });
                    } else {
                      res.status(401).send({
                        error: "Unauthorized",
                        message: "Ticket Creation error",
                      });
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                    throw err;
                  });
              } else {
                res
                  .status(401)
                  .send({ error: "Unauthorized", message: "Ticket Created" });
              }
            })
            .catch((err) => {
              console.log(err);
              throw err;
            });
        } else {
          res
            .status(401)
            .send({ error: "Unauthorized", message: "Ticket Created" });
        }
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  } else {
    let message = req.body.ticket.reply;

    knex(table.tbl_Ticket)
      .where("id", "=", "" + req.body.ticket.ticket_id + "")
      .update({
        status: "" + req.body.ticket.status + "",
        ticket_type: "" + req.body.ticket.ticket_type + "",
        assigned_to: "" + req.body.ticket.assigned_to + "",
        account_manager_id: "" + req.body.ticket.assignedPerson + "",
      })
      .then((response) => {
        if (response >= 1) {
          knex(table.tbl_Ticket_history)
            .where("id", "=", "" + req.body.ticket.updateHistoryId + "")
            .update({
              message: "" + message + "",
              ticket_type: "" + ticket_type_history + "",
            })
            .then((response) => {
              if (response >= 1) {
                pushEmail
                  .getCustomerNameandEmail(req.body.ticket.assigned_to)
                  .then((data) => {
                    pushEmail
                      .getEmailContentUsingCategory(ticketStatusForEmail)
                      .then((val) => {
                        pushEmail
                          .sendmail({
                            data: data,
                            val: val,
                            ticket_number: req.body.ticket.ticket_number,
                            ticket_type: req.body.ticket.ticket_type_name,
                            product: req.body.ticket.product,
                            ticketMessage: description,
                            reply: message,
                          })
                          .then((data1) => {});
                      });
                  });
                pushEmail
                  .getCustomerNameandEmail(req.body.ticket.uId)
                  .then((data) => {
                    pushEmail
                      .getEmailContentUsingCategory(ticketStatusForEmail)
                      .then((val) => {
                        pushEmail
                          .sendmail({
                            data: data,
                            val: val,
                            ticket_number: req.body.ticket.ticket_number,
                            ticket_type: req.body.ticket.ticket_type_name,
                            product: req.body.ticket.product,
                            ticketMessage: description,
                            reply: message,
                          })
                          .then((data1) => {});
                      });
                  });
                res.json({
                  response,
                });
              } else {
                res.status(401).send({
                  error: "Unauthorized",
                  message: "Ticket Creation error",
                });
              }
            })
            .catch((err) => {
              console.log(err);
              throw err;
            });
        } else {
          res
            .status(401)
            .send({ error: "Unauthorized", message: "Ticket Creation error" });
        }
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  }

  // console.log( knex.raw("Call pbx_saveTicketHistory(" + req.body.ticket.updateHistoryId + "," + req.body.ticket.ticket_id + "," + req.body.ticket.uId + ",\
  // '"+ message + "','" + req.body.ticket.reply_by + "','" + req.body.ticket.status + "','" + req.body.ticket.ticket_type + "', " + req.body.ticket.ticket_type_history + ", "+ req.body.ticket.assigned_to +")").toString());

  //     knex.raw("Call pbx_saveTicketHistory(" + req.body.ticket.updateHistoryId + "," + req.body.ticket.ticket_id + "," + req.body.ticket.uId + ",\
  //     '"+ message + "','" + req.body.ticket.reply_by + "','" + req.body.ticket.status + "','" + req.body.ticket.ticket_type + "', " + req.body.ticket.ticket_type_history + " , " + req.body.ticket.assigned_to + ")")
  //         .then((response) => {
  //             if (response) {
  //                 pushEmail.getCustomerNameandEmail(req.body.ticket.assigned_to).then((data) => {
  //                     pushEmail.getEmailContentUsingCategory(ticketStatusForEmail).then(val => {
  //                         pushEmail.sendmail({
  //                             data: data,
  //                             val: val,
  //                             ticket_number: req.body.ticket.ticket_number,
  //                             ticket_type: req.body.ticket.ticket_type_name,
  //                             product: req.body.ticket.product,
  //                             ticketMessage: description,
  //                             reply: message
  //                         }).then((data1) => { })
  //                     })
  //                 })
  //                 pushEmail.getCustomerNameandEmail(req.body.ticket.uId).then((data) => {
  //                     pushEmail.getEmailContentUsingCategory(ticketStatusForEmail).then(val => {
  //                         pushEmail.sendmail({
  //                             data: data,
  //                             val: val,
  //                             ticket_number: req.body.ticket.ticket_number,
  //                             ticket_type: req.body.ticket.ticket_type_name,
  //                             product: req.body.ticket.product,
  //                             ticketMessage: description,
  //                             reply: message
  //                         }).then((data1) => { })
  //                     })
  //                 })

  //                 res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
  //             }
  //         }).catch((err) => {
  //             res.send({ code: err.errno, message: err.sqlMessage });
  //         });
}

function getTicketHistory(req, res) {
  let ticketId = parseInt(req.body.ticketId);

  //  knex.raw('htmlDec(message) as message') ,/(<([^>]+)>)/ig, knex.raw('strip_tags(message) as message')
  let sql = knex
    .from(table.tbl_Ticket_history)
    .where("ticket_id", "=", "" + ticketId + "")
    .orderBy("ticket_sequence", "desc")
    .select(
      "id",
      "ticket_sequence",
      "message",
      "name",
      "created_at as ticketDate",
      "updated_at",
      "ticket_type",
      knex.raw(
        'IF(ticket_type = "0","New Feature",IF(ticket_type= "1" ,"Issue",IF(ticket_type = "2","Others",NULL))) as ticketTypeDisplay'
      ),
      knex.raw('DATE_FORMAT(created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      "reply_by"
    );

  sql
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

async function getTicketByFilters(req, res) {
  let data = req.body.filters;
  let rangeFrom = data.by_range ? data.by_range[0] : null;
  let rangeTo = data.by_range ? data.by_range[1] : null;
  rangeFrom = rangeFrom ? moment(rangeFrom).format("YYYY-MM-DD") : null;
  rangeTo = rangeTo ? moment(rangeTo).format("YYYY-MM-DD") : null;
  // data.by_company =  (data.by_company).length ? ("'" + data.by_company + "'") : null;
  if (req.body.ResellerID == 2) {
  let sql = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      "t.message",
      "t.ticket_number",
      "p.name as product",
      knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      // knex.raw(
      //   'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      // ),
      knex.raw(`
      IF(com.role_id = '3', CONCAT(com.first_name, ' ', com.last_name), CONCAT(c.first_name, ' ', c.last_name)) as assignedTo,
      IF(c.role_id NOT IN ('0','2'), IF(c.company_name != '', c.company_name, com.company_name), (SELECT name FROM company_info LIMIT 1)) as company_name
    `),
      "t.customer_id"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    if (req.body.role == 3) {
      sql.where("t.customer_id", req.body.ResellerID);
    }
    sql.orderBy("t.id", "desc");

  if (data.by_range != "") {
    sql = sql
      .andWhere(knex.raw("DATE(t.created_at)"), ">=", "" + rangeFrom + "")
      .andWhere(knex.raw("DATE(t.created_at)"), "<=", "" + rangeTo + "");
  }
  if (data.by_ticket != "") {
    sql = sql.andWhere("t.ticket_number", "like", "%" + data.by_ticket + "%");
  }
  if (data.by_status != "") {
    sql = sql.andWhere("t.status", "=", "" + data.by_status + "");
  }
  // if (data.by_company != '') {
  //     sql = sql.whereIn('com.id',data.by_company);
  // }
  if (data.by_company.length > 0) {
    sql = sql.whereIn("com.id", data.by_company);
    sql = sql.orWhereIn('t.assigned_to',data.by_company)
  }
  if (data.by_product != "") {
    // sql = sql.andWhere('t.product_id', 'like', "%" + data.by_product + "%");
    sql = sql.andWhere("t.product_id", data.by_product);
  }
  if (data.by_type != "") {
    if (data.by_type == "all") {
      sql = sql.whereIn("t.ticket_type", [0, 1, 2]);
    } else {
      sql = sql.andWhere("t.ticket_type", "like", "%" + data.by_type + "%");
    }
  }
  sql
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      }
      //  else {
      //     res.status(401).send({ error: 'Unauthorized', message: '' });
      // }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
  }
  else{
    let sql1 = await knex.select('id').from(table.tbl_Customer).where('created_by',req.body.ResellerID)
    let reseller_customer = []
    reseller_customer.push(req.body.ResellerID)
    sql1.map(item =>{
      reseller_customer.push(item.id)
    })
  
    let sql = knex
        .select(
          "t.id",
          knex.raw(
            'DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'
          ),
          knex.raw(
            'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
          ),
          knex.raw(
            'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
          ),
          "t.message",
          "t.ticket_number",
          "p.name as product",
          knex.raw(`
          IF(com.role_id = '3', CONCAT(com.first_name, ' ', com.last_name), CONCAT(c.first_name, ' ', c.last_name)) as assignedTo`),
          knex.raw(
            'IF(cust.role_id = "1", cust.company_name, ' +
            'IF(c.role_id IN ("1"), ' +
            'IF(c.company_name != "", c.company_name, com.company_name), ' +
            '(SELECT name FROM company_info LIMIT 1))) as company_name'
          ),
          // knex.raw("CONCAT(cust.first_name, ' ',cust.last_name) as assignedTo"),
          // 'c.company_name as company_name'
          // ,
          't.customer_id','t.ticket_number','t.assigned_to'
        )
        .from(table.tbl_Ticket + " as t")
        .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
        .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
        .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
        .leftOuterJoin(table.tbl_Customer + " as cust", "t.customer_id", "cust.id")
        if (req.body.role == 3) {
          if (data.by_range == '' && data.by_ticket == '' && data.by_status == '') {
            // sql.where("t.customer_id", req.body.ResellerID)
            // sql.where("t.assigned_to",req.body.ResellerID)
            sql.whereIn("t.assigned_to",reseller_customer)
            sql.orWhereIn("t.customer_id",reseller_customer)
          }
          else{
            sql.whereIn("t.customer_id",reseller_customer)
          }
        }
        sql.orderBy("t.id", "desc")
        
  if (data.by_range != "") {
    sql = sql
      .andWhere(knex.raw("DATE(t.created_at)"), ">=", "" + rangeFrom + "")
      .andWhere(knex.raw("DATE(t.created_at)"), "<=", "" + rangeTo + "");
  }
  if (data.by_ticket != "") {
    sql = sql.andWhere("t.ticket_number", "like", "%" + data.by_ticket + "%");
  }
  if (data.by_status != "") {
    sql = sql.andWhere("t.status", "=", "" + data.by_status + "");
  }
  // if (data.by_company != '') {
  //     sql = sql.whereIn('com.id',data.by_company);
  // }
  if (data.by_company.length > 0) {
    sql = sql.whereIn("com.id", data.by_company);
    sql = sql.orWhereIn('t.assigned_to',data.by_company)
  }
  if (data.by_product != "") {
    // sql = sql.andWhere('t.product_id', 'like', "%" + data.by_product + "%");
    sql = sql.andWhere("t.product_id", data.by_product);
  }
  if (data.by_type != "") {
    if (data.by_type == "all") {
      sql = sql.whereIn("t.ticket_type", [0, 1, 2]);
    } else {
      sql = sql.andWhere("t.ticket_type", "like", "%" + data.by_type + "%");
    }
  }
  sql
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      }
      //  else {
      //     res.status(401).send({ error: 'Unauthorized', message: '' });
      // }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
      }

  // knex.raw("Call pbx_getTicketByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_ticket + "," + data.by_status + ")").then((response) => {
  //     if (response) {
  //         res.send({ response: response[0][0] });
  //     }
  // }).catch((err) => {
  //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
  // });
}

function getCustomerTicketByFilters(req, res) {
  let data = req.body.filters;
  if (data.by_range == "" || data.by_range == null) {
    data.by_range = "";
  } else {
    var rangeFrom = data.by_range[0].split("T")[0];
    var rangeTo = data.by_range[1].split("T")[0];
  }

  let sql = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      knex.raw("strip_tags(t.message) as message"),
      "t.ticket_number",
      "p.name as product",
      knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      "t.customer_id",
      knex.raw(
        'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      ),
      "t.customer_id"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    .orderBy("t.id", "desc");

  if (data.by_range != "") {
    sql = sql
      .andWhere(knex.raw("DATE(t.created_at)"), ">=", "" + rangeFrom + "")
      .andWhere(knex.raw("DATE(t.created_at)"), "<=", "" + rangeTo + "");
  }
  if (data.by_ticket != "") {
    sql = sql.andWhere("t.ticket_number", "like", "%" + data.by_ticket + "%");
  }
  if (data.by_status != "") {
    sql = sql.andWhere("t.status", "=", "" + data.by_status + "");
  }

  sql
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "Ticket history not available" });
      throw err;
    });
}

function viewAccountManagerTicket(req, res) {
  let sql = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      "t.message",
      "t.ticket_number",
      "p.name as product",
      knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      knex.raw(
        'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      ),
      "t.customer_id"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    // .where('c.id', '=', "" + req.body.accountManagerId + "")
    .where((builder) =>
      builder
        .where("t.assigned_to", "=", "" + req.body.accountManagerId + "")
        .orWhere(
          "t.account_manager_id",
          "=",
          "" + req.body.accountManagerId + ""
        )
    )
    // .where('t.assigned_to', '=', "" + req.body.accountManagerId + "" )
    // .orWhere('t.account_manager_id', '=', "" + req.body.accountManagerId + "")
    .orderBy("t.id", "desc");
  if (req.body.limit_flag == 1) {
    sql.limit(10);
  }
  sql
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "Ticket history not available" });
      throw err;
    });

  // knex.raw("Call pbx_viewAccountManagerTicket(" + req.body.accountManagerId + ")").then((response) => {
  //     if (response) {
  //         res.send({ response: response[0][0] });
  //     }
  // }).catch((err) => {
  //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
  // });
}

function getAccountManagerTicketByFilters(req, res) {
  let data = req.body.credentials;
  if (data.by_range == "" || data.by_range == null) {
    data.by_range = "";
  } else {
    var rangeFrom = data.by_range ? data.by_range[0] : null;
    var rangeTo = data.by_range ? data.by_range[1] : null;
    rangeFrom = rangeFrom ? moment(rangeFrom).format("YYYY-MM-DD") : null;
    rangeTo = rangeTo ? moment(rangeTo).format("YYYY-MM-DD") : null;
  }

  let sql = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      "t.message",
      "t.ticket_number",
      "p.name as product",
      knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      "t.customer_id",
      knex.raw(
        'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      ),
      "t.customer_id"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    .where((builder) =>
      builder
        .where("t.assigned_to", "=", "" + req.body.accountManagerId + "")
        .orWhere(
          "t.account_manager_id",
          "=",
          "" + req.body.accountManagerId + ""
        )
    )
    .orderBy("t.id", "desc");

  if (data.by_range != "") {
    sql = sql
      .andWhere(knex.raw("DATE(t.created_at)"), ">=", "" + rangeFrom + "")
      .andWhere(knex.raw("DATE(t.created_at)"), "<=", "" + rangeTo + "");
  }
  if (data.by_ticket != "") {
    sql = sql.andWhere("t.ticket_number", "like", "%" + data.by_ticket + "%");
  }
  if (data.by_status != "") {
    sql = sql.andWhere("t.status", "=", "" + data.by_status + "");
  }
  // if (data.by_company != '') {
  //     // sql = sql.andWhere('com.company_name', 'like', "%" + data.by_company + "%");
  //     sql = sql.whereIn('com.id',data.by_company);
  // }
  if (data.by_company.length > 0) {
    sql = sql.whereIn("com.id", data.by_company);
  }
  if (data.by_product != "") {
    sql = sql.andWhere("t.product_id", "like", "%" + data.by_product + "%");
  }
  if (data.by_type != "") {
    if (data.by_type == "all") {
      sql = sql.whereIn("t.ticket_type", ["0", "1", "2"]);
    } else {
      sql = sql.andWhere("t.ticket_type", "like", "%" + data.by_type + "%");
    }
  }
  sql
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: err, message: "Ticket history not available" });
      throw err;
    });

  // knex.raw("Call pbx_getAccountManagerTicketByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_ticket + "," + data.by_status + ", " + data.by_company + ", " + req.body.accountManagerId + ")").then((response) => {
  //     if (response) {
  //         res.send({ response: response[0][0] });
  //     }
  // }).catch((err) => {
  //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
  // });
}

async function getCustomerWithProductTicketByFilters(req, res) {
  let data = req.body.filters;
  let sql1 = await knex.select('created_by').from(table.tbl_Customer).where('id',data.customerId)
  let rangeFrom = data.by_range ? data.by_range[0] : null;
  let rangeTo = data.by_range ? data.by_range[1] : null;
  rangeFrom = rangeFrom ? moment(rangeFrom).format("YYYY-MM-DD") : null;
  rangeTo = rangeTo ? moment(rangeTo).format("YYYY-MM-DD") : null;

  let sql = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      knex.raw("strip_tags(t.message) as message"),
      "t.ticket_number",
      "p.name as product",
      // knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      // "t.customer_id",
      // knex.raw(
      //   'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      // ),
      knex.raw(`
      IF(com.role_id = '3', CONCAT(com.first_name, ' ', com.last_name), CONCAT(c.first_name, ' ', c.last_name)) as assignedTo`),
    knex.raw(
      'IF(com.role_id = "1", com.company_name, ' +
      'IF(c.role_id IN ("1"), ' +
      'IF(c.company_name != "", c.company_name, com.company_name), ' +
      '(SELECT name FROM company_info LIMIT 1))) as company_name'
    ),
      "t.customer_id"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    .where(" t.product_id", "=", "" + data.productId + "")
    .andWhere(function() {
      this.where('t.assigned_to', '=', "" + data.customerId + "")
        .orWhere('t.customer_id', '=', "" + data.customerId + "");
    })
    // .andWhere(" t.customer_id", "=", "" + data.customerId + "")
    if (data.by_range == '' && data.by_ticket == '' && data.by_status == '') {
      if (sql1[0].created_by !=2 ) {
        sql.orWhere("t.assigned_to", "=", "" + data.customerId + "")
      }
    }
    sql.orderBy("t.id", "desc");
  if (data.by_range != "") {
    sql = sql
      .andWhere(knex.raw("DATE(t.created_at)"), ">=", rangeFrom)
      .andWhere(knex.raw("DATE(t.created_at)"), "<=", rangeTo);
  }
  if (data.by_ticket != "") {
    sql = sql.andWhere("t.ticket_number", "like", "%" + data.by_ticket + "%");
  }
  if (data.by_status != "") {
    sql = sql.andWhere("t.status", "=", "" + data.by_status + "");
  }
  sql
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "Ticket history not available" });
      throw err;
    });

  // knex.raw("Call pbx_getCustomerWithProductTicketByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_ticket + "," + data.by_status + ", " + data.customerId + ", " + data.productId + ")").then((response) => {
  //     if (response) {
  //         res.send({ response: response[0][0] });
  //     }
  // }).catch((err) => {
  //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
  // });
}

function getSupportTicketByFilters(req, res) {
  let data = req.body.credentials;
  let rangeFrom = data.by_range ? data.by_range[0] : null;
  let rangeTo = data.by_range ? data.by_range[1] : null;
  rangeFrom = rangeFrom ? moment(rangeFrom).format("YYYY-MM-DD") : null;
  rangeTo = rangeTo ? moment(rangeTo).format("YYYY-MM-DD") : null;

  let sql = knex
    .select(
      "t.id",
      knex.raw('DATE_FORMAT(t.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'IF (t.ticket_type = "0","New feature",if(t.ticket_type = "1", "Issue","Others")) as ticket_type'
      ),
      knex.raw(
        'IF (t.status = "0","Close",if(t.status = "1", "Open",if(t.status = "2","Inprogress",if(t.status = "3","New","View")))) as status'
      ),
      "t.message",
      "t.ticket_number",
      "p.name as product",
      // knex.raw("CONCAT(c.first_name, ' ',c.last_name) as assignedTo"),
      // "t.customer_id",
      // knex.raw(
      //   'IF(com.company_name = "" ,(select name as company_name from company_info),com.company_name) as company_name'
      // ),
      knex.raw(`
      IF(com.role_id = '3', CONCAT(com.first_name, ' ', com.last_name), CONCAT(c.first_name, ' ', c.last_name)) as assignedTo,
      IF(c.role_id NOT IN ('0','2'), IF(c.company_name != '', c.company_name, com.company_name), (SELECT name FROM company_info LIMIT 1)) as company_name
    `),
      "t.customer_id"
    )
    .from(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.assigned_to", "c.id")
    .leftOuterJoin(table.tbl_Customer + " as com", "t.customer_id", "com.id")
    .where("t.product_id", "=", "" + req.body.productId + "")
    .andWhere("t.role", "!=", "0")
    .orderBy("t.id", "desc");

  if (data.by_range != "") {
    sql = sql
      .andWhere(knex.raw("DATE(t.created_at)"), ">=", "" + rangeFrom + "")
      .andWhere(knex.raw("DATE(t.created_at)"), "<=", "" + rangeTo + "");
  }
  if (data.by_ticket != "") {
    sql = sql.andWhere("t.ticket_number", "like", "%" + data.by_ticket + "%");
  }
  if (data.by_status != "") {
    sql = sql.andWhere("t.status", "=", "" + data.by_status + "");
  }
  if (data.by_company.length > 0) {
    sql = sql.whereIn("com.id", data.by_company);
    sql = sql.orWhereIn("t.assigned_to", data.by_company);
  }
  if (data.by_product != "") {
    sql = sql.andWhere("p.id", "like", "%" + data.by_product + "%");
  }
  if (data.by_type != "") {
    if (data.by_type == "all") {
      sql = sql.whereIn("t.ticket_type", [0, 1, 2]); //all type
    } else {
      sql = sql.andWhere("t.ticket_type", "like", "%" + data.by_type + "%");
    }
  }
  if (data.by_assignee.length > 0) {
    sql = sql.whereIn("t.assigned_to", data.by_assignee);
  }
  sql
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "Ticket history not available" });
      throw err;
    });
}

function updateTicketNewStatus(req, res) {
  let sql = knex(table.tbl_Ticket + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
    .leftOuterJoin(table.tbl_Customer + " as c", "t.customer_id", "c.id")
    .select("c.role_id as role")
    .where("t.id", "=", "" + req.body.id + "");

  sql.then((response) => {
    let isCustomer = response[0]["role"] == "1" ? true : false;
    if (isCustomer) {
      if (req.body.role == "5") {
        // Support
        knex(table.tbl_Ticket)
          .where("id", "=", "" + req.body.id + "")
          .andWhere("role", "!=", "" + req.body.role + "")
          .andWhere("status", "=", "3")
          .update({
            status: "1",
          })
          .then((response) => {
            if (response) {
              knex(table.tbl_Ticket_history)
                .where("ticket_id", "=", "" + req.body.id + "")
                .max("ticket_sequence as sequence")
                .then((response) => {
                  if (response.length > 0) {
                    let sequence = Object.values(
                      JSON.parse(JSON.stringify(response))
                    );
                    sequence =
                      sequence[0].sequence != 0
                        ? sequence[0].sequence + 1
                        : parseInt(req.body.id) + 1;
                    knex(table.tbl_Ticket_history)
                      .insert({
                        ticket_id: "" + req.body.id + "",
                        ticket_sequence: "" + sequence + "",
                        message: "It's open by support",
                        ticket_type: "",
                        reply_by: "" + req.body.user_id + "",
                        name: "",
                      })
                      .then((response2) => {
                        res.json({
                          response2,
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                        throw err;
                      });
                  } else {
                    res.status(401).send({
                      error: "Unauthorized",
                      message: "Ticket Created",
                    });
                  }
                })
                .catch((err) => {
                  console.log(err);
                  throw err;
                });
            } else {
              res.json({
                response,
              });
            }
          });
      } else if (req.body.role == "0" || req.body.role == "4") {
        // Admin Or AcountManager
        knex(table.tbl_Ticket)
          .where("id", "=", "" + req.body.id + "")
          .andWhere("role", "!=", "" + req.body.role + "")
          .andWhere("status", "=", "3")
          .update({
            status: "4",
          })
          .then((response) => {
            if (response) {
              knex(table.tbl_Ticket_history)
                .where("ticket_id", "=", "" + req.body.id + "")
                .max("ticket_sequence as sequence")
                .then((response) => {
                  if (response.length > 0) {
                    let sequence = Object.values(
                      JSON.parse(JSON.stringify(response))
                    );
                    let user_type =
                      req.body.role == "0" ? "Admin" : "Acount Manager";
                    let message = "It's view by " + user_type;
                    sequence =
                      sequence[0].sequence != 0
                        ? sequence[0].sequence + 1
                        : parseInt(req.body.id) + 1;
                    knex(table.tbl_Ticket_history)
                      .insert({
                        ticket_id: "" + req.body.id + "",
                        ticket_sequence: "" + sequence + "",
                        message: message,
                        ticket_type: "",
                        reply_by: "" + req.body.user_id + "",
                        name: "",
                      })
                      .then((response2) => {
                        res.json({
                          response2,
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                        throw err;
                      });
                  } else {
                    res.status(401).send({
                      error: "Unauthorized",
                      message: "Ticket Created",
                    });
                  }
                })
                .catch((err) => {
                  console.log(err);
                  throw err;
                });
            } else {
              res.json({
                response,
              });
            }
          });
      } else {
        knex(table.tbl_Ticket)
          .where("id", "=", "" + req.body.id + "")
          .andWhere("role", "!=", "" + req.body.role + "")
          .andWhere("status", "=", "3")
          .update({
            status: "1",
          })
          .then((response) => {
            res.json({
              response,
            });
          });
      }
    } else {
      // Admin Or AcountManager Or Support
      knex(table.tbl_Ticket)
        .where("id", "=", "" + req.body.id + "")
        .andWhere("role", "!=", "" + req.body.role + "")
        .update({
          status: "1",
        })
        .then((response) => {
          res.json({
            response,
          });
        });
    }
  });

  // knex(table.tbl_Ticket).where('id', '=', "" + req.body.id + "")
  //     .andWhere('role', '!=', "" + req.body.role + "")
  //     .update({
  //         status: '1'
  //     }).then((response) => {
  //         res.json({
  //             response
  //         });
  //     });
}
function addticket(req, res) {
  let body = req.body;
  let id = parseInt(req.query.id);
  let modified_by = req.userId;
  if (req.body.role != 3) {
    req.body.user_id = 0;
  }
  let arr = {
    name: body.name,
    product_id: body.product_id,
    description: body.description,
  };
  if (req.body.role == 3) {
    let query = knex
      .select("t.name")
      .from(table.tbl_pbx_ticket_type + " as t")
      .where("t.product_id", "=", body.product_id)
      .where("t.name", "=", body.name);
    query.then((response) => {
      if (response.length == 0) {
        let sql = knex(table.tbl_pbx_ticket_type).insert({
          name: "" + body.name + "",
          product_id: "" + body.product_id,
          description: "" + body.description + "",
          created_by: "" + req.body.user_id + "",
        });
        sql
          .then((response) => {
            if (response.length > 0) {
              createModuleLog(table.tbl_pbx_ticket_type_detail_history, {
                ticket_id: id, // it will be implemented later
                action: "New Ticket Type Detail Created",
                modified_by,
                data: "" + JSON.stringify(arr) + "",
              });
              res.json({
                response: response,
                code: 200,
                message: `Ticket Type created successfully!`,
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
        res.json({
          response: response,
          code: 201,
          message: `Ticket Name already exist!`,
        });
      }
    });
  } else {
    let query = knex
      .select("t.name")
      .from(table.tbl_pbx_ticket_type + " as t")
      .where("t.product_id", "=", body.product_id)
      .where("t.name", "=", body.name);
    query.then((response) => {
      if (response.length == 0) {
        let sql = knex(table.tbl_pbx_ticket_type).insert({
          name: "" + body.name + "",
          product_id: "" + body.product_id,
          description: "" + body.description + "",
          created_by: "" + req.body.user_id + "",
        });
        sql
          .then((response) => {
            if (response.length > 0) {
              createModuleLog(table.tbl_pbx_ticket_type_detail_history, {
                ticket_id: id, // it will be implemented later
                action: "New Ticket Type Detail Created",
                modified_by,
                data: "" + JSON.stringify(arr) + "",
              });
              res.json({
                response: response,
                code: 200,
                message: `Ticket Type created successfully!`,
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
        res.json({
          response: response,
          code: 201,
          message: `Ticket Name already exist!`,
        });
      }
    });
  }
}

function updateTicket(req, res) {
  let body = req.body.ticketData;
  let ticket_id = req.body.ticketData?.id;
  let modified_by = req.userId;
  let query = knex
    .select("t.name")
    .from(table.tbl_pbx_ticket_type + " as t")
    .where("t.product_id", "=", body.product_id)
    .where("t.name", "=", body.name)
    .whereNot("t.id", body.id);
  query.then((response) => {
    if (response.length == 0) {
      let sql = knex(table.tbl_pbx_ticket_type).where(
        "id",
        "=",
        "" + body.id + ""
      );
      delete body.id;
      sql.update(body);
      sql
        .then((response) => {
          createModuleLog(table.tbl_pbx_ticket_type_detail_history, {
            ticket_id: ticket_id,
            action: "Ticket Type Detail Updated",
            modified_by,
            data: "" + JSON.stringify(body) + "",
          });
          res.json({
            response: response,
            code: 200,
            message: `Ticket Type updated successfully!`,
          });
        })
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    } else {
      res.json({
        response: response,
        code: 201,
        message: `You can't create same ticket type!`,
      });
    }
  });
}

// function getticketList(req, res) {
// 	var body = req.body;
// 	let isFilter = Object.keys(req.query.filterObj!={}).length == 0 ? false : true;
// if (req.query.role == 3) {
// 	let sql = knex
// 	.select(
// 		"t.id as id",
// 		"t.name as name",
// 		"t.description as description",
// 		"p.id as product_id",
// 		"p.name as product_name"
// 	)
// 	.from(table.tbl_pbx_ticket_type + " as t")
// 	.leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
// 	.where('created_by',req.query.ResellerID)
// 	.orderBy("t.id", "desc");

// // let sql = knex.from(table.tbl_pbx_ticket_type)
// //     .select('id', 'name', 'description');
// if (isFilter) {
// 	sql.where("t.name", "like", "%" + body.name + "%");
// }
// sql
// 	.then((response) => {
// 		if (response) {
// 			res.json({
// 				response,
// 			});
// 		} else {
// 			res
// 				.status(401)
// 				.send({ error: "error", message: "DB Error: " + err.message });
// 		}
// 	})
// 	.catch((err) => {
// 		console.log(err);
// 		res
// 			.status(401)
// 			.send({ error: "error", message: "DB Error: " + err.message });
// 		throw err;
// 	});
// }
// else{
// 	let sql = knex
// 		.select(
// 			"t.id as id",
// 			"t.name as name",
// 			"t.description as description",
// 			"p.id as product_id",
// 			"p.name as product_name"
// 		)
// 		.from(table.tbl_pbx_ticket_type + " as t")
// 		.leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id")
// 		.orderBy("t.id", "desc");

// 	// let sql = knex.from(table.tbl_pbx_ticket_type)
// 	//     .select('id', 'name', 'description');
// 	if (isFilter) {
// 		sql.where("t.name", "like", "%" + body.name + "%");
// 	}
// 	sql
// 		.then((response) => {
// 			if (response) {
// 				res.json({
// 					response,
// 				});
// 			} else {
// 				res
// 					.status(401)
// 					.send({ error: "error", message: "DB Error: " + err.message });
// 			}
// 		})
// 		.catch((err) => {
// 			console.log(err);
// 			res
// 				.status(401)
// 				.send({ error: "error", message: "DB Error: " + err.message });
// 			throw err;
// 		});
// 	}
// }
function getticketList(req, res) {
  let sql = knex
    .select(
      "t.id as id",
      "t.name as name",
      "t.description as description",
      "p.id as product_id",
      "p.name as product_name"
    )
    .from(table.tbl_pbx_ticket_type + " as t")
    .leftOuterJoin(table.tbl_Product + " as p", "t.product_id", "p.id");
  if (req.body.role == 3) {
    sql.where("created_by", req.body.ResellerID);
  }

  if (req.body.filterObj != undefined) {
    sql.andWhere("t.name", "like", "%" + req.body.filterObj + "%");
  }
  sql.orderBy("t.id", "desc");
  sql
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      } else {
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
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

module.exports = {
  createTicket,
  viewTicket,
  viewTicketFORPBX,
  viewResellerTicketPBX,
  viewTicketFOROC,
  viewTicketId,
  viewTicketCustomerWise,
  ticketHistory,
  getTicketHistory,
  viewTicketProductandCustomerwise,
  getTicketByFilters,
  getCustomerTicketByFilters,
  viewAccountManagerTicket,
  getAccountManagerTicketByFilters,
  getCustomerWithProductTicketByFilters,
  getSupportTicketByFilters,
  updateTicketNewStatus,
  getticketList,
  addticket,
  updateTicket,
  viewTicketFORPBXForSupport,
};
