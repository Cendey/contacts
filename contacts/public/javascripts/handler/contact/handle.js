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
let log4js = require('log4js');
let mongoose = require('mongoose');
let meta = require('./../../config/ssh/config');
let Schema = mongoose.Schema;

let logger = initLog();
logger.setLevel('TRACE');

function initLog() {
    log4js.loadAppender('file');
    log4js.addAppender(log4js.appenders.file('logs/std.log'), 'standard');
    return log4js.getLogger('standard');
}

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

exports.initConnection = function () {
    let connectionInfo = meta.mongodbConnectionInfo();
    mongoose.connect(connectionInfo.url);
    let instance = mongoose.connection;
    instance.on('error', logger.error.bind(logger, 'connection error:'));
    instance.once('open', function () {
        logger.info('Connect to database: ' + connectionInfo.provider);
    });
};

exports.initSchema = function (name) {
    let contactSchema = new Schema(meta.contactSchema());
    return mongoose.model(name, contactSchema);
};

exports.remove = function (model, primaryNumber, response) {
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
};

exports.update = function (model, requestBody, response) {
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
};

exports.create = function (model, requestBody, response) {
    let contact = toContact(requestBody, model);
    let primaryNumber = requestBody.primarycontactnumber;
    contact.save(function (error) {
        if (!error) {
            contact.save();
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
                            populateContact();
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
};

exports.findByNumber = function (model, primaryNumber, response) {
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
};

exports.list = function (model, response) {
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
};

exports.queryByFilter = function (model, params, response) {
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
};