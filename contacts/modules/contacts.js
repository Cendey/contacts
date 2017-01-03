/**
 * <p>Project: MIT Liberal Project</p>
 * <p>Description: contacts</p>
 * <p>Copyright: Copyright (c) 2016</p>
 * <p>Company: MIT Liberal Co., Ltd.</p>
 *
 * @author <cendey@126.com>
 * @since 12/27/2016
 * @version 1.0
 */
let express = require('express');
let oracle = require('oracledb');
let parser = require("js2xmlparser");
let levelup = require('level');
let config = require('./../data/config.js');
let sql = require('./../data/sql');
let router = express.Router();
let url = require('url');
let fs = require('fs');

function readJsonFile() {
    let file = './data/contacts.json';
    return fs.readFileSync(file);
}

function retrieveManager(status, resolve, reject) {
    oracle.getConnection(
        {user: config.user, password: config.password, connectString: config.connectString},
        function (error, connection) {
            if (error) {
                console.log(error.message);
                reject(error);
            } else {
                connection.execute(
                    sql.manager_user,
                    [status],
                    function (error, result) {
                        if (error) {
                            console.error(error.message);
                            release(connection);
                            reject(error);
                        } else {
                            release(connection);
                            resolve(result);
                        }
                    }
                );
            }
        }
    );
}

function release(connection) {
    connection.close(function (error) {
        if (error) {
            console.error(error.message);
        }
    });
}

function assembled(result) {
    let meta = result['metaData'];
    let data = result.rows;
    let contacts = [];
    for (let cell  of data) {
        let item = Object.create(null);
        for (let [idx, value] of cell.entries()) {
            item[meta[idx].name] = value;
        }
        contacts.push(item);
    }

    return contacts;
}

function list() {
    return JSON.parse(readJsonFile());
}

function query(number) {
    let jsonResult = JSON.parse(readJsonFile());
    let result = jsonResult.result;

    for (let contact of result) {
        if (contact['PrimaryContactNumber'] === number) {
            return contact;
        }
    }
    return null;
}

function queryByParams(params) {
    let jsonResult = JSON.parse(readJsonFile());
    let result = jsonResult.result;

    for (let contact of result) {
        let match = true;
        for (let key of Object.keys(params)) {
            if (!(match = (contact[key].indexOf(params[key])) !== -1)) break;
        }
        if (match) {
            return contact;
        }
    }
    return null;
}

function listGroups() {
    let jsonResult = JSON.parse(readJsonFile());
    let result = jsonResult.result;

    let groups = [];
    for (let contact of result) {
        for (let group of contact["Groups"]) {
            if (groups.indexOf(group) === -1) {
                groups.add(group)
            }
        }
    }

    return groups;
}

function getGroupByName(groupName) {
    let jsonResult = JSON.parse(readJsonFile());
    let result = jsonResult.result;

    let contacts = [];
    for (let contact of result) {
        for (let group of contact["Groups"]) {
            if (group === groupName && contacts.indexOf(contact) === -1) {
                contacts.push(contact);
            }
        }
    }

    return contacts;
}


/* GET contacts listing. */
router.get('/', function (request, response) {
    let params = url.parse(request.url, true).query;
    if (Object.keys(params).length === 0) {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(list()))
    } else {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(queryByParams(params)));
    }
});

router.get('/number/:number', function (request, response) {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(query(request.params.number)));
});

router.get('/groups', function (request, response) {
    console.log('Groups');
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(listGroups()));
});

router.get('/groups/:name', function (request, response) {
    console.log("Groups");
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(getGroupByName(request.params.name)));
});

router.get('/all', function (request, response) {
    console.log("All");
    new Promise((resolve, reject) => {
        retrieveManager('A', resolve, reject);
    }).then(result => {
        let content = assembled(result);
        response.format({
            'text/xml': function () {
                response.setHeader('Content-Type', 'text/xml');
                response.end(parser.parse('MANAGERS',content));
            },
            'application/json': function () {
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify(content));
            },
            'default': function () {
                response.status(406).send('Not Acceptable');
            }
        });
    });
});
module.exports = router;