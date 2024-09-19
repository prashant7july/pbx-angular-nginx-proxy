const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');
const { createModuleLog } = require('../helper/modulelogger');

function getAdminUrls(req, res) {
    knex.raw("Call pbx_getAdminUrls()")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function getExtraPermission(req, res) {
    knex.raw("Call pbx_getExtraPermission()")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function createPermission(req, res) {
    
    let modified_by = req.userId;
    let permissionName = req.body.permission.permission_name;
    let permissionId = req.body.permission.permissionObj;
    let toInsertObj = {};
    let arr = [];
    let userType = req.body.permission.user_type == '1' ? '1' : '0';
    let pbx = req.body.permission.pbx == true ? '1' : '0';
    let oc = req.body.permission.oc == true ? '1' : '0';
 
    knex(table.tbl_pbx_permission).insert({ permission_name: "" + permissionName + "", userType: "" +  userType + "", pbx: "" +  pbx + "", oc: "" +  oc + ""}).then((resp) => {
        let lastInsertedId = resp;
        for (var i = 0; i < permissionId.length; i++) {
            if (permissionId[i]['permission']['all'] == true) {
                
                toInsertObj = {
                    menu_id: permissionId[i]['id'], permission_id: lastInsertedId, all_permission: permissionId[i]['permission']['all'],add_permission: '1',modify_permission: '1',delete_permission: '1', view_permission: permissionId[i]['permission']['view']

                    // menu_id: permissionId[i]['id'], permission_id: lastInsertedId, add_permission: permissionId[i]['permission']['add'], modify_permission: permissionId[i]['permission']['modify'], view_permission: permissionId[i]['permission']['view'],
                    // delete_permission: permissionId[i]['permission']['delete']
                };
                arr.push(toInsertObj);
            }else if (permissionId[i]['permission']['view'] == true){
                
                toInsertObj = {
                    // menu_id: permissionId[i]['id'], permission_id: lastInsertedId, add_permission: permissionId[i]['permission']['add'], modify_permission: permissionId[i]['permission']['modify'], view_permission: permissionId[i]['permission']['view'],
                    // delete_permission: permissionId[i]['permission']['delete']
                    menu_id: permissionId[i]['id'], permission_id: lastInsertedId, all_permission: permissionId[i]['permission']['all'], view_permission: permissionId[i]['permission']['view']
                };
                arr.push(toInsertObj);

            }
        }

        knex(table.tbl_pbx_menu_permission).insert(arr).then((response) => {
            createModuleLog(table.tbl_pbx_permission_history, {
                permission_id: lastInsertedId,
                action: "New Permission Created", modified_by, data: "" + JSON.stringify(arr) + ""
            })
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    });
}

// function updatePermission(req, res) {
//     let modified_by = req.userId;
//     let permissionId = req.body.permission.permissionId;
//     let permissionName = req.body.permission.permission_name;
//     let menusId = req.body.permission.permissionObj;
//     console.log(menusId,"====meun ids====");
//     console.log(permissionId,"====id====");
//     let count = 0;
//     let arr = [];
//     var sql = knex.select('c.id','c.company_name', 'c.first_name', 'c.last_name', 'comp.name as company')
//         .from(table.tbl_pbx_user_permission_map + ' as map')
//         .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.user_id')
//         .leftJoin(table.tbl_Company_info + ' as comp', 'comp.id', 'comp.id')
//         .where('c.status', '=', "1").andWhere('map.permission_id', '=', "" + permissionId + "");
//         sql.then((response) => {
//             console.log(response,"----response in update query----");
//         const assign = response.map((item)=>item.id).join(',');
//         for (var i = 0; i < menusId.length; i++) {
//             arr.push({
//                 all_permission: menusId[i]['permission']['all'], 
//                 // add_permission: menusId[i]['permission']['add'], 
//                 // modify_permission: menusId[i]['permission']['modify'], 
//                 view_permission: menusId[i]['permission']['view'],
//                 // delete_permission: menusId[i]['permission']['delete'],
//                 menu_id:menusId[i]['id']
//             })
//             let sql =  knex(table.tbl_pbx_menu_permission).update({
//                 // add_permission: menusId[i]['permission']['add'], modify_permission: menusId[i]['permission']['modify'], view_permission: menusId[i]['permission']['view'],
//                 // delete_permission: menusId[i]['permission']['delete']
//                 all_permission: menusId[i]['permission']['all'], view_permission: menusId[i]['permission']['view']

//             }).where('permission_id', permissionId).andWhere('menu_id', menusId[i]['id']);
//             console.log(sql.toQuery());
//             sql.then((response) => {

//                 count = 1 + count;  
//                 }).catch((err) => { console.log(err); res.status(400).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
//                 if((i + 1) == (menusId.length)){
//                     createModuleLog(table.tbl_pbx_permission_history,{
//                         permission_id: permissionId,
//                         action: "Existing Permission Updated", modified_by, data : "" + JSON.stringify(arr) + ""
//                     })
//                     res.json({
//                         response: true
//                     });

//                 }
//         }
//     })

// }

function updatePermission(req, res) {
    let modified_by = req.userId;
    let permissionId = req.body.permission.permissionId;
    let permissionName = req.body.permission.permission_name;
    let menusId = req.body.permission.permissionObj;
    let count = 0;
    let arr = [];

    knex.from(table.tbl_pbx_permission).where('id', permissionId).update('permission_name', permissionName)
        .then((response2) => {
            knex.from(table.tbl_pbx_menu_permission).where('permission_id', permissionId).del()
                .then((responses) => {
                    for (var i = 0; i < menusId.length; i++) {
                        if (menusId[i]['permission']['all'] == true) {
                            
                            toInsertObj = {
                                menu_id: menusId[i]['id'], permission_id: permissionId, all_permission: menusId[i]['permission']['all'],add_permission: '1',modify_permission: '1',delete_permission: '1', view_permission: menusId[i]['permission']['view']
            
                                // menu_id: permissionId[i]['id'], permission_id: lastInsertedId, add_permission: permissionId[i]['permission']['add'], modify_permission: permissionId[i]['permission']['modify'], view_permission: permissionId[i]['permission']['view'],
                                // delete_permission: permissionId[i]['permission']['delete']
                            };
                            arr.push(toInsertObj);
                        }else if (menusId[i]['permission']['view'] == true){
                            
                            toInsertObj = {
                                // menu_id: permissionId[i]['id'], permission_id: lastInsertedId, add_permission: permissionId[i]['permission']['add'], modify_permission: permissionId[i]['permission']['modify'], view_permission: permissionId[i]['permission']['view'],
                                // delete_permission: permissionId[i]['permission']['delete']
                                menu_id: menusId[i]['id'], permission_id: permissionId, all_permission: menusId[i]['permission']['all'], view_permission: menusId[i]['permission']['view']
                            };
                            arr.push(toInsertObj);
            
                        }
                    }
                        
                            let sql = knex(table.tbl_pbx_menu_permission).insert(arr)
                            sql.then((response) => {
                                count = 1 + count;
                                
                              
                                    createModuleLog(table.tbl_pbx_permission_history, {
                                        permission_id: permissionId,
                                        action: "Existing Permission Updated", modified_by, data: "" + JSON.stringify(arr) + ""
                                    })
                                    res.json({
                                        response: true
                                    });
                                
                            }).catch((err) => { console.log(err); res.status(400).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                }).catch((err) => { console.log(err); res.status(400).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

        }).catch((err) => { console.log(err); res.status(400).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    // })

}

function getPermissionList(req, res) {
    knex.raw("Call pbx_get_permissionList(" + req.body.id + ")")
        .then(async (response) => {
            if (response) {
                let Map = [];
                Map = response[0][0] ? response[0][0] : null
                await Map.map((data) => {
                    let sql1 = knex.select('c.id', 'c.company_name', 'c.first_name', 'c.last_name', 'comp.name as company')
                        .from(table.tbl_pbx_user_permission_map + ' as map')
                        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.user_id')
                        .leftJoin(table.tbl_Company_info + ' as comp', 'comp.id', 'comp.id')
                        .where('c.status', '=', "1").andWhere('map.permission_id', '=', "" + data.id + "")
                    sql1.then(async responses => {
                        if (responses.length) {
                            await Object.assign(data, { flag: 1 })
                        }
                    })
                })
                setTimeout(() => {
                    res.json({ response: Map })
                }, 500)
            } else {
                res.send({ response: [] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}
function getResellerPermission(req,res) {
    let sql = knex.select('*').from(table.tbl_pbx_permission)
    .where('userType','1')
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getPermissionById(req, res) {
    knex.raw("Call pbx_get_permissionById(" + req.body.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getPermissionUsers(req, res) {
    let id = req.body.id;
    var sql = knex.select('c.id', 'c.company_name', 'c.first_name', 'c.last_name', 'comp.name as company')
        .from(table.tbl_pbx_user_permission_map + ' as map')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.user_id')
        .leftJoin(table.tbl_Company_info + ' as comp', 'comp.id', 'comp.id')
        .where('c.status', '=', "1").andWhere('map.permission_id', '=', "" + id + "");
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function createExtraPermission(req, res) {
    let menu_id = req.body.permission.menu_id.id;
    let permission = req.body.permission.permission;
    let s = knex(table.tbl_extra_permission).insert({ permission_name: "" + permission + "", menu_id: menu_id });
    s.then((resp) => {
        // res.json({
        //     response,""
        // });
        let sql = knex(table.tbl_menu).update({
            is_extra_permission: 1
        })
            .where('id', menu_id);
        sql.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function deletePermission(req, res) {
    let modified_by = req.userId;
    let permissionId = req.body.id;
    let sql = knex(table.tbl_pbx_permission).del().where('id', permissionId);
    sql.then((response) => {
        knex.select('*').from(table.tbl_pbx_menu_permission).where('permission_id', permissionId).
            then((result) => {
                createModuleLog(table.tbl_pbx_permission_history, {
                    permission_id: permissionId,
                    action: "Permission deleted", modified_by, data: "" + JSON.stringify(result) + ""
                })
            }).catch((err) => { console.log(err); });
        knex(table.tbl_pbx_menu_permission).del().where('permission_id', permissionId).then((response) => {

            res.json({
                response
            });
        })
    }).catch((err) => {
        console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
    });
}

function getPermissionByUserId(req, res) {
    let id = req.body.data;
    knex.raw("Call pbx_get_permissionByUserId(" + id.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}



function verifyName(req, res) {
    let keyword = req.body.permission_name.trim();
    let sql = knex.from(table.tbl_pbx_permission)
        .select('id')
        .where('permission_name', "" + keyword + "");
    sql.then((response) => {
        if (response.length > 0) {
            const perm = response[0];
            res.json({
                id: perm.id
            });
        } else {
            res.json({
                id: ''
            });
        }
    }).catch((err) => { console.log(err); res.status(411).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getPermissionListByFilter(req, res) {
    let keyword = req.body.by_name.trim();
    let user = req.body.by_user;
    let sql = knex.from(table.tbl_pbx_permission + ' as p')
        // .join(table.tbl_pbx_user_permission_map + ' as map', 'map.permission_id', 'p.id')
        .select('*')
        // .groupBy('map.permission_id')
    if (keyword != "") {
        sql.andWhere('p.permission_name', 'like', "%" + keyword + "%");
    }
    if(user != ""){
        sql.andWhere('p.userType',user);
    }
    // if (req.body.by_company != "") {
    //     sql.andWhere('map.user_id', "" + req.body.by_company + "");
    // }
    
    sql.then(async (response) => {
        if (response) {
            let Map = [];
            Map = response ? response : null
            await Map.map((data) => {
                let sql1 = knex.select('c.id', 'c.company_name', 'c.first_name', 'c.last_name', 'comp.name as company')
                    .from(table.tbl_pbx_user_permission_map + ' as map')
                    .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.user_id')
                    .leftJoin(table.tbl_Company_info + ' as comp', 'comp.id', 'comp.id')
                    .where('c.status', '=', "1").andWhere('map.permission_id', '=', "" + data.id + "");
                sql1.then(async responses => {
                    if (responses.length) {
                        await Object.assign(data, { flag: 1 })
                    }
                })
            })
            setTimeout(() => {
                res.json({ response: Map })
            }, 500)
        } else {
            res.send({ response: [] });
        }
    }).catch((err) => { console.log(err); res.status(411).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getSubAdminPer(req,res){
    knex.select("*").from(table.tbl_pbx_permission).where('userType','0')
    .then((response)=>{
        res.send({
            response: response
        })
    })
}
module.exports = {
    createExtraPermission, getAdminUrls, createPermission, getPermissionList,getResellerPermission, getPermissionById, updatePermission, getPermissionUsers, getExtraPermission, deletePermission, verifyName, getPermissionListByFilter, getPermissionByUserId,getSubAdminPer
}