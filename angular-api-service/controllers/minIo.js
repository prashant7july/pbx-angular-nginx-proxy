const fs = require('fs');
const minIoClient = require('../config/minIo.config');

const uploadToMinio = (file, bucketName) => {    
    return new Promise((resolve, reject) => {
        const metaData = {
            'Content-Type': file.mimetype,
            'X-Amz-Meta-Testing': '1234',
        };        
        const objectName = 'profile_' + Date.now() + '_' + file.originalname;
        minIoClient.fPutObject(bucketName, objectName, file.path, metaData, (err, etag) => {
            if (err) {
                reject(err);
            } else {
                resolve({ etag: etag, fileName: objectName });
            }
            fs.unlinkSync(file.path);
        });
    });
};

const fetchMinIo = async (bucketName, fileName) => {
    try {        
        let response = await minIoClient.presignedGetObject(bucketName, fileName);
        return response;
    } catch (error) {
        throw new Error(error);
    }    
}

const fetchExcel = async (bucketName, fileName, tempFilePath) => {
    try {
        return new Promise((resolve, reject) => {
            minIoClient.fGetObject(bucketName, fileName, tempFilePath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = { uploadToMinio, fetchMinIo, fetchExcel }