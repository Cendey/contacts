/**
 * <p>Project: MIT Liberal Project</p>
 * <p>Description: dbconfig</p>
 * <p>Copyright: Copyright (c) 2016</p>
 * <p>Company: MIT Liberal Co., Ltd.</p>
 *
 * @author <cendey@126.com>
 * @since 12/28/2016
 * @version 1.0
 */
"use strict";

exports.oracleConnectionInfo = function () {
    let info = Object.create(null);
    //Oracle database instance access user with authorization
    info.user = process.env.NODE_ORACLEDB_USER || "kerry_sb1_20140208";

    // Instead of hard coding the password, consider prompting for it,
    // passing it in an environment variable via process.env, or using
    // External Authentication.
    info.password = process.env.NODE_ORACLEDB_PASSWORD || "kerry_sb1_20140208";

    // For information on connection strings see:
    // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#connectionstrings
    info.connectString = process.env.NODE_ORACLEDB_CONNECTIONSTRING || "10.104.46.205:1523/orcl11g";

    // Setting externalAuth is optional.  It defaults to false.  See:
    // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#extauth
    info.externalAuth = !!process.env.NODE_ORACLEDB_EXTERNALAUTH;

    return info;
};

exports.mongodbConnectionInfo = function () {
    let info = Object.create(null);
    //Database provider
    info.provider = "mongodb";
    //Mongodb authorization user to access database instance
    info.user = "cendey";

    //Mongodb authorized user's password
    info.password = "practice_1216";

    //Binding IP address
    info.ip = "127.0.0.1";

    //Access port
    info.port = "27017";

    //Database instance to access
    info.database = "contacts";

    //Database Url to access
    info.url = info.provider + "://" + info.user + ":" + info.password + "@" + info.ip + ":" + info.port + "/" + info.database;
    return info;
};

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