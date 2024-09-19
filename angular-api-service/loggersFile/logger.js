var log4js = require('log4js');
var config = require('../config/app.js');

log4js.configure({
    appenders: { console: { type: 'console' }, file: { type: 'file', filename: config.log_location } },
    categories: { default: { appenders: ['file', 'console'], level: 'debug' } }
});

const logger = log4js.getLogger('');

function debugLog(msg) {
    logger.level = 'debug';
    logger.debug(msg);
}

function traceLog(msg) {
    logger.level = 'trace';
    logger.trace(msg);
}

function infoLog(msg) {
    logger.level = 'info';
    logger.info(msg);
}

function warnLog(error) {
    logger.level = 'warn';
    if (error instanceof Error) {
        logger.error(error.stack)
    } else {
        logger.error(error);
    }
}

function errorLog(error) {
    logger.level = 'error';
    if (error instanceof Error) {
        logger.error(error.stack)
    } else {
        logger.error(error);
    }
}

function fatalLog(msg) {
    logger.level = 'fatal';
    logger.fatal(msg);
}

module.exports = { debugLog, fatalLog, errorLog, warnLog, infoLog, traceLog };