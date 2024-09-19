var express = require('express');
var multer = require('multer');
const promptUpload = express();
var path = require("path");
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const { createModuleLog } = require('../helper/modulelogger');

var DIR =  '';
//const DIR = '../../api';  //for localhost  
var promptName = '';
var fileName = '';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {              
        // DIR = '../api/upload/3661/prompts';
        // console.log(DIR)
        DIR = path.join(__dirname, '../', 'upload/', req.body.user_id, '/prompts');
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        if(req.body.promptType=='1'){
            promptName = 'moh_'
        }else if(req.body.promptType=='2'){
            promptName = 'vm_';
        }else if(req.body.promptType=='11'){
            promptName = 'bc_';
        }else if(req.body.promptType=='15'){
            promptName = 'ring_';
        }else if(req.body.promptType=='16'){
            promptName = 'callgroup_';
        }else if(req.body.promptType=='17'){
            promptName = 'general';
        }else{
            promptName = 'ivr_';
        }
        let result = file.originalname.replace(/[^\w.]/g, '');
        fileName = promptName + 'prompt_' + Date.now()+ '_'  + result;
        cb(null, promptName + 'prompt_' + Date.now()+ '_'  + result);
        //cb(null, file.originalname);
    }
});

let upload = multer({ storage: storage });

promptUpload.use(express.json({ type: "application/json" }));
promptUpload.use(express.urlencoded({ extended: false }));

promptUpload.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

promptUpload.post('/prompts', upload.single('prompt'), function (req, res) {
    if (!req.file) {
        return res.send({
            success: false
        });

    } else {        
        var final_path = DIR + '/' + fileName;
        fileName = fileName.replace(/[^\w.]/g, '');
        var exicutePath = path.join('/assets/prompts/', req.body.user_id, '/prompts/', fileName);
        var data = req.body;
        data.prompt_description = data.prompt_description ? data.prompt_description : '';
        knex(table.tbl_pbx_prompt)
            .count('prompt_name as nameCount')
            .where('prompt_name', data.prompt_name)
            .andWhere('prompt_type', data.promptType)
            .andWhere('customer_id',data.user_id)
            .then((response) => {
                if (response[0].nameCount > 0) {
                    res.json({
                        code : 409, // 409 is given for duplicate name : - Nagender
                        error_msg: 'Prompt Name is already Exist'
                    });
                } else {
                    knex(table.tbl_pbx_prompt).insert({
                        prompt_name: "" + data.prompt_name + "",
                        prompt_type: "" + data.promptType + "",
                        prompt_desc: "" + data.prompt_description + "",
                        file_path: "" + exicutePath + "",
                        customer_id: data.user_id
                    }).then((response) => {                        
                        input = {
                            "Prompt Type": req.body.feature_name,
                            "Prompt Name": req.body.prompt_name,
                            "Prompt Description": req.body.prompt_description,
                            "File": exicutePath
                        }
                        createModuleLog(table.tbl_pbx_audit_logs, {
                            module_action_id: response,
                            module_action_name: req.body.prompt_name,
                            module_name: "prompt",
                            message: "Prompt Uploaded",
                            customer_id: req.body.user_id,
                            features: "" + JSON.stringify(input) + ""
                        })
                        res.json({
                            success: true,
                            code : 200
                        });
                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });


    }
});

module.exports = promptUpload;
