// @packages
const async = require('async');
const ComputerVisionClient =
  require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
// @scripts
const asyncHandler = require('../middleware/async');

// @desc    Get Image Analysis from Azure Read via image URL
// @route   GET /api/v1/ocr
// @access  Public
exports.getImageAnalysis = asyncHandler(async(req, res, next)=> {
  const imageURL = req.query.imageURL;
  const key = process.env.AZURE_KEY;
  const endpoint = process.env.AZURE_ENDPOINT;
  const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({
      inHeader: { 'Ocp-Apim-Subscription-Key': key },
    }),
    endpoint
  );
  let imageDescription = [];

  function imageAnalysis() {
    async.series([
      async function () {
        // Describe Image: Describes what the main objects or themes are in an URL img 
        const describeURL = imageURL;
        const caption = (await computerVisionClient.describeImage(describeURL)).captions[0];

        imageDescription.push(`This may be ${caption.text} (${caption.confidence.toFixed(2)} confidence)`);

        const analysisResults = {
          image_description: imageDescription
        }
        JSON.stringify(analysisResults);

        res.status(200).json({
          success: true,
          imageURL: imageURL,
          data: analysisResults ,
        });
        return;
      },
      function () {
        return new Promise((resolve) => {
          resolve();
        })
      }
    ], (err) => {
      throw (err);
    });
  }
  imageAnalysis();
});