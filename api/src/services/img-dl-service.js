const Image = require('../sequelize/models').Image;
const SearchTerm = require('../sequelize/models').SearchTerm;
const Op = require('sequelize').Op;

const threads = require('threads');
const Pool = threads.Pool;
const config  = threads.config;
const spawn   = threads.spawn;

const IMG_LIMIT = 30;

// Set base paths to thread scripts
config.set({
  basepath : {
    node : __dirname + '/../workers'
  }
});

const pool = new Pool(4);

let getAllSearchTerms = function() {
  return SearchTerm.findAll({
    where: {
      status: 'ACTIVE'
    }
  });
}

let getSearchTermIdRange = function(term) {
  return Image.max('identifier', {
    where: {
      tags: {
        [Op.like]: '%' + term.name + '%'
      }
    }
  })
  .then(mx => {
    console.log("Found max id:" + mx);
    if (!mx) return { term, min: 0, max: 0 }
    else return { term, min: parseInt(mx, 10), max: parseInt(mx, 10)+IMG_LIMIT }
  })
}

let formatTermToTag = function(searchTerm) {
  return searchTerm.toExclude ? `~${searchTerm.name}` : searchTerm.name;
}

module.exports = {
  queueAllTags: function() {
    return getAllSearchTerms()

    .then(terms => {
      return terms.map(term => {
        console.log('Mapping', term.name);
        let tag = formatTermToTag(term);
        return getSearchTermIdRange(term)
            .then(range => {
              let realTag = tag;
              if (range.min != 0 && range.max != 0) {
                realTag = realTag + ` id:${range.min}..${range.max}`;
              }
              console.log('Queuing', realTag, 'to find images');
              return this.queueByRawTag(realTag, IMG_LIMIT);
            });
      })
    })
    .then(queuedTerms => {
      //let p = Promise.all(queuedTerms);
      //return p;
      return queuedTerms.reduce((promise, queuedTerm) => {
        return promise.then(() => queuedTerm.resolve())
      }, Promise.resolve());
    })

  },

  queueByRawTag: function(tag, limit) {
    let job = pool.run('find-image-worker.js')
      .send({tag: tag, limit: limit});
    job.on('done', result => {
      if (result.error) {
        console.log('Error finding images!', result);
        return result;
      }
      /*
      let arr1 = result.identifiers.splice(result.identifiers.length/2);
      let dlJob1 = pool.run('download-image-worker.js')
        .send({identifiers: arr1});
      let dlJob2 = pool.run('download-image-worker.js')
        .send({identifiers: result.identifiers});
      */
      let dlJob = pool.run('download-image-worker.js')
        .send({identifiers: result.identifiers});
    });
    console.log("queued, returning " + tag);
    return tag;
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
