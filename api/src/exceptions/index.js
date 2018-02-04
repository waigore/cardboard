class NoBooruPostsFoundError extends Error {
  constructor(tag) {
    super('No posts found for ' + tag + '!');
    this.name = 'NoBooruPostsFoundError';
    this.tag = tag;
  }
}

class NoImagesFoundError extends Error {
  constructor() {
    super('No images found!')
    this.name = 'NoImagesFoundError';
  }
}

module.exports = {
  NoBooruPostsFoundError,
  NoImagesFoundError
}
