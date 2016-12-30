let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function(request, response, next) {
  response.send('respond with a resource');
});

module.exports = router;
