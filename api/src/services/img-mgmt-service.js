const moment = require('moment')

const Image = require('../sequelize/models').Image;
const SearchTerm = require('../sequelize/models').SearchTerm;
const Op = require('sequelize').Op;

let formatImage = function(image) {
  return {
    identifier: image.identifier,
    status: image.status,
    thumbnail: 'http://localhost:5001/thumbnails/' + image.filename,
    url: 'http://localhost:5001/' + image.filename,
    tags: image.tags.split(' ').splice(0, 3),
    characters: image.characters.split(' '),
    copyrights: image.copyrights.split(' '),
    uploadedAt: moment(image.uploadedAt)
  }
}

module.exports = {
  getAllSearchTerms: function() {
    return SearchTerm.findAll({
      where: {
        status: 'ACTIVE'
      }
    })
    .then(terms => {
      return terms.map(term => {
        return {
          name: term.name,
          status: term.status,
          safeOnly: term.safeOnly,
          toExclude: term.toExclude
        }
      });
    });
  },

  findImagesForDisplay: function(tag, page, numPerPage=30) {
    let offset = (page-1)*numPerPage;
    let whereCond = {
      status: 'DOWNLOADED',
      tags: {
        [Op.like]: '%' + tag + '%'
      }
    }
    return Image.findAll({
      where: whereCond,
      offset: offset,
      limit: numPerPage
    })
    .then(images => {
      return images.map(image => formatImage(image))
    })
    .then(displayImages => {
      return Image.count({
        where: whereCond
      }).then(c => { return {total: c, images: displayImages}})
    })
  }
}
