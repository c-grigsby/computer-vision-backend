// @packages
const express = require('express');
// @scripts
const { getOCR } = require('../controllers/OCR-controller.js');

const router = express.Router();

router.route('/').get(getOCR);

module.exports = router;
