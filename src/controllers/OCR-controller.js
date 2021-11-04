// @packages
const async = require('async');
const ComputerVisionClient =
  require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
// @scripts
const asyncHandler = require('../middleware/async');

// @desc    Get OCR analysis from Azure Read
// @route   GET /api/v1/ocr
// @access  Public
exports.getOCR = asyncHandler(async (req, res, next) => {
  const imageURL = req.query.imageURL;
  const key = process.env.AZURE_KEY;
  const endpoint = process.env.AZURE_ENDPOINT;
  const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({
      inHeader: { 'Ocp-Apim-Subscription-Key': key },
    }),
    endpoint
  );
  let analysisResults = [];

  function computerVision() {
    async.series([
      async function () {
        const STATUS_SUCCEEDED = 'succeeded';
        const STATUS_FAILED = 'failed';
        const uploadedFileURL = imageURL;

        try {
          // Grab operation location (ID) from response
          const operationLocationUrl = await computerVisionClient
            .read(uploadedFileURL)
            .then((response) => {
              return response.operationLocation;
            });
          const operationIdUrl = operationLocationUrl.substring(
            operationLocationUrl.lastIndexOf('/') + 1
          );

          // Wait for the read operation to finish, use operationId to get result
          let waitingOnAPI = true;
          while (waitingOnAPI) {
            const readOpResult = await computerVisionClient
              .getReadResult(operationIdUrl)
              .then((result) => {
                return result;
              });

            if (readOpResult.status === STATUS_FAILED) {
              analysisResults.push('The Read File operation has failed.');
              waitingOnAPI = false;

              res.status(500).json({
                success: false,
                data: { analysis: analysisResults },
              });
              return;
            }

            if (readOpResult.status === STATUS_SUCCEEDED) {
              analysisResults.push('The Read File operation was a success.');
              analysisResults.push('Read File URL image result:');

              // Return text captured from analysis
              for (const textRecResult of readOpResult.analyzeResult
                .readResults) {
                for (const line of textRecResult.lines) {
                  analysisResults.push(line.text);
                }
              }
              if (analysisResults.length < 3) {
                analysisResults.push('No Text Discovered in Analysis');
              }
              waitingOnAPI = false;

              res.status(200).json({
                success: true,
                data: { analysis: analysisResults },
              });
              return;
            }
            await new Promise((r) => setTimeout(r, 500));
          }
        } catch (err) {
          res.status(500).json({
            success: false,
            error: err,
          });
        }
      },
    ]);
  }
  computerVision();
});
