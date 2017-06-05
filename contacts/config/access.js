/**
 * <p>Project: MIT Liberal Project</p>
 * <p>Description: config</p>
 * <p>Copyright: Copyright (c) 2016</p>
 * <p>Company: MIT Liberal Co., Ltd.</p>
 *
 * @author <cendey@126.com>
 * @since 12/28/2016
 * @version 1.0
 */
"use strict";

function metaForOracle() {
    let dbMeta = Object.create(null);
    //Oracle database instance access user with authorization
    dbMeta.user = process.env.NODE_ORACLEDB_USER || "kerry_sb1_20140208";

    // Instead of hard coding the password, consider prompting for it,
    // passing it in an environment variable via process.env, or using
    // External Authentication.
    dbMeta.password = process.env.NODE_ORACLEDB_PASSWORD || "kerry_sb1_20140208";

    // For information on connection strings see:
    // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#connectionstrings
    dbMeta.connectString = process.env.NODE_ORACLEDB_CONNECTIONSTRING || "10.104.46.205:1523/orcl11g";

    // Setting externalAuth is optional.  It defaults to false.  See:
    // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#extauth
    dbMeta.externalAuth = !!process.env.NODE_ORACLEDB_EXTERNALAUTH;

    return dbMeta;
}

function metaForMongodb() {
    let dbMeta = Object.create(null);
    //Database provider
    dbMeta.provider = "mongodb";
    //Mongodb authorization user to access database instance
    dbMeta.user = "cendey";

    //Mongodb authorized user's password
    dbMeta.password = "practice_1216";

    //Binding IP address
    dbMeta.ip = "127.0.0.1";

    //Access port
    dbMeta.port = "27017";

    //Database instance to access
    dbMeta.database = "contacts";

    //Database Url to access
    dbMeta.url = dbMeta.provider + "://" + dbMeta.user + ":" + dbMeta.password + "@" + dbMeta.ip + ":" + dbMeta.port + "/" + dbMeta.database;
    return dbMeta;
}

exports = module.exports = {metaForOracle, metaForMongodb};