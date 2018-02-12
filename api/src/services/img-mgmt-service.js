const fs = require('fs-extra');
const moment = require('moment');

const Image = require('../sequelize/models').Image;
const Site = require('../sequelize/models').Site;
const SearchTerm = require('../sequelize/models').SearchTerm;
const Op = require('sequelize').Op;
const util = require('../util');

let formatImage = function(image) {
  return {
    identifier: image.identifier,
    status: image.status,
    thumbnail: 'thumbnails/' + image.filename,
    filename: image.filename,
    externalUrl: image.Site.domain + '/posts/' + image.identifier,
    tags: image.tags.split(' ').splice(0, 3),
    characters: image.characters && image.characters.trim() ? image.characters.split(' ').splice(0, 3) : [],
    copyrights: image.copyrights && image.copyrights.trim() ? image.copyrights.split(' ').splice(0, 3) : [],
    artists: image.artists && image.artists.trim() ? image.artists.split(' ').splice(0, 3) : [],
    starred: image.starred,
    uploadedAt: moment(image.uploadedAt)
  }
}

let formatSearchTerm = function(term) {
  return {
    name: term.name,
    sites: term.sites.split(','),
    status: term.status,
    safeOnly: term.safeOnly,
    toExclude: term.toExclude,
    lastDownloadedId: term.lastDownloadedId
  };
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
        return formatSearchTerm(term);
      });
    });
  },

  getSearchTermsByCriteria: function(options) {
    let whereCond = {};
    if (options.activeOnly) {
      whereCond.status = 'ACTIVE';
    }
    if (options.toExclude) {
      whereCond.toExclude = true;
    }

    return SearchTerm.findAll({
      where: whereCond
    })
    .then(terms => {
      return terms.map(term => {
        return formatSearchTerm(term);
      });
    });
  },

  findImagesForDisplay: function(options) {
    let tag = options.tag || "";
    let page = options.page || 1;
    let numPerPage = options.numPerPage || 30;
    let starredOnly = options.starredOnly || false;

    let searchTag = '%' + tag.replace(' ', '%') + '%';
    let offset = (page-1)*numPerPage;
    let whereCond = {
      status: 'DOWNLOADED',
      [Op.or]: {
        tags: {
          [Op.like]: searchTag
        },
        characters: {
          [Op.like]: searchTag
        },
        copyrights: {
          [Op.like]: searchTag
        },
        artists: {
          [Op.like]: searchTag
        }
      }
    }
    if (starredOnly) {
      whereCond.starred = true;
    }

    return Image.findAll({
      where: whereCond,
      offset: offset,
      limit: numPerPage,
      order: [
        ['identifier', 'DESC']
      ],
      include: [{
        model: Site
      }]
    })
    .then(images => {
      return images.map(image => formatImage(image))
    })
    .then(displayImages => {
      return Image.count({
        where: whereCond
      }).then(c => { return {total: c, images: displayImages}})
    })
  },

  getImageListForZip: function(identifiers) {
    let whereCond = {
      identifier: {
        [Op.in]: identifiers
      }
    }
    return Image.findAll({
      where: whereCond
    })
    //.then(images => images.map(image => formatImage(image)))
    .then(images => {
      return images.map(image => ({
        identifier: image.identifier,
        filename: image.filename,
        fullPath: util.getOutputFolderPath() + '/' + image.filename
      }))
    })
    .then(files => ({files}))
  },

  starImage: function(identifier, starred) {
    return Image.findOne({
      where: {
        identifier: identifier
      }
    })
    .then(image => {
      return Image.update(
        { starred: starred },
        { where: {
            identifier: identifier
          }
        }
      ).then(affectedRows => image);
    })
    .then(() => {
      return {identifier: identifier, starred, status: 'OK'}
    });
  },

  deleteImage: function(identifier) {
    return Image.findOne({
      where: {
        identifier: identifier
      }
    })
    .then(image => {
      return Image.update(
        { status: 'DELETED' },
        { where: {
            identifier: identifier
          }
        }
      ).then(affectedRows => image);
    })
    /*
    .then(image => {
      let fullImagePath = util.getOutputFolderPath() + '/' + image.filename;
      let fullThumbnailPath = util.getThumbnailFolderPath() + '/' + image.filename;
      return
        fs.unlink(fullImagePath)
        .then(() => fs.unlink(fullThumbnailPath))
        .catch(err => console.log("Error deleting file on disk!", err));
    })*/
    .then(() => {
      return {identifier: identifier, status: 'OK'}
    });
  }
}
