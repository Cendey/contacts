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
const log4js = require('log4js');

exports.contactSchema = function () {
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
};

exports.initLog = function () {
    log4js.configure('config/log4js.json');
    return log4js.getLogger('standard');
};