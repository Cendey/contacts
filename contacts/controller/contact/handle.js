/**
 * <p>Project: MIT Liberal Project</p>
 * <p>Description: handle</p>
 * <p>Copyright: Copyright (c) 2017</p>
 * <p>Company: MIT Liberal Co., Ltd.</p>
 *
 * @author <cendey@126.com>
 * @since 1/9/2017
 * @version 1.0
 */
const initiate = require('../../public/javascripts/utils/initiate');

const logger = initiate.factory('logger', 'standard');

/**
 * <em>Summary</em> <p>Transform query body to target object in mongodb schema</p>
 * @param body <p>Query body</p>
 * @param Contact <p>Contact model</p>
 * @returns {*}
 *
 * @private
 */
function toContact(body, Contact) {
    return new Contact(
        {
            firstname: body.firstname,
            lastname: body.lastname,
            title: body.title,
            company: body.company,
            jobtitle: body.jobtitle,
            primarycontactnumber: body.primarycontactnumber,
            othercontactnumbers: body.othercontactnumbers,
            primaryemailaddress: body.primaryemailaddress,
            otheremailaddresses: body.otheremailaddresses,
            groups: body.groups
        }
    );
}

//build a JSON string with the attribute and the value
/**
 * <em>Summary<em> <p>Build filter to mongodb query criterion</p>
 * @param params <p>Query criterion</p>
 *
 * @private
 */
function buildFilter(params) {
    let filter = '{';
    if (params) {
        let isFirst = false;
        for (let key of Object.keys(params)) {
            if (!isFirst) {
                isFirst = true
            } else {
                filter = filter.concat(',');
            }
            filter = filter.concat('\"' + key + '\":\"' + params[key] + '\"');
        }
    }
    filter = filter.concat('}');
    return JSON.parse(filter);
}

/**
 * <em>Summary</em> <p>Populate contact model record to fill data</p>
 * @param data <p>Construe to hold contact record</p>
 * @param contact <p>Contact model record from mongodb</p>
 *
 * @private
 */
function populateContact(data, contact) {
    if (contact) {
        data.firstname = contact.firstname;
        data.lastname = contact.lastname;
        data.title = contact.title;
        data.company = contact.company;
        data.jobtitle = contact.jobtitle;
        data.primarycontactnumber = contact.primarycontactnumber;
        data.othercontactnumbers = contact.othercontactnumbers;
        data.primaryemailaddress = contact.primaryemailaddress;
        data.otheremailaddresses = contact.otheremailaddresses;
        data.groups = contact.groups;
    }
}

/**
 * <em>Summary</em> <p>Delete specified contact from mongodb</p>
 * @param model <p>Contact model schema</p>
 * @param primaryNumber <p>Contact primary number as key to search</p>
 * @param response <p>Client request corresponding feedback</p>
 *
 * @public
 */
function remove(model, primaryNumber, response) {
    logger.warn('Deleting contact with primary number: ' + primaryNumber);
    model.findOne({primarycontactnumber: primaryNumber},
        function (error, data) {
            if (error) {
                logger.error(error);
                if (response) {
                    response.writeHead(500, {'Content-Type': 'text/plain'});
                    response.end('Internal server error');
                }
            } else {
                if (!data) {
                    logger.warn('Not found');
                    if (response) {
                        response.writeHead(404, {'Content-Type': 'text/plain'});
                        response.end('Not Found');
                    }
                } else {
                    data.remove(function (error) {
                        if (!error) {
                            data.remove();
                        }
                        else {
                            logger.error(error);
                        }
                    });
                    if (response) {
                        response.send('Deleted');
                    }
                }
            }
        }
    );
}

/**
 * <em>Summary</em> <p>Update a specified contact information</p>
 * @param model <p>Contact model schema</p>
 * @param requestBody <p>Specified contact criterion</p>
 * @param response <p>Client's feedback</p>
 *
 * @public
 */
function update(model, requestBody, response) {
    let primaryNumber = requestBody.primarycontactnumber;
    model.findOne({primarycontactnumber: primaryNumber},
        function (error, data) {
            if (error) {
                logger.error(error);
                if (response) {
                    response.writeHead(500, {'Content-Type': 'text/plain'});
                    response.end('Internal server error');
                }
            } else {
                let contact = toContact(requestBody, model);
                if (!data) {
                    logger.warn('Contact with primary number: ' + primaryNumber
                        + ' does not exist. The contact will be created.');
                    contact.save(function (error) {
                        if (!error)
                            contact.save();
                    });
                    if (response) {
                        response.writeHead(201, {'Content-Type': 'text/plain'});
                        response.end('Created');
                    }
                    return;
                }
                //populate the document with the updated values
                populateContact(data, contact);
                // now save
                data.save(function (error) {
                    if (!error) {
                        logger.info('Successfully updated contact with primary number: ' + primaryNumber);
                        data.save();
                    } else {
                        logger.error('error on save');
                    }
                });
                if (response) {
                    response.send('Updated');
                }
            }
        }
    );
}

/**
 * <em>Summary</em> <p>Add a new contact to mongodb</p>
 * @param model <p>Contact model schema</p>
 * @param requestBody <p>A new contact information from client request</p>
 * @param response <p>Feedback to client request</p>
 *
 * @public
 */
function create(model, requestBody, response) {
    let contact = toContact(requestBody, model);
    let primaryNumber = requestBody.primarycontactnumber;
    contact.save((error) => {
        if (!error) {
            contact.save();
            logger.info("Create a new contact");
            if (response) {
                response.writeHead(201, {'Content-Type': 'text/plain'});
                response.end('Created');
            }
        } else {
            logger.warn('Checking if contact saving failed due to already existing primary number:' + primaryNumber);
            model.findOne({primarycontactnumber: primaryNumber},
                (error, data) => {
                    populateContact(data, contact);
                    if (error) {
                        logger.error(error);
                        if (response) {
                            response.writeHead(500, {'Content-Type': 'text/plain'});
                            response.end('Internal server error');
                        }
                    } else {
                        let contact = toContact(requestBody, model);
                        if (!data) {
                            logger.warn('The contact does not exist. It will be created');
                            contact.save((error) => {
                                if (!error) {
                                    contact.save();
                                } else {
                                    logger.error(error);
                                }
                            });
                            if (response) {
                                response.writeHead(201, {'Content-Type': 'text/plain'});
                                response.end('Created');
                            }
                        } else {
                            logger.info('Updating contact with primary contact number:' + primaryNumber);
                            populateContact(data, contact);
                            data.save((error) => {
                                if (!error) {
                                    data.save();
                                    response.end('Updated');
                                    logger.info('Successfully Updated contact with primary contact number: ' + primaryNumber);
                                } else {
                                    logger.error('Error while saving contact with primary contact number:' + primaryNumber);
                                    logger.error(error);
                                }
                            });
                        }
                    }
                }
            );
        }
    });
}

/**
 * <em>Summary</em> <p>Find a contact according to its primary contact number</p>
 * @param model <p>Contact schema model</p>
 * @param primaryNumber <p>Given contact's primary number as search key</p>
 * @param response <p>Client's feedback</p>
 *
 * @public
 */
function findByNumber(model, primaryNumber, response) {
    model.findOne({primarycontactnumber: primaryNumber},
        (error, result) => {
            if (error) {
                logger.error(error);
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.end('Internal server error');
            } else {
                if (!result) {
                    if (response) {
                        response.writeHead(404, {'Content-Type': 'text/plain'});
                        response.end('Not Found');
                    }
                    return;
                }
                if (response) {
                    response.setHeader('Content-Type', 'application/json');
                    response.send(result);
                }
                logger.info(result);
            }
        }
    );
}

/**
 * <em>Summary</em> <p>List all contacts persisted in mongodb</p>
 * @param model <p>Contact model schema</p>
 * @param response <p>Client's feedback</p>
 *
 * @public
 */
function list(model, response) {
    model.find({}, (error, result) => {
        if (error) {
            logger.error(error);
            return null;
        }
        if (response) {
            response.setHeader('content-type', 'application/json');
            response.end(JSON.stringify(result));
        }
        return JSON.stringify(result);
    });
}

/**
 * <em>Summary</em> <p>Query contact(s) with criterion or filter</p>
 * @param model <p>Contact model schema</p>
 * @param params <p>Query criterion or filter condition</p>
 * @param response <p>Client's feedback</p>
 *
 * @public
 */
function queryByFilter(model, params, response) {
    model.find(buildFilter(params), (error, result) => {
        if (error) {
            logger.error(error);
            response.writeHead(500, {'Content-Type': 'text/plain'});
            response.end('Internal server error');
        } else {
            if (!result) {
                if (response) {
                    response.writeHead(404, {'Content-Type': 'text/plain'});
                    response.end('Not Found');
                }
                return;
            }
            if (response) {
                response.render('contact/contacts', {object: 'contacts', result: result});
            }
        }
    });
}

/**
 * <em>Summary</em> <p>Query contacts with page navigate viewing</p>
 * @param model <p>Contact model schema</p>
 * @param request <p>Query criterion or filter condition</p>
 * @param response <p>Client's feedback</p>
 *
 * @public
 */
function queryByPaginate(model, request, response) {
    model.paginate({}, request.query, (error, result) => {
        if (error) {
            logger.error(error);
            response.writeHead(500, {'Content-Type': 'text/plain'});
            response.end('Internal server error');
        } else {
            logger.info(`Page count is ${result.pages} & item count is ${result.total}`);
            response.render("contact/contacts", {object: 'contacts', result: result});
        }
    });
}

exports = module.exports = {
    remove, update, create, list, findByNumber, queryByFilter, queryByPaginate
};