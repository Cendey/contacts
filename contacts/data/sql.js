/**
 * <p>Project: MIT Liberal Project</p>
 * <p>Description: sql</p>
 * <p>Copyright: Copyright (c) 2016</p>
 * <p>Company: MIT Liberal Co., Ltd.</p>
 *
 * @author <cendey@126.com>
 * @since 12/29/2016
 * @version 1.0
 */
module.exports = {
    manager_user: "select unique manager.userid,\n" +
    "manager.username,\n" +
    "manager.usertype,\n" +
    "manager.password,\n" +
    "manager.companyid,\n" +
    "manager.status\n" +
    "  from syuser manager, syuser employee\n" +
    " where (manager.userid = employee.createby or\n" +
    "manager.userid = employee.updateby)\n" +
    "   and manager.status = :status\n" +
    " order by manager.userid"
};