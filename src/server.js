// @packages
const express = require('express');
const dotenv = require('dotenv');
// @routes
const OCR = require('./routes/OCR');
const imageAnalysis = require('./routes/imageAnalysis')
// @env vars
dotenv.config({ path: './config/config.env' });

const app = express();

// mount routers
app.use('/api/v1/ocr', OCR);
app.use('/api/v1/imageAnalysis', imageAnalysis);

app.get('/', (req, res) => {
  res.status(200).json({ success: true, msg: 'Hello from Computer Vision' });
});

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port: ${PORT}`)
);
