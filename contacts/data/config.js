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
module.exports = {
    user: process.env.NODE_ORACLEDB_USER || "kerry_sb1_20140208",

    // Instead of hard coding the password, consider prompting for it,
    // passing it in an environment variable via process.env, or using
    // External Authentication.
    password: process.env.NODE_ORACLEDB_PASSWORD || "kerry_sb1_20140208",

    // For information on connection strings see:
    // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#connectionstrings
    connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || "10.104.46.205:1523/orcl11g",

    // Setting externalAuth is optional.  It defaults to false.  See:
    // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#extauth
    externalAuth: !!process.env.NODE_ORACLEDB_EXTERNALAUTH
};