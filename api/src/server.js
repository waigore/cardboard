const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 5001;

const imgDlService = require('./services/img-dl-service');
const imgMgmtService = require('./services/img-mgmt-service');
const util = require('./util');
const zip = require('./util/zip');

app.use(bodyParser());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(util.getOutputFolderPath()));
app.use('/thumbnails', express.static(util.getThumbnailFolderPath()));

app.get('/api/terms/all', (req, res) => {
  imgMgmtService.getAllSearchTerms()
  .then(terms => res.status(200).send({terms: terms}))
  .catch(error => {console.log(error); res.status(500).send(error)});
})

app.post('/api/terms/create', (req, res) => {
  imgMgmtService.createSearchTerm(req.body)
  .then(term => res.status(200).send({status: 'OK', term}))
  .catch(error => {console.log(error); res.status(500).send(error)});
})

app.post('/api/images/byCriteria', (req, res) => {
  imgMgmtService.findImagesForDisplay(req.body)
  .then(result => res.status(200).send(result))
  .catch(error => {console.log(error); res.status(500).send(error)});
});

app.post('/api/images/delete', (req, res) => {
  imgMgmtService.deleteImage(req.body.identifier)
  .then(result => res.status(200).send(result))
  .catch(error => {console.log(error); res.status(500).send(error)});
});

app.post('/api/images/star', (req, res) => {
  imgMgmtService.starImage(req.body.identifier, req.body.starred)
  .then(result => res.status(200).send(result))
  .catch(error => {console.log(error); res.status(500).send(error)});
});

app.post('/api/images/zip', (req, res) => {
  imgMgmtService.getImageListForZip(req.body.identifiers)
  .then(result => {
    let filename = 'files_' + moment().format("YYYYMMDD-HHmmss") + '.zip';
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-disposition': 'attachment; filename=' + filename
    });

    zip.writeZipFile(result.files, res);
  })
  .catch(error => {console.log(error); res.status(500).send(error)});
})

app.get('/api/imagedl/find', (req, res) => {
  imgDlService.queueAllTags()
  .then(result => res.status(200).send({status: result.status}))
  .catch(error => {console.log(error); res.status(500).send(error)});
});

app.post('/api/imagedl/findByCriteria', (req, res) => {
  Promise.resolve()
  .then(() => imgDlService.queueByRawTag(req.body))
  .then(result => res.status(200).send(result))
  .catch(error => {console.log(error); res.status(500).send(error)});
})

app.get('/api/imagedl/download', (req, res) => {
  imgDlService.startImageDownload()
  .then(identifiers => res.status(200).send({identifiers: identifiers}))
  .catch(error => {console.log(error); res.status(500).send(error)});
});

const server = http.createServer(app);

server.listen(port, () => console.log(`Listening on port ${port}`));
