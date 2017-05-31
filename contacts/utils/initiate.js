/**
 * <p>Project: MIT Library Practice</p>
 * <p>Description: initiate</p>
 * <p>Copyright: Copyright (c) 2017</p>
 * <p>Company: MIT Labs Co., Inc</p>
 *
 * @author <chao.deng@kewill.com>
 * @version 1.0
 * @since 1/15/2017
 */
const fs = require('fs');
const log4js = require('log4js');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Grid = require('gridfs-stream');
const CacheControl = require('express-cache-control');
const access = require('./../config/access');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const logger = factory('logger', 'standard');
const cache = factory('cache');

function makeSubDir(subDir) {
    /**
     * make a log directory, just in case it isn't there.
     */
    try {
        fs.mkdirSync('./' + subDir);
    } catch (error) {
        if (error.code !== 'EEXIST') {
            logger.error("Could not set up log directory, error was: ", error);
            process.exit(1);
        }
    }
}

function buildLogger(category) {
    makeSubDir('logs');
    log4js.configure('config/log4js.json');
    return log4js.getLogger(category);
}

function buildCache() {
    return new CacheControl().middleware;
}

function buildGrid() {
    if (mongoose.connection && mongoose.connection.db) {
        return new Grid(mongoose.connection.db, mongoose.mongo);
    } else {
        let errorMsg = 'Can\'t create grid file system stream, please ensure mongodb connected first';
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }
}

function factory(component, category = 'standard') {
    let target = null;
    switch (component) {
        case 'logger':
            target = buildLogger(category);
            break;
        case 'cache':
            target = buildCache();
            break;
        case 'grid':
            target = buildGrid();
            break;
    }
    return target;
}

function contactSchema() {
    let schema = Object.create(null);
    schema.firstname = String;
    schema.lastname = String;
    schema.title = String;
    schema.company = String;
    schema.jobtitle = String;
    schema.primarycontactnumber = {type: String, index: {unique: true}};
    schema.othercontactnumbers = [String];
    schema.primaryemailaddress = String;
    schema.otheremailaddresses = String;
    schema.groups = [String];
    return schema;
}

function authSchema() {
    "use strict";
    let schema = Object.create(null);
    schema.username = {type: String, index: {unique: true}};
    schema.password = String;
    schema.role = [String];
    return schema;
}

function initConnection() {
    let connectionInfo = access.mongodbConnectionInfo();
    mongoose.connect(connectionInfo.url);
    let instance = mongoose.connection;
    instance.on('error', logger.error.bind(logger, 'connection error:'));
    instance.once('open', function () {
        logger.info('Connect to database: ' + connectionInfo.provider);
    });
}

function initModel(name, schema) {
    let instance = new Schema(schema);
    instance.plugin(mongoosePaginate);
    return mongoose.model(name, instance);
}

module.exports = {
    logger, cache, factory, contactSchema, authSchema, initConnection, initModel
};