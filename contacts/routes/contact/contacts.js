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
const express = require('express');
const url = require('url');
const initiate = require('./../../utils/initiate');
const utilities = require('./../../utils/utilities');
const contactHandle = require('./../../public/javascripts/handler/contact/handle');
const router = express.Router();

const logger = initiate.factory('logger', 'standard');
const cache = initiate.factory('cache');

initiate.initConnection();
let Contact = initiate.initModel('Contact', initiate.contactSchema());
let User = initiate.initModel('User', initiate.authSchema());
let adminUser = new User({
    username: 'admin',
    password: 'admin',
    role: 'Admin'
});

adminUser.save(function (error) {
    if (!error) {
        adminUser.save();
        logger.info('Create Administrator User Success!');
    } else {
        logger.info('Administrator User Already Exists!');
    }
});

router.get('/query/:number', function (request, response) {
    logger.info(request.url + ' : querying for ' + request.params.number);
    contactHandle.findByNumber(Contact, request.params.number, response);
});

router.post('/update', function (request, response) {
    contactHandle.update(Contact, request.body, response)
});

router.put('/add', function (request, response) {
    contactHandle.create(Contact, request.body, response)
});

router.delete('/delete/:primarycontactnumber', function (request, response) {
    contactHandle.remove(Contact, request.params.primarycontactnumber, response)
});

router.get('/list', cache('minutes', 1), function (request, response) {
    let query = url.parse(request.url, true).query;
    if (Object.keys(query).length) {
        if (query['limit'] || query['page']) {
            logger.info(`Listing contact with limit ${query["limit"]} or page ${query["page"]}`);
            contactHandle.queryByPaginate(Contact, request, response);
        } else {
            logger.info('Listing contact with query parameters ' + utilities.literal(request.query));
            contactHandle.queryByFilter(Contact, query, response);
        }
    } else {
        logger.info('Listing all contacts with none filter');
        contactHandle.queryByPaginate(Contact, request, response);
    }
});

module.exports = router;