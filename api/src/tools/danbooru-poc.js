const fs = require('fs-extra');
const Danbooru = require('danbooru');
const request = require('request-promise');
//const bluebird = require('bluebird');
const sharp = require('sharp');

const booru = new Danbooru('waizer', '2yJ8XNHPkwNY4tIsHuye6U4xz6-KEvwOBfCbBz7N9dM');
//const requestAsync = bluebird.promisify(request);

let genThumbnail = function(imgFilename, outFilename) {
  return sharp(imgFilename)
    .resize(318, 180)
    .crop(sharp.strategy.attention)
    .toFile(outFilename);
}

let downloadImage = function(url, filename) {
  return request(url, {encoding: null})
    .then((body) => {
      return fs.writeFile(filename, body, "binary");
    })
    .then(() => console.log('Done!'))
    .catch(err => console.log("Error! " + err));
}

let myMSleep = function(millis) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      console.log("Woken!");
      resolve(millis);
    }, millis);
  })
}

/*
let millis = Math.random()*1000;
console.log("Waiting " + millis + "ms...");
myMSleep(millis).then((millis) => console.log("Hello"));
*/


booru.requestJson('posts', {
  limit: 1,
  tags: '1girl id:2999800..2999900',
})
.then(posts => {
  console.log("Retrieved", posts.length, "posts.")
  posts.forEach(post => {
    console.log("id:", post.id);
    console.log(post.created_at);
  })
  return posts;
})
.then(posts => {
  posts.forEach(post => {

    let url = `https://danbooru.donmai.us${post.file_url}`;
    let filename = post.file_url.split('/').splice(-1)[0];
    console.log('downloading ' + url + ' to ' + filename);
    return downloadImage(url, filename).then(() => genThumbnail(filename, 't_' + filename));
  })
})
.then(() => console.log('Done!'))
