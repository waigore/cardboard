const fs = require('fs-extra');
const request = require('request-promise');
const moment = require('moment');

const Image = require('../sequelize/models').Image;
const Op = require('sequelize').Op;

const util = require('../util');

let downloadImage = function(url, filename) {
  return request(url, {encoding: null})
    .then((body) => {
      return fs.writeFile(filename, body, "binary");
    })
    .then(() => console.log('Done downloading ' + filename + '!'))
    .catch(err => {
      console.log("Error! " + err);
      throw err;
    });
}

let downloadImageWithResult = function(imgDl) {
  let millis = Math.random()*1000;
  return myMSleep(millis)
    .then((_) => {
      console.log('slept ' + millis + 'ms, downloading ' + imgDl.identifier);
      return downloadImage(imgDl.url, imgDl.filename);
    })
    .then(() => {
      return Image.update(
        {status: 'DOWNLOADED', downloadedAt: moment()},
        { where: {
            identifier: imgDl.identifier
          }
        }
      )
    })
    .catch(err => {
      return Image.update(
        {status: 'ERROR'},
        { where: {
            identifier: imgDl.identifier
          }
        }
      )
    });
}

let myMSleep = function(millis) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve(millis);
    }, millis);
  })
}

module.exports = function(input, done, progress) {
  let identifiers = input.identifiers;

  Image.update(
    { status: 'DOWNLOADING' },
    {
      where: {
        identifier: {
          [Op.in]: identifiers
        }
      }
    }
  )
  .then(affectedRows => {
    return Image.findAll({
      where: {
        identifier: {
          [Op.in]: identifiers
        }
      }
    })
  })
  .then(imgs => {
    return imgs.map(img => {
      let url = `https://danbooru.donmai.us${img.fileUrl}`;
      let outputPath = util.getOutputFolderPath();
      let filename = `${outputPath}/${img.filename}`;
      return {
        identifier: img.identifier,
        url: url,
        filename: filename
      }
    })
  })
  .then(imgDls => {
    return imgDls.reduce((promise, imgdl) => {
      return promise.then(result => downloadImageWithResult(imgdl));
    }, Promise.resolve());
  })
  .then(() => {
    console.log("download-image-worker DONE!!");
    done({identifiers: identifiers});
  })
  .catch(err => {
    console.log("Error!" + err);
    done({error: err})
  })


}
