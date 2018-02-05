const fs = require('fs-extra');

const Danbooru = require('danbooru');
const booru = new Danbooru('waizer', '2yJ8XNHPkwNY4tIsHuye6U4xz6-KEvwOBfCbBz7N9dM');

const Image = require('../sequelize/models').Image;
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

module.exports = function(input, done, progress) {
  let tag = input.tag;
  let limit = input.limit;
  logger.info('Finding images for tag: ' + tag + ', limit: ' + limit);

  findBooruImagesByTag(tag, limit)
  .then(posts => {
    logger.info(posts.length + ' posts retrieved.');
    if (posts.length == 0) {
      throw new NoPostsFoundError(tag);
    }
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
    logger.info("Bulk creating " + recs.length + " recs");
    return Image.bulkCreate(recs).then(() => recs);
  })
  .then(insertedRecs => {
    logger.info('Image search done.')
    done({identifiers: insertedRecs.map(rec => rec.identifier)});
  })
  .catch(NoPostsFoundError, (e) => {
    logger.info('No images found!');
    done({identifiers: []})
  })
  .catch(err => {
    logger.warn('Error finding images!', err);
    done({error: err})
  })
}
