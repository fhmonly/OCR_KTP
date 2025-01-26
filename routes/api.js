const express = require('express');
const router = express.Router();
const ocr = require('../controller/api/ocr')

router.post('/ocr', ocr.getDataFromKTPWithOCR);

module.exports = router;