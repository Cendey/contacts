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
const initiate = require('./../../../../utils/initiate');

const logger = initiate.factory('logger', 'standard');

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

function create(model, requestBody, response) {
    let contact = toContact(requestBody, model);
    let primaryNumber = requestBody.primarycontactnumber;
    contact.save(function (error) {
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
                function (error, data) {
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
                            contact.save(function (error) {
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
                            data.save(function (error) {
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

function findByNumber(model, primaryNumber, response) {
    model.findOne({primarycontactnumber: primaryNumber},
        function (error, result) {
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

function list(model, response) {
    model.find({}, function (error, result) {
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

function queryByFilter(model, params, response) {
    model.find(buildFilter(params), function (error, result) {
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
        }
    });
}

function queryByPaginate(model, request, response) {
    model.paginate({}, request.query, function (error, result) {
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

module.exports = {
    remove, update, create, list, findByNumber, queryByFilter, queryByPaginate
};