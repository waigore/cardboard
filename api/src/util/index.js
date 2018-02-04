const fs = require('fs-extra');
const moment = require('moment');
const sharp = require('sharp');
const request = require('request-promise');

module.exports = {
  getOutputFolderPath: function() {
    let path = 'D:/Cardboard';
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
      .toFile(outFilename);
  },

  downloadImage: function(url, filename) {
    return request(url, {encoding: null})
      .then((body) => {
        return fs.writeFile(filename, body, "binary");
      })
      .then(() => console.log('Done downloading ' + filename + '!'))
      .catch(err => {
        console.log("Error! " + err);
        throw err;
      });
  },

  noop: function() {
    return Promise.resolve();
  }
}
