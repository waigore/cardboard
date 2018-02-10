const fs = require('fs-extra');

const Danbooru = require('danbooru');
const booru = new Danbooru('waizer', '2yJ8XNHPkwNY4tIsHuye6U4xz6-KEvwOBfCbBz7N9dM');

const Image = require('../sequelize/models').Image;
const SearchTerm = require('../sequelize/models').SearchTerm;
const Op = require('sequelize').Op;
const NoBooruPostsFoundError = require('../exceptions').NoBooruPostsFoundError;

const logging = require('../util/logging');

const logger = logging.getLogger('image-search', 'imagesearch');

let findBooruImagesByTag = function(tags, limit=200) {
  return booru.requestJson('posts', {
    limit: limit,
    tags: tags,
  });
}

let acceptedExt = function(filename) {
  let exts = ['.png', 'jpg', 'jpeg'];
  return exts.some(ext => filename.endsWith(ext));
}

let info = (tag, msg) => logger.info(tag + ": " + msg);

module.exports = function(input, done, progress) {
  let tag = input.tag;
  let limit = input.limit;
  let range = input.range;

  let realTag = tag;
  if (range.min != 0 && range.max != 0) {
    realTag = realTag + ` id:${range.min}..${range.max}`;
  }

  info(tag, 'Finding images for tag: ' + realTag + ', limit: ' + limit);

  findBooruImagesByTag(realTag, limit)
  .then(posts => {
    info(tag, posts.length + ' posts retrieved');
    /*if (posts.length == 0) {
      throw new NoBooruPostsFoundError(tag);
    }*/
    return posts
      .filter(post => post.md5 && post.file_url && acceptedExt(post.file_url))
      .map(post => {
        return {
          identifier: `${post.id}`,
          md5: post.md5,
          status: 'INITIAL',
          filename: post.file_url.split('/').slice(-1)[0],
          site: 'danbooru',
          fileUrl: post.file_url,
          tags: post.tag_string_general,
          artists: post.tag_string_artist,
          characters: post.tag_string_character,
          copyrights: post.tag_string_copyright,
          uploadedAt: post.created_at
        }
      });
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
    info(tag, recs.map(rec => parseInt(rec.identifier, 10)));
    let currMax = recs.length > 0 ? Math.max(...recs.map(rec => parseInt(rec.identifier, 10))) : range.max;
    info(tag, "Currmax=" + currMax);

    return Image.max('identifier')
      .then(mxIdentifier => Math.min(parseInt(mxIdentifier, 10), currMax))
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
    info(tag, "Bulk creating " + recs.length + " recs");
    return Image.bulkCreate(recs).then(() => recs);
  })
  /*
  .then(insertedRecs => {
    return Image.max('identifier', {
      where: {
        tags: {
          [Op.like]: '%' + tag + '%'
        }
      }
    }).then(mx => {
        logger.info("Updating lastDownloadedId for tag " + tag + " to " + mx);
        return SearchTerm.update(
          { lastDownloadedId : mx.toString() },
          { where: { name: tag } }
        );
      }).then(() => insertedRecs);
  })
  */
  .then(insertedRecs => {
    info(tag, 'Image search done.')
    done({identifiers: insertedRecs.map(rec => rec.identifier)});
  })
  .catch(NoBooruPostsFoundError, (e) => {
    info(tag, 'No images found!');
    done({identifiers: []})
  })
  .catch(err => {
    logger.warn(tag + ': Error finding images!', err);
    done({error: err})
  })
}
