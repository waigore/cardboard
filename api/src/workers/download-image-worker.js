const fs = require('fs-extra');
const request = require('request-promise');
const moment = require('moment');

const Image = require('../sequelize/models').Image;
const Op = require('sequelize').Op;

const util = require('../util');


let downloadImageWithResult = function(imgDl) {
  let millis = Math.random()*1000;
  return myMSleep(millis)
    .then((_) => {
      console.log('slept ' + millis + 'ms, downloading ' + imgDl.identifier);
      return util.downloadImage(imgDl.url, imgDl.filename);
    })
    .then(() => {
      return Image.update(
        {status: 'DOWNLOADED', downloadedAt: moment()},
        { where: {
            identifier: imgDl.identifier
          }
        }
      ).then(() => true)
    })
    .catch(err => {
      return Image.update(
        {status: 'ERROR'},
        { where: {
            identifier: imgDl.identifier
          }
        }
      ).then(() => false)
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
      let thumbnailPath = util.getThumbnailFolderPath();
      let filename = `${outputPath}/${img.filename}`;
      let thumbnail = `${thumbnailPath}/${img.filename}`;
      return {
        identifier: img.identifier,
        url: url,
        filename: filename,
        thumbnail: thumbnail
      }
    })
  })
  .then(imgDls => {
    return imgDls.reduce((promise, imgdl) => {
      return promise.then(result => {
        return downloadImageWithResult(imgdl)
          .then(result => {
            if (result) {
              console.log("Generating thumbnail for " + imgdl.identifier);
              let thumbnail = imgdl.thumbnail;
              let imageFile = imgdl.filename;
              return util.genThumbnail(imageFile, thumbnail);
            }
            else {
              return util.noop();
            }
          })
      });
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
