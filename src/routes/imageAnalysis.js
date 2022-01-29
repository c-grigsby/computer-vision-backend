//@packages
const express = require('express');
//@scripts
const {getImageAnalysis} = require('../controllers/imageAnalysis-controller.js')

const router = express.Router();

router.route('/').get(getImageAnalysis);

module.exports = router;



