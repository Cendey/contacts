let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function (request, response, next) {
    response.render('index', {title: 'Express'});
});

module.exports = router;
