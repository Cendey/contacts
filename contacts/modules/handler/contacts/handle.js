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
let contactService = require('./../../service/contacts/service');
let router = express.Router();

contactService.initConnection();
let Contact = contactService.initSchema('Contact');
router.get('/query/:number', function (request, response) {
    console.log(request.url + ' : querying for ' + request.params.number);
    contactService.findByNumber(Contact, request.params.number, response);
});

router.post('/update', function (request, response) {
    contactService.update(Contact, request.body, response)
});

router.post('/add', function (request, response) {
    contactService.create(Contact, request.body, response)
});

router.post('/delete/:primarycontactnumber', function (request, response) {
    contactService.remove(Contact, request.params.primarycontactnumber, response)
});

router.get('/list', function (request, response) {
    console.log('Listing all contacts with ' + request.params.key + '=' + request.params.value);
    contactService.list(Contact, response);
});

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

router.get('/all', function (request, response) {
    console.log("All");
    new Promise((resolve, reject) => {
        retrieveManager('A', resolve, reject);
    }).then(result => {
        let content = assembled(result);
        response.format({
            'text/xml': function () {
                response.setHeader('Content-Type', 'text/xml');
                response.end(parser.parse('MANAGERS', content));
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