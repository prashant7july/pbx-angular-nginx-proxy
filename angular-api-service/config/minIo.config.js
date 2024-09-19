const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_HOST || '103.163.40.209',
    port: Number(process.env.MINIO_PORT) || 9900,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESSKEY || 'bhupendra',
    secretKey: process.env.MINIO_SECRETKEY || 'bhupendra@1234'
});

module.exports = minioClient;