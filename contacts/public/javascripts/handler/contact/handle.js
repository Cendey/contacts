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
let mongoose = require("mongoose");
let meta = require("./../../config/ssh/config");
let Schema = mongoose.Schema;

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

function populateContact(data, contact) {
    data.firstname = contact.firstname;
    data.lastname = contact.lastname;
    data.title = contact.title;
    data.company = contact.company;
    data.jobtitle = contact.jobtitle;
    data.primarycontactnumber = contact.primarycontactnumber;
    data.othercontactnumbers = contact.othercontactnumbers;
    data.primaryemailaddress = contact.primaryemailaddress;
    data.otheremailaddress = contact.otheremailaddress;
    data.groups = contact.groups;
}

exports.initConnection = function () {
    let connectionInfo = meta.mongodbConnectionInfo();
    mongoose.connect(connectionInfo.url);
    let instance = mongoose.connection;
    instance.on('error', console.error.bind(console, 'connection error:'));
    instance.once('open', function () {
        console.log('Connect to database: ' + connectionInfo.provider);
    });
};

exports.initSchema = function (name) {
    let contactSchema = new Schema(meta.contactSchema());
    return mongoose.model(name, contactSchema);
};

exports.remove = function (model, primaryNumber, response) {
    console.log('Deleting contact with primary number: ' + primaryNumber);
    model.findOne({primarycontactnumber: primaryNumber},
        function (error, data) {
            if (error) {
                console.log(error);
                if (response) {
                    response.writeHead(500, {'Content-Type': 'text/plain'});
                    response.end('Internal server error');
                }
            } else {
                if (!data) {
                    console.log('not found');
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
                            console.log(error);
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
                console.log(error);
                if (response) {
                    response.writeHead(500, {'Content-Type': 'text/plain'});
                    response.end('Internal server error');
                }
            } else {
                let contact = toContact(requestBody, model);
                if (!data) {
                    console.log('Contact with primary number: ' + primaryNumber
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
                        console.log('Successfully updated contact with primary number: ' + primaryNumber);
                        data.save();
                    } else {
                        console.log('error on save');
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
            console.log('Checking if contact saving failed due to already existing primary number:' + primaryNumber);
            model.findOne({primarycontactnumber: primaryNumber},
                function (error, data) {
                    populateContact(data, contact);
                    if (error) {
                        console.log(error);
                        if (response) {
                            response.writeHead(500, {'Content-Type': 'text/plain'});
                            response.end('Internal server error');
                        }
                    } else {
                        let contact = toContact(requestBody, model);
                        if (!data) {
                            console.log('The contact does not exist. It will be created');
                            contact.save(function (error) {
                                if (!error) {
                                    contact.save();
                                } else {
                                    console.log(error);
                                }
                            });
                            if (response) {
                                response.writeHead(201, {'Content-Type': 'text/plain'});
                                response.end('Created');
                            }
                        } else {
                            console.log('Updating contact with primary contact number:' + primaryNumber);
                            populateContact();
                            data.save(function (error) {
                                if (!error) {
                                    data.save();
                                    response.end('Updated');
                                    console.log('Successfully Updated contact with primary contact number: ' + primaryNumber);
                                } else {
                                    console.log('Error while saving contact with primary contact number:' + primaryNumber);
                                    console.log(error);
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
                console.error(error);
                response.writeHead(500,{'Content-Type': 'text/plain'});
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
                console.log(result);
            }
        }
    );
};

exports.list = function (model, response) {
    model.find({}, function (error, result) {
        if (error) {
            console.error(error);
            return null;
        }
        if (response) {
            response.setHeader('content-type', 'application/json');
            response.end(JSON.stringify(result));
        }
        return JSON.stringify(result);
    });
};

exports.queryBySingleKey = function (model, key, value, response) {
    //build a JSON string with the attribute and the value
    let filterArg = '{\"' + key + '\":' + '\"' + value + '\"}';
    let filter = JSON.parse(filterArg);
    model.find(filter, function (error, result) {
        if (error) {
            console.error(error);
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