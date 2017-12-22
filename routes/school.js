var express = require('express');
var router = express.Router();
var SchoolController = require('../controllers/SchoolController')

router.post('/register', SchoolController.Register);
router.post('/retrieve', SchoolController.Retrieve);
router.post('/commonstudents', SchoolController.CommonStudents);
router.post('/suspend', SchoolController.Suspend);
router.post('/retrievefornotifications', SchoolController.RetrieveForNotifications);

module.exports = router;