var express = require('express');
var multer = require('multer');
const imageUpload = express();
var path = require("path");
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const fs = require('fs');

var DIR = '';
var promptName = '';
var fileName = '';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        DIR = path.join(__dirname, '../app/assets/', 'uploads/'); //for live
        //    DIR = path.join(__dirname, '../../web/src/assets/', 'uploads/'); //for localhost        
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const modifiedFileName = 'profile_' + Date.now() + '_' + file.originalname;
        fileName = modifiedFileName; // Store the modified filename globally
        cb(null, modifiedFileName);
    }
});

const fileFilter = (req, file, cb) => {    
    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Only PNG, JPG, and JPEG images are allowed!'), false);
    }
};

let upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

imageUpload.use(express.json({ type: "application/json" }));
imageUpload.use(express.urlencoded({ extended: false }));

imageUpload.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

imageUpload.post('/profile', upload.single('profileImg'), function (req, res) {
    if (!req.file) {
        return res.send({
            success: false
        });
    } else {
        knex(table.tbl_pbx_profile_logo).select('logo_img').where('customer_id', req.body.customer_id).andWhere('role', "" + req.body.role + "").then((response) => {
            if (response.length && response[0]['logo_img'] != "") {
                fs.unlink('/var/www/html/pbx/app/' + response[0]['logo_img'], (err) => {
                    if (!err) {
                        return res.send({
                            success: true,
                            file: fileName
                        })
                    } else {
                        return res.send({
                            success: false,
                            error: err
                        })
                    }
                })
            }else{
                return res.send({
                    success: true,
                    file: fileName
                })
            }
        })
    }
});

imageUpload.post('/favicon', upload.single('favicon'), function (req, res) {        
    if (!req.file) {
        return res.send({
            success: false
        });
    } else {        
        knex(table.tbl_pbx_profile_logo).select('favicon_img').where('customer_id', req.body.customer_id).andWhere('role', "" + req.body.role + "").then((response) => {
            if (response.length && response[0]['favicon_img'] != "") {
                fs.unlink('/var/www/html/pbx/app/' + response[0]['favicon_img'], (err) => {                    
                    if (!err) {
                        return res.send({
                            success: true,
                            file: fileName
                        })
                    } else {
                        return res.send({
                            success: false,
                            error: err
                        })
                    }
                })
            }else{
                return res.send({
                    success: true,
                    file: fileName
                })
            }
        }).catch((err) => {            
            return res.send({
                success: false,
                err: err
            })
        })
    }
});

imageUpload.post('/powered_by', upload.single('powered_by'), function (req, res) {        
    if (!req.file) {
        return res.send({
            success: false
        });
    } else {        
        knex(table.tbl_pbx_profile_logo).select('powered_by').where('customer_id', req.body.customer_id).andWhere('role', "" + req.body.role + "").then((response) => {
            if (response.length && response[0]['powered_by'] != "") {   
                fs.unlink('/var/www/html/pbx/app/' + response[0]['powered_by'], (err) => {
                    if (!err) {
                        return res.send({
                            success: true,
                            file: fileName
                        })
                    } else {
                        return res.send({
                            success: false,
                            error: err
                        })
                    }
                })
            }else{
                return res.send({
                    success: true,
                    file: fileName
                })
            }
        }).catch((err) => {            
            return res.send({
                success: false,
                err: err
            })
        })
    }
});
module.exports = imageUpload;
