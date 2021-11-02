// @desc    Get OCR analysis
// @route   GET /api/v1/ocr
// @access  Public
exports.getOCR = (req, res, next) => {
  const imageURL = req.query.imageURL;
  res.status(200).json({
    success: true,
    data: { analysis: `Returns OCR text results from image at ${imageURL}` },
  });
}