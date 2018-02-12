const fs = require('fs-extra');
const moment = require('moment');

const Image = require('../sequelize/models').Image;

const util = require('../util');

let images = [
  {
    identifier: 10000,
    filename: 'link.jpg',
    tags: 'zelda',
    characters: 'link bokoblins',
    copyrights: 'the_legend_of_zelda',
    artists: 'nintendo',
    status: 'DOWNLOADED',
    starred: true,
    uploadedAt: moment().subtract(4, 'days')
  },
  {
    identifier: 10001,
    filename: 'link02.jpg',
    tags: 'zelda',
    characters: 'link',
    copyrights: 'the_legend_of_zelda',
    artists: 'nintendo',
    status: 'DOWNLOADED',
    starred: false,
    uploadedAt: moment().subtract(3, 'days')
  },
  {
    identifier: 10002,
    filename: 'link03.jpg',
    tags: 'zelda',
    characters: 'link',
    copyrights: 'the_legend_of_zelda',
    artists: 'nintendo',
    status: 'DOWNLOADED',
    starred: false,
    uploadedAt: moment().subtract(2, 'days')
  },
  {
    identifier: 10003,
    filename: 'link04.jpg',
    tags: 'zelda',
    characters: 'link',
    copyrights: 'the_legend_of_zelda',
    artists: 'nintendo',
    status: 'DOWNLOADED',
    starred: false,
    uploadedAt: moment().subtract(1, 'days')
  },
  {
    identifier: 10004,
    filename: 'link05.jpg',
    tags: 'zelda',
    characters: 'link',
    copyrights: 'the_legend_of_zelda',
    artists: 'nintendo',
    status: 'DOWNLOADED',
    starred: false,
    uploadedAt: moment()
  }
]

Promise.resolve(images)
.then(images => {
  return images.map(image => {
    image.fileUrl = '/data/' + image.filename;
    image.site = 'danbooru';
    return image;
  })
})
.then(images => {
  return Image.bulkCreate(images)
})
.then(() => console.log('Done!'))
