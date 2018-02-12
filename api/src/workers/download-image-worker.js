const fs = require('fs-extra');
const request = require('request-promise');
const moment = require('moment');

const Image = require('../sequelize/models').Image;
const Op = require('sequelize').Op;

const util = require('../util');
const logging = require('../util/logging');

const logger = logging.getLogger('image-dl', 'imagedl');

let downloadImageWithResult = function(imgDl) {
  let millis = Math.random()*1000;
  return myMSleep(millis)
    .then((_) => {
      logger.info('Downloading ' + imgDl.identifier + '...');
      return util.downloadImage(imgDl.url, imgDl.filename);
    })
    .then((result) => {
      if (!result) {
        throw 'Failed';
      }
      logger.info(imgDl.identifier + ' done!');
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
    logger.info("Downloading " + imgs.length + " images.")
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
    logger.info("Image download done.");
    done({identifiers: identifiers});
  })
  .catch(err => {
    logger.warn("Error downloading images!", err);
    done({error: err})
  })


}
