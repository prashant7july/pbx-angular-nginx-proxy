const config = require('../config/app');
const jwt = require('jsonwebtoken');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const pushEmail = require('./pushEmail');
const encrypt = require('../config/custom_encryption.utils');
const { decrypt } = require('./crypt');
var debug = require('debug');

const passwordDecryption = async (userPassword, username, role) => {
    const isNumber = !isNaN(Number(username));
    const tableName = isNumber ? table.tbl_Extension_master : table.tbl_Customer;
    const usernameField = isNumber ? 'ext_number' : 'username';   
    let encryptPass = await knex.select('password').table(tableName).where(usernameField,username);  
    let plainPassword = encrypt.decryptAes(encryptPass[0]['password']);
    return plainPassword === userPassword ? encryptPass[0]['password'] : false;
}
async function login(req, res) {   
debug("request code here")
    let validatePassword = await passwordDecryption(req.body.user.password, req.body.user.username, req.body.user.role);
    let password = '';
    if (req.body.user.loginType === 'byAdmin') {
        password = req.body.user.password;
    } else {
        const private_cipher = encrypt.cipher(config.appSecret);
        password = validatePassword == false ? private_cipher(req.body.user.password) : validatePassword;
    }
    // req.body.user.flag ? '1' : '0'
    if (req.body.user.flag == 1) {
        req.body.user.flag = 1
    }
    else {
        req.body.user.flag = 0
    }
    if (req.body.user.ip) { req.body.user.ip = req.body.user.ip }
    else { req.body.user.ip = req.socket.remoteAddress }

    req.body.user.permission_type = req.body.user.permission_type ? "'" + req.body.user.permission_type + "'" : null;



    let sql = knex.raw('Call login_credential("' + req.body.user.username + '","' + password + '",\'' + req.body.user.password + '\' ,"' + 1 + '","' + req.body.user.ip + '","' + req.body.user.flag + '")');
    // knex.raw('Call login_credential("' + req.body.user.username + '","' + password + '",\'' + req.body.user.password + '\' ,"' + 1 + '","' + req.body.user.ip + '")')
    sql.then((response) => {
        const user = response[0][0][0];
        // knex.raw("Call pbx_save_activityLog(" + user.id + "," + user.role + ", '0','"+req.body.user.ip+"', '"+req.body.user.username+"', '"+req.headers['user-agent']+"')")
        //     .then((response) => {
        //     });


        let sql2 = knex.raw('Call getmenu(' + user.id + ',' + user.role + ',' + req.body.user.permission_type + ')')
        sql2.then(async (response) => {
            // if (user.role == 3) {
            //     response[0][0].push(response[0][1][0]);
            // }
            // delete response[0][1];
            if (user.role == 6) {
                let billing_type
                await knex.select('pf.billing_type')
                    .from(table.tbl_Customer + ' as cust')
                    .leftJoin(table.tbl_Map_customer_package + ' as mcp', ' mcp.customer_id', 'cust.id')
                    .leftJoin(table.tbl_Package + ' as pkg', 'pkg.id', 'mcp.package_id')
                    .leftJoin(table.tbl_PBX_features + ' as pf', 'pf.id', 'pkg.feature_id')
                    .leftJoin(table.tbl_Extension_master + ' as e', 'e.customer_id', 'cust.id')
                    .where('e.id', user.id)
                    .then((response) => {
                        billing_type = response[0]['billing_type']
                    })
                let callminn = [];
                if (billing_type == 1) {
                    response[0][0].map(item => {
                        if (item.menuname != 'Call Min Details') {
                            callminn.push({ menuname: item.menuname, url: item.url, children: item.children, icon: item.icon, add_permission: item.add_permission, modify_permission: item.modify_permission, delete_permission: item.delete_permission, view_permission: item.view_permission, priority: item.priority });
                        }
                    })
                }
                res.json({
                    role: user.role,
                    customer_id: user.cid,
                    user_id: user.id,
                    user_name: user.first_name + ' ' + user.last_name,
                    data: jwt.sign({
                        exp: Math.floor(Date.now() / 1000) + config.jwtExpire,
                        sub: { userId: user.id, role: user.role,uemail:user.email,user_name: user.first_name + ' ' + user.last_name,uname: user.username }
                    }, config.jwtSecret),
                    uname: user.username,
                    uemail: user.email,
                    ext_number: user.ext_number,
                    menu: billing_type == 3 ? response[0][0] : callminn,
                    token: user.token,
                    code: '200'
                });
            }
            else {
                res.json({
                    role: user.role,
                    user_id: user.id,
                    user_name: user.first_name + ' ' + user.last_name,
                    data: jwt.sign({
                        exp: Math.floor(Date.now() / 1000) + config.jwtExpire,
                        sub: { userId: user.id, role: user.role,uemail:user.email,user_name: user.first_name + ' ' + user.last_name,uname: user.username  }
                    }, config.jwtSecret),
                    uname: user.username,
                    uemail: user.email,
                    ext_number: user.ext_number,
                    menu: response[0][0],
                    token: user.token,
                    code: '200'
                });
            }
        });


    }).catch((err) => {
        knex.raw("Call pbx_save_activityLog(0,00, '5','" + req.body.user.ip + "', '" + req.body.user.username + "', '" + req.body.user.password + "', '" + req.headers['user-agent'] + "')")
            .then((response) => {
                res.send({ code: err.errno, message: err.sqlMessage });
            })

    });
}

function getHistory(req, res) {

    knex.raw('Call pbx_get_history(' + req.body.loginId + ',' + req.body.role + ')')
        .then((response) => {
            res.send(response[0][0]);
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function makeNotificationAsRead(req, res) {
    knex.raw('Call pbx_mark_read_notification(' + req.userId + ',' + req.role + ')')
        .then((response) => {
            res.send(response[0][0]);
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function updatePassword(req, res) {
    passwordInput = encrypt.encryptAes(req.body.newPassword);         
    knex(table.tbl_Customer).where('username', '=', "" + req.uname + "")
        .update({ password: passwordInput }).then((response) => {
            if (response == 1) {
                pushEmail.getCustomerName(req.uemail).then((data) => {
                    pushEmail.getEmailContentUsingCategory('ChangePassword').then(val => {
                        pushEmail.sendmail({ data: data, val: val }).then((data1) => {
                            res.json({ data1 })
                        })
                    })
                })
            } else {
                res.status(401).send({ error: 'Unauthorized', message: 'Password updated' });
            }
        }).catch((err) => { console.log(err); throw err });
}

function emailExist(req, res) {
    let timeVar = Date.now();
    let currentTime = new Date(timeVar);
    currentTime.setMinutes(currentTime.getMinutes() + 1);
    let updatedTimeVar = currentTime.getTime();
    let emailDetails = `action=${req.body.action},email=${req.body.email},time=${timeVar + 1}`
    let decode = Buffer.from(emailDetails, 'utf8').toString('base64');
    let decodeTimeToken = Buffer.from(String(updatedTimeVar), 'utf8').toString('base64');

    knex(table.tbl_Customer).count('id', { as: 'count' }).where('email', '=', "" + req.body.email + "").andWhere('status', '=', '1')
        .then(async (response) => {
            if (response[0].count > 0) {
                await knex(table.tbl_Customer).update({ 'token': decodeTimeToken }).where('email', '=', "" + req.body.email + "")
                pushEmail.getCustomerName(req.body.email).then((data) => {
                    pushEmail.getEmailContentUsingCategory('ForgetPassword').then(val => {
                        pushEmail.sendmail({ data: data, val: val, action: `${req.body.action}`, mailLists: `http://localhost:4200/auth/forgetPassword?param=${decode}` }).then((data1) => {
                            res.json({ data1 })
                        })
                    })
                })
            } else {
                res.json({ response })
            }
        }).catch((err) => { console.log(err); throw err });
}

function emailExpireToken(req, res) {
    const currentTime = Date.now();
    const email = req.query.email;
    knex(table.tbl_Customer)
        .select('token')
        .where('email', email)
        .andWhere('status', '1')
        .then((response) => {
            if (response.length > 0) {
                const token = response[0].token;
                const decodedTimeToken = Buffer.from(token, 'base64').toString('utf8'); // decoding the Token hear                
                if (currentTime > Number(decodedTimeToken)) {
                    res.json({ error: 'Link has Expired', code: 404 });
                } else {
                    res.status(200).json({ token: response[0].token, code: 200 });
                }
            } else {
                res.json({ response: 'No active token found' });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });
}

function getMenuListForOcPbx(req, res) {
    knex.raw('Call getmenulistforocpbx(' + req.body.productid + ')')
        .then((response) => {
            res.send(response[0][0]);
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getSystemIP(req, res) {
    const pieces = req.ip.split(':');
    const last = pieces[pieces.length - 1];
    res.send({
        response: last
    });
}
module.exports = { login, updatePassword, emailExist, getMenuListForOcPbx, getHistory, makeNotificationAsRead, getSystemIP, emailExpireToken };
