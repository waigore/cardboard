const fs = require('fs-extra');
const moment = require('moment');
const sharp = require('sharp');
const request = require('request-promise');

const config = require('../config');
const logging = require('./logging');

const logger = logging.getRootLogger('util');

module.exports = {
  getOutputFolderPath: function() {
    let path = config.outputPath;
    return path;
  },

  getThumbnailFolderPath: function() {
    let path = this.getOutputFolderPath();
    return path + '/thumbnails';
  },

  genThumbnail: function(imgFilename, outFilename) {
    return sharp(imgFilename)
      .resize(318, 180)
      .crop(sharp.strategy.attention)
      .toFile(outFilename)
      .then(() => true)
      .catch(err => {
        logger.warn('Error generating thumbnail for image ' + imgFilename + '! ' + err);
        return false;
      });
  },

  downloadImage: function(url, filename) {
    return request(url, {encoding: null})
      .then((body) => {
        return fs.writeFile(filename, body, "binary");
      })
      .then(() => true)
      .catch(err => {
        logger.warn("Error downloading image! " + err);
        return false;
      });
  },

  noop: function() {
    return Promise.resolve();
  }
}
