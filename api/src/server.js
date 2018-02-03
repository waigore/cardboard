const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const app = express();
const port = process.env.PORT || 5001;

const imgDlService = require('./services/img-dl-service');

app.use(bodyParser());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/api/images/find', (req, res) => {
  imgDlService.queueAllTags()
  .then(tags => res.status(200).send({tags: tags}))
  .catch(error => {console.log(error); res.status(500).send(error)});
});

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

const server = http.createServer(app);

server.listen(port, () => console.log(`Listening on port ${port}`));
