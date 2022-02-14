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
          const caption = (await computerVisionClient.describeImage(imageURL)).captions[0];
          const imageDescription = `This may be ${caption.text} (${caption.confidence.toFixed(2)} confidence)`;
        
          // Detect Faces: Detects faces and returns the gender, age, location of face (bounding box)
          let detectFaces = [];
          const faces = (await computerVisionClient.analyzeImage(imageURL, { visualFeatures: ['Faces'] })).faces;
          // Get the bounding box, gender, and age from the faces
          if (faces.length) {
            detectFaces.push({found: `${faces.length} face${faces.length == 1 ? '' : 's'} found: `});
            for (const face of faces) {
              let faceFound = {
                gender: `${face.gender}`, 
                age: `${face.age}`, 
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

          // DETECT OBJECTS: Detects objects within an image. Provides confidence score, bounding box location, object size. 
          let detectObjects = [];
          const objects = (await computerVisionClient.analyzeImage(imageURL, { visualFeatures: ['Objects'] })).objects;
          if (objects.length) {
            detectObjects.push({found: `${objects.length} object${objects.length == 1 ? '' : 's'} found: `});
            for (const obj of objects) { 
              detectObjects.push({object: `${obj.object}`, confidence: `${obj.confidence.toFixed(2)}`, boundingBox: `${formatRectObjects(obj.rectangle)}`}); 
            }
          } else { console.log('No objects found.'); }
          // Formats the bounding box
          function formatRectObjects(rect) {
            return `top=${rect.y}`.padEnd(10) + `left=${rect.x}`.padEnd(10) + `bottom=${rect.y + rect.h}`.padEnd(12)
              + `right=${rect.x + rect.w}`.padEnd(10) + `(${rect.w}x${rect.h})`;
          }

          const analysisResults = {
            image_description: imageDescription,
            detected_faces: detectFaces,
            detected_objects: detectObjects
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