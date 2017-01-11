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
let url = require('url');
let contactHandle = require('./../../public/javascripts/handler/contact/handle');
let router = express.Router();

contactHandle.initConnection();
let Contact = contactHandle.initSchema('Contact');
router.get('/query/:number', function (request, response) {
    console.log(request.url + ' : querying for ' + request.params.number);
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
    if(Object.keys(query).length){
        console.log('Listing contact with ' + request.params.key + '=' + request.params.value);
        contactHandle.queryByFilter(Contact, query, response);
    }else{
        console.log('Listing all contacts with ' + request.params.key + '=' + request.params.value);
        contactHandle.list(Contact, response);
    }
});
module.exports = router;