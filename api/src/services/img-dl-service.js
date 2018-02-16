const Image = require('../sequelize/models').Image;
const SearchTerm = require('../sequelize/models').SearchTerm;
const Op = require('sequelize').Op;
const NoImagesFoundError = require('../exceptions').NoImagesFoundError;

const threads = require('threads');
const Pool = threads.Pool;
const config  = threads.config;
const spawn   = threads.spawn;

const imgMgmtService = require('./img-mgmt-service');
const logging = require('../util/logging');

const logger = logging.getRootLogger('imagedlservice');

const IMG_LIMIT = 50;

// Set base paths to thread scripts
config.set({
  basepath : {
    node : __dirname + '/../workers'
  }
});

const pool = new Pool(4);

let getSearchTermIdRange = function(term) {
  logger.info("Term last downloaded: " + term.lastDownloadedId);
  return Image.max('identifier', {
    where: {
      tags: {
        [Op.like]: '%' + term.name + '%'
      }
    }
  })
  .then(mxIdentifier => term.lastDownloadedId == null ? mxIdentifier : term.lastDownloadedId)
  .then(mx => {
    logger.info("Found max id:" + mx);
    if (!mx) return { term, min: 0, max: 0 }
    else return { term, min: parseInt(mx, 10), max: parseInt(mx, 10)+IMG_LIMIT }
  })
}

let formatTermToTag = function(searchTerm) {
  return searchTerm.toExclude ? `~${searchTerm.name}` : searchTerm.name;
}

module.exports = {
  queueAllTags: function() {
    return imgMgmtService.getAllSearchTerms()
    .then(terms => {
      let queuedTerms = [];
      terms.forEach(term => {
        let tag = term.name;
        Promise.resolve(
          getSearchTermIdRange(term)
          .then(range => {
            term.sites.forEach(site => {
              logger.info("Pushing site:" + site + " tag: " + tag + " range: " + range);
              queuedTerms.push(this.queueByRawTag({site: site, tag: tag, range: range, limit: IMG_LIMIT}));
            })
          })
        );
      })
      return queuedTerms;
      /*
      return terms.map(term => {
        logger.info('Mapping', term.name);
        let tag = formatTermToTag(term);
        return getSearchTermIdRange(term)
            .then(range => {
              logger.info('Queuing', tag, 'to find images');
              return this.queueByRawTag(term.sites[0], tag, range, IMG_LIMIT);
            });
      })*/
    })
    .then(queuedTerms => {
      return queuedTerms.reduce((promise, queuedTerm) => {
        return promise.then(() => Promise.resolve(queuedTerm))
      }, Promise.resolve());
    })
    .then(() => {
      return {status: "OK"}
    })
  },

  queueByRawTag: function(options) {
    let site = options.site || 'danbooru';
    let tag = options.tag;
    let range = options.range || Promise.resolve(getSearchTermIdRange(tag));
    let limit = options.limit || 200;

    if (!tag) {
      return {'status': 'error', 'error': 'No tag specified!'}
    }

    let job = pool.run('find-image-worker.js')
      .send({site: site, tag: tag, range: range, limit: limit});
    job.on('done', result => {
      if (result.error) {
        logger.warn('Error finding images!' + result);
      }
      return result;
    });
    job.on('error', err => {
      logger.warn('Find-image-worker error! tag: ' + tag + ' error: ' + err);
    })
    logger.info("queued, returning " + tag);
    return {'status': 'OK', tag: tag };
  },

  startImageDownload: function() {
    return Image.findAll({
      where: {
        status: 'INITIAL'
      }
    })
    .then(images => {
      if (images.length == 0) throw new NoImagesFoundError();
      let imgIdentifiers = images.map(image => image.identifier);

      let job1 = pool.run('download-image-worker.js')
        .send({identifiers: imgIdentifiers.splice(imgIdentifiers.length/2)});

      let job2 = pool.run('download-image-worker.js')
        .send({identifiers: imgIdentifiers});

      return imgIdentifiers;
    })
    .then(imgIdentifiers => {
      return {status: 'OK', identifiers: imgIdentifiers}
    })
    .catch(NoImagesFoundError, (e) => {
      return {status: 'OK', identifiers: []}
    })
  },

  findNewImages: function() {
    getAllSearchTerms()
    .then(terms => {
      return terms.map(term => {
        let tag = formatTermToTag(term);
        this.queueByTag(tag);
        return tag;
      })
    })
  }
}
