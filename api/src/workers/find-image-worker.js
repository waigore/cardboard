const fs = require('fs-extra');

const Danbooru = require('danbooru');
const booru = new Danbooru('waizer', '2yJ8XNHPkwNY4tIsHuye6U4xz6-KEvwOBfCbBz7N9dM');

const Image = require('../sequelize/models').Image;
const Op = require('sequelize').Op;
const NoBooruPostsFoundError = require('../exceptions').NoBooruPostsFoundError;

let findBooruImagesByTag = function(tags, limit=200) {
  return booru.requestJson('posts', {
    limit: limit,
    tags: tags,
  });
}

module.exports = function(input, done, progress) {
  let tag = input.tag;
  let limit = input.limit;
  console.log('Tag to find images for:' + tag + ' limit:' + limit);

  findBooruImagesByTag(tag, limit)
  .then(posts => {
    console.log(posts.length + ' posts retrieved.');
    if (posts.length == 0) {
      throw new NoPostsFoundError(tag);
    }
    return posts
      .filter(post => post.md5 && post.file_url)
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
    console.log("Bulk creating " + recs.length + " recs");
    return Image.bulkCreate(recs).then(() => recs);
  })
  .then(insertedRecs => {
    done({identifiers: insertedRecs.map(rec => rec.identifier)});
  })
  .catch(NoPostsFoundError, (e) => {
    done({identifiers: []})
  })
  .catch(err => {
    console.log('Error!', err);
    done({error: err})
  })
}
