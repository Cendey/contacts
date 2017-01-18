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
let router = express.Router();

let logger = initiate.factory('standard');

initiate.initConnection();
let Contact = initiate.initSchema('Contact');
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

router.get('/list', function (request, response) {
    let query = url.parse(request.url, true).query;
    if (Object.keys(query).length) {
        if(query['limit'] || query['page']){
            logger.info(`Listing contact with limit ${query["limit"]} or page ${query["page"]}`);
            contactHandle.queryByPaginate(Contact, request, response);
        }else{
            logger.info('Listing contact with query parameters ' + utilities.toLiteral(request.query));
            contactHandle.queryByFilter(Contact, query, response);
        }
    } else {
        logger.info('Listing all contacts with none filter');
        contactHandle.queryByPaginate(Contact, request, response);
    }
});
module.exports = router;