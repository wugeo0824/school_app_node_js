var express = require('express');
var router = express.Router();
var SchoolController = require('../controllers/SchoolController')

router.post('/register', SchoolController.Register);
router.get('/retrieve', SchoolController.Retrieve);

module.exports = router;
