const SchoolController = require('../controllers/SchoolController');
const express = require('express');

const router = express.Router();

router.post('/register', SchoolController.Register);
router.post('/retrieve', SchoolController.Retrieve);
router.post('/commonstudents', SchoolController.CommonStudents);
router.post('/suspend', SchoolController.Suspend);
router.post('/retrievefornotifications', SchoolController.RetrieveForNotifications);

module.exports = router;
