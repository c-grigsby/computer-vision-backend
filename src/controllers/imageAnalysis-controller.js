// @packages
const async = require('async');
const ComputerVisionClient =
  require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
// @scripts
const asyncHandler = require('../middleware/async');

// @desc    Get Image Analysis from Azure Read
// @route   GET /api/v1/ocr
// @access  Public
exports.getImageAnalysis = asyncHandler(async(req, res, next)=> {
  const imageURL = req.query.imageURL;
  let analysisResults = ["Hello from Image Analysis"];

  function imageAnalysis() {

    res.status(200).json({
      success: true,
      data: { analysis: analysisResults },
    });
  }
  imageAnalysis()
});