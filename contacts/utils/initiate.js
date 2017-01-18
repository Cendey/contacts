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
const grid = require('gridfs-stream');
const access = require('./../config/access');
let Schema = mongoose.Schema;
mongoose.Promise = Promise;
const logger = factory('standard');

function logDir() {
    /**
     * make a log directory, just in case it isn't there.
     */
    try {
        fs.mkdirSync('./logs');
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error("Could not set up log directory, error was: ", error);
            process.exit(1);
        }
    }
}

function factory(category = 'standard') {
    logDir();
    log4js.configure('config/log4js.json');
    return log4js.getLogger(category);
}

exports.factory = factory;

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

exports.initConnection = function () {
    let connectionInfo = access.mongodbConnectionInfo();
    mongoose.connect(connectionInfo.url);
    let instance = mongoose.connection;
    instance.on('error', logger.error.bind(logger, 'connection error:'));
    instance.once('open', function () {
        logger.info('Connect to database: ' + connectionInfo.provider);
    });
};

exports.initSchema = function (name) {
    let instance = new Schema(contactSchema());
    instance.plugin(mongoosePaginate);
    return mongoose.model(name, instance);
};

exports.retrieveGridFStream = function () {
    if (mongoose.connection && mongoose.connection.db) {
        return grid(mongoose.connection.db, mongoose.mongo);
    } else {
        let errorMsg = 'Can\'t create grid file system stream, please ensure mongodb connected first';
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }
};