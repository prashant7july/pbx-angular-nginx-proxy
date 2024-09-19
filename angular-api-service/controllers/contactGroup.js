const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const { createModuleLog } = require('../helper/modulelogger');

function createContactGroup(req, res) {
    let customer_id = req.body.contactGroup.customer_id ? req.body.contactGroup.customer_id : 0;
    let description = '';
    if (!req.body.contactGroup.description || req.body.contactGroup.description == '') {
        description = '';
    } else {
        description = req.body.contactGroup.description;
    }
    let name = '';
    if (!req.body.contactGroup.name || req.body.contactGroup.name == '') {
        name = '';
    } else {
        name = req.body.contactGroup.name;
    }
    let sql = knex(table.tbl_pbx_contact_group).insert({ name: "" + name + "", description: "" + description + "", customer_id: customer_id });
    sql.then((response) => {
        let input = {
            Name: name            
        }
        if(description != ""){
            input["Description"] = description;
        }
        createModuleLog(table.tbl_pbx_audit_logs,{
            module_action_id: response,
            module_action_name: name,
            module_name: "contact group",
            message: "Contact Group Created",
            customer_id: customer_id,
            features: "" + JSON.stringify(input) + ""
        })
        if (response) {
            res.send({
                response: response,
                message: 'Contact group create successfully',
                code: 200
            });
        }
    }).catch((err) => {
        console.log(err);
        res.status(200).send({
            code: err.errno,
            error: 'error', message: 'DB Error: ' + err.message
        }); throw err
    });

}


function viewContactGroup(req, res) {
    let customerId = parseInt(req.query.id);
    let sql = knex.select('cg.id','cg.customer_id','cg.name','cg.description','cg.created_at','cg.updated_at',
    knex.raw('GROUP_CONCAT(cgm.contact_id) as contact_id')).from(table.tbl_pbx_contact_group + ' as cg')
        .where('customer_id', customerId)
        .leftJoin(table.tbl_pbx_contact_group_mapping + ' as cgm', 'cgm.contact_group_id', 'cg.id')
        .groupBy('cg.id')
        .orderBy('cg.id', 'desc');
        sql.then(async(response) => {
            if (response) {
                let Map = [];
                Map = response ? response : null
                await Map.map((data) => {  
                    let sql1=knex.select('cgm.contact_id','contact.name','contact.email','contact.phone_number1','contact.phone_number2').from(table.tbl_pbx_contact_group_mapping + ' as cgm')
                    .leftJoin(table.tbl_Contact_list + ' as contact', 'contact.id','cgm.contact_id')
                    .where('contact_group_id', data.id)
                    sql1.then(async responses => {
                        if(responses.length){
                            await Object.assign(data,{flag: 1})
                        }                                        
                    })
                })
                setTimeout(() => {   
                    res.send({ response: Map });
                }, 500); 
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
            // res.json({
            //     response
            // });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function viewSingleContactGroup(req, res) {
    let groupID = parseInt(req.query.id);
    knex.select('*').from(table.tbl_pbx_contact_group)
        .where('id', groupID)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function updateContactGroup(req, res) {  
    let groupId = req.body.contactGroup.id ? req.body.contactGroup.id : 0;
    let description = '';
    if (!req.body.contactGroup.description || req.body.contactGroup.description == '') {
        description = '';
    } else {
        description = req.body.contactGroup.description;
    }
    let name = '';
    if (!req.body.contactGroup.name || req.body.contactGroup.name == '') {
        name = '';
    } else {
        name = req.body.contactGroup.name;
    }
    let sql = knex(table.tbl_pbx_contact_group)
    .where('id', '=', "" + groupId + "")
    .update({ name: "" + name + "", description: "" + description + ""});
    sql.then((response) => {
        input = {
            Name: name
        }
        if(description != ""){
            input['Description'] = description;
        }
        createModuleLog(table.tbl_pbx_audit_logs,{
            module_action_id: groupId,
            module_action_name: name,
            module_name: "contact group",
            message: "Contact Group Updated without Contact",
            customer_id: req.body.contactGroup.customer_id,
            features: "" + JSON.stringify(input) + ""
        })
        if (response) {
            res.send({
                response: response,
                message: 'Contact group update successfully',
                code: 200
            });
        }
    }).catch((err) => {
        console.log(err);
        res.status(200).send({
            code: err.errno,
            error: 'error', message: 'DB Error: ' + err.message
        }); throw err
    });

}

function createContactInGroup(req, res) {
    let contactList = req.body.contactGroup.contacts;
    let groupId = req.body.contactGroup.group_id
    const contactsToInsert = contactList.map(contact => 
        ({ contact_id: contact, contact_group_id: groupId }));
    let sql = knex(table.tbl_pbx_contact_group_mapping).insert(contactsToInsert);
    sql.then((response) => {
        input = {
            Contacts: req.body.contactGroup.contact_name
        }
        createModuleLog(table.tbl_pbx_audit_logs, {
            module_action_id: req.body.contactGroup.group_id,
            module_action_name: req.body.contactGroup.group_name,
            module_name: "contact add",
            message: "Contact added in Group Sucessfully.",
            customer_id: req.body.contactGroup.customer_id,
            features: "" + JSON.stringify(input) + ""
        })
        if (response) {
            res.send({
                response: response,
                message: 'Add Contact successfully',
                code: 200
            });
        }
    }).catch((err) => {
        console.log(err);
        res.status(200).send({
            code: err.errno,
            error: 'error', message: 'DB Error: ' + err.message
        }); throw err
    });
}

function getContactFromGroup(req, res) {
    let groupId = parseInt(req.query.id);
    knex.select('*').from(table.tbl_pbx_contact_group_mapping)
        .where('contact_group_id', groupId)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getAllContactFromGroup(req, res) {
    let groupId = parseInt(req.query.id);
    let sql=knex.select('cgm.contact_id','contact.name','contact.email','contact.phone_number1','contact.phone_number2').from(table.tbl_pbx_contact_group_mapping + ' as cgm')
        .leftJoin(table.tbl_Contact_list + ' as contact', 'contact.id','cgm.contact_id')
        .where('contact_group_id', groupId)
        .orderBy('cgm.id', 'desc');
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getMappingContact(req, res) {
    let groupId = parseInt(req.query.id);
    knex.select('*').from(table.tbl_pbx_contact_group_mapping)
        .where('contact_group_id', groupId)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getContactGroupByFilters(req, res) { 
    let customerId = parseInt(req.query.id);
    let data = req.body.filters;
    let sql = knex.select('cg.id','cg.customer_id','cg.name','cg.description','cg.created_at','cg.updated_at',
    knex.raw('GROUP_CONCAT(cgm.contact_id) as contact_id')).from(table.tbl_pbx_contact_group + ' as cg')
        .where('customer_id', customerId)
        .leftJoin(table.tbl_pbx_contact_group_mapping + ' as cgm', 'cgm.contact_group_id', 'cg.id')
        .groupBy('cg.id')
        .orderBy('cg.id', 'desc');
        if (data.by_name != '') {
            sql = sql.andWhere('cg.name', 'like', "%" + data.by_name + "%");
        }
        sql.then(async(response) => {
            if (response) {
                let Map = [];
                Map = response ? response : null
                await Map.map((data) => {  
                    let sql1=knex.select('cgm.contact_id','contact.name','contact.email','contact.phone_number1','contact.phone_number2').from(table.tbl_pbx_contact_group_mapping + ' as cgm')
                    .leftJoin(table.tbl_Contact_list + ' as contact', 'contact.id','cgm.contact_id')
                    .where('contact_group_id', data.id)
                    sql1.then(async responses => {
                        if(responses.length){
                            await Object.assign(data,{flag: 1})
                        }                                        
                    })
                })
                setTimeout(() => {   
                    res.send({ response: Map });
                }, 500); 
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
            // res.json({
            //     response
            // });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
   
    // sql.then((response) => {
    //     if (response) {
    //         res.json({
    //             response
    //         });
    //     } else {
    //         res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
    //     }
    // }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function updateContactGroupWithContacts(req, res) {    
    var groupId = req.body.contactGroup.id ? req.body.contactGroup.id : 0;
    let description = '';
    if (!req.body.contactGroup.description || req.body.contactGroup.description == '') {
        description = '';
    } else {
        description = req.body.contactGroup.description;
    }
    let name = '';
    if (!req.body.contactGroup.name || req.body.contactGroup.name == '') {
        name = '';
    } else {
        name = req.body.contactGroup.name;
    }
    let sql = knex(table.tbl_pbx_contact_group)
        .where('id', '=', "" + groupId + "")
        .update({ name: "" + name + "", description: "" + description + "" });
    sql.then((response) => {
        if (response) {
            let groupId = req.body.contactGroup.id ? req.body.contactGroup.id : 0;
            let sql2 = knex(table.tbl_pbx_contact_group_mapping).where('contact_group_id', '=', "" + groupId + "")
            sql2.del();
            sql2.then((response) => {
                if (response) {
                    let contactList = req.body.contactGroup.contacts;
                    let groupId = req.body.contactGroup.id
                    const contactsToInsert = contactList.map(contact => 
                        ({ contact_id: contact, contact_group_id: groupId }));    
                    let sql3 = knex(table.tbl_pbx_contact_group_mapping).insert(contactsToInsert);
                    sql3.then((response) => {
                        input = {
                            Name: req.body.contactGroup.name                            
                        }
                        if(description != ""){
                            input['Description'] = req.body.contactGroup.description;
                        }
                        input['Contacts'] = req.body.contactGroup.contact_name;
                        createModuleLog(table.tbl_pbx_audit_logs,{
                            module_action_id: req.body.contactGroup.id,
                            module_action_name: req.body.contactGroup.name,
                            module_name: "contact group",
                            message: "Contact Group Updated",
                            customer_id: req.body.contactGroup.customer_id,
                            features: "" + JSON.stringify(input) + ""
                        })
                        if (response) {
                            res.send({
                                response: response,
                                message: 'Update Contact Group successfully',
                                code: 200
                            });
                        }
                    }).catch((err) => {
                        console.log(err);
                        res.status(200).send({
                            code: err.errno,
                            error: 'error', message: 'DB Error: ' + err.message
                        }); throw err
                    });
                } else {
                    res.status(200).send({ error: 'error', message: 'DB Error' });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }
    }).catch((err) => {
        console.log(err);
        res.status(200).send({
            code: err.errno,
            error: 'error', message: 'DB Error: ' + err.message
        }); throw err
    });

}

function getGroupNameExist(req, res) {
    let groupName = req.query.gn;
    let customerId = req.query.id;
    let groupId = req.query.gid;
    knex.select('*').from(table.tbl_pbx_contact_group)
        .where('name', groupName)
        .andWhere('customer_id', customerId)
        .whereNot('id', groupId)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteContact(req, res) {
    knex.raw("Call pbx_delete_contactlist(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });

}


function checkContactAssociateOrNot(req, res) {
    let customerId = req.query.id;
    knex.select('*').from(table.tbl_pbx_contact_group_mapping)
        .where('contact_id', customerId)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

module.exports = {
    createContactGroup, viewContactGroup, viewSingleContactGroup, updateContactGroup,
    createContactInGroup, getContactFromGroup, getAllContactFromGroup, getContactGroupByFilters,
    updateContactGroupWithContacts, getGroupNameExist, checkContactAssociateOrNot 
};
