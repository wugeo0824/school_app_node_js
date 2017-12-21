var router = require('express').Router();

router.use('/api', require('./school'));

module.exports = router;