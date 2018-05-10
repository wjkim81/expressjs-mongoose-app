const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../middlewares/authenticate');
const multer = require('multer');
const cors = require('./cors');

const fs = require('fs');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //console.log(__dirname);
    var imageDir = path.join(__dirname, '../public/images/patients', String(req.user._id));
    if (!fs.existsSync(imageDir)){
      fs.mkdirSync(imageDir);
    }
    console.log(imageDir);
    //console.log(req.user._id);
    cb(null, 'public/images/patients/' + req.user._id);
  },

  filename: (req, file, cb) => {
    //cb(null, file.originalname)
    var filename = file.originalname;
    var fileExtension = filename.split(".")[1];
    cb(null, Date.now() + "." + fileExtension);
  }
});

const imageFileFilter = (req, file, cb) => {
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/)) {
    return cb(new Error('You can upload only image files!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
upload.single('imageFile'), (req, res) => {
  console.log('Image is being uploaded');

  console.log(req.file);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(req.file);
})
.put(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;