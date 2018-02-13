const fs = require('fs-extra');
const Danbooru = require('danbooru');

const Image = require('../sequelize/models').Image;
const SearchTerm = require('../sequelize/models').SearchTerm;
const Site = require('../sequelize/models').Site;
const Op = require('sequelize').Op;
const NoBooruPostsFoundError = require('../exceptions').NoBooruPostsFoundError;

const imgMgmtService = require('../services/img-mgmt-service');
const logging = require('../util/logging');

const logger = logging.getLogger('image-search', 'imagesearch');

let getBooruSiteConfig = function(siteName) {
  return Site.findOne({
    where: {
      name: siteName
    }
  })
  .then(site => ({
    name: site.name,
    domain: site.domain,
    apiUser: site.apiUser,
    apiKey: site.apiKey
  }));
}

let findBooruImagesByTag = function(booruSite, tags, limit=200) {
  const booru = new Danbooru(booruSite.apiUser, booruSite.apiKey, { base: booruSite.domain });
  return booru.requestJson('posts', {
    limit: limit,
    tags: tags,
  })
  .catch(err => {
    logger.warn(tags + ": Error finding booru images! error: " + err);
    throw err;
  });
}

let acceptedExt = function(filename) {
  let exts = ['.png', 'jpg', 'jpeg'];
  return exts.some(ext => filename.endsWith(ext));
}

let info = (tag, msg) => logger.info(tag + ": " + msg);
let debug = (tag, msg) => logger.debug(tag + ": " + msg);

module.exports = function(input, done, progress) {
  let site = input.site;
  let tag = input.tag;
  let limit = input.limit;
  let range = input.range;

  let realTag = tag;
  if (range.min != 0 && range.max != 0) {
    realTag = realTag + ` id:${range.min}..${range.max}`;
  }

  info(tag, 'Finding images for tag: ' + realTag + ', limit: ' + limit);

  getBooruSiteConfig(site)
  .then(booruSite =>
      findBooruImagesByTag(booruSite, realTag, limit)
      .then(posts => {
        info(tag, posts.length + ' posts retrieved');
        return posts
          .filter(post => post.md5 && post.file_url && acceptedExt(post.file_url))
          .map(post => {
            return {
              identifier: `${post.id}`,
              md5: post.md5,
              status: 'INITIAL',
              filename: post.file_url.split('/').slice(-1)[0],
              site: booruSite.name,
              fileUrl: post.file_url,
              tags: post.tag_string_general,
              artists: post.tag_string_artist,
              characters: post.tag_string_character,
              copyrights: post.tag_string_copyright,
              starred: false,
              uploadedAt: post.created_at
            }
          });
      })
  )
  .then(posts => {
    info(tag, "Filtering posts by excluded tags");
    return imgMgmtService.getSearchTermsByCriteria({activeOnly: true, toExclude: true})
    .then(searchTerms => {
      return searchTerms.map(searchTerm => searchTerm.name);
    })
    .then(tagsToExclude =>
      {
        return posts.filter(post => {
         tagsToExclude.forEach(t => {
           if (post.tags.includes(t)
               || post.artists.includes(t)
               || post.characters.includes(t)
               || post.copyrights.includes(t))
               return false;
         })
         return true;
       })
      })
    .then(filteredPosts => {
      info(tag, (posts.length - filteredPosts.length) + " posts excluded by tag.");
      return filteredPosts;
    })
  })
  .then(preRecs => {
    return Image.findAll({
      attributes: ['identifier'],
      where: {
        identifier: {
          [Op.in]: preRecs.map(r => r.identifier)
        }
      }
    })
    .then(imgs => imgs.map(i => i.identifier))
    .then(identifiers => preRecs.filter(r => !identifiers.includes(r.identifier)))
  })
  .then(recs => {
    info(tag, "Filtered image list length: "+ recs.length);
    debug(tag, recs.map(rec => parseInt(rec.identifier, 10)));
    let currMax = recs.length > 0 ? Math.max(...recs.map(rec => parseInt(rec.identifier, 10))) : range.max;
    debug(tag, "Currmax=" + currMax);

    return Image.max('identifier')
      .then(mxIdentifier => {
        let mx = parseInt(mxIdentifier, 10);
        return currMax == 0 ? mx : Math.min(mx, currMax);
      })
      .then(mx => {
        info(tag, "Updating lastDownloadedId to " + mx);
        return SearchTerm.update(
          { lastDownloadedId : mx.toString()},
          { where: {
              name: tag
            }
          }
        )
      })
      .then(() => recs).catch(err => { throw err});
  })

  .then(recs => {
    info(tag, "Bulk creating " + recs.length + " recs...");
    return Image.bulkCreate(recs).then(() => recs);
  })
  .then(insertedRecs => {
    info(tag, 'Image search done.')
    done({identifiers: insertedRecs.map(rec => rec.identifier)});
  })
  /*
  .catch(NoBooruPostsFoundError, (e) => {
    info(tag, 'No images found!');
    done({identifiers: []})
  })*/
  /*
  .catch(err => {
    logger.warn(tag + ': Error finding images!', err);
    done({error: err})
  })*/
}
