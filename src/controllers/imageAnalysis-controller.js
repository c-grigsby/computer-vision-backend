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

  function imageAnalysis() {
    async.series([
      async function () {
        try {
          // Describe Image: Describes what the main objects or themes are in an image sent via URL
          const describeURL = imageURL;
          const caption = (await computerVisionClient.describeImage(describeURL)).captions[0];
          const imageDescription = `This may be ${caption.text} (${caption.confidence.toFixed(2)} confidence)`;
        
          // Detect Faces: Detects faces and returns the gender, age, location of face (bounding box)
          let detectFaces = [];
          const facesImageURL = imageURL;
          const faces = (await computerVisionClient.analyzeImage(facesImageURL, { visualFeatures: ['Faces'] })).faces;

          // Get the bounding box, gender, and age from the faces
          if (faces.length) {
            detectFaces.push(`${faces.length} face${faces.length == 1 ? '' : 's'} found:`);
            for (const face of faces) {
              let faceFound = {
                gender: `${face.gender}`, 
                age: `${face.age}`, 
                emotion: `${face.emotion}`,
                boundingBox: `${formatRectFaces(face.faceRectangle)}`,
              }
              detectFaces.push(faceFound);
            }
          } 
          else { detectFaces.push('No faces found.'); }

          // Formats the bounding box
          function formatRectFaces(rect) {
            return `top=${rect.top}`.padEnd(10) + `left=${rect.left}`.padEnd(10) + `bottom=${rect.top + rect.height}`.padEnd(12)
            + `right=${rect.left + rect.width}`.padEnd(10) + `(${rect.width}x${rect.height})`;
          }

          const analysisResults = {
            image_description: imageDescription,
            detected_faces: detectFaces
          }
          JSON.stringify(analysisResults);

          res.status(200).json({
            success: true,
            imageURL: imageURL,
            data: analysisResults ,
          });
          return;
        } catch (err) {
          res.status(500).json({
            success: false,
            error: err,
          });
        }
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