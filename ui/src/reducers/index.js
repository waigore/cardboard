import {combineReducers} from 'redux';

import {
  IMAGES_RECEIVED,
  IMAGE_DELETED,
  IMAGE_STARRED,
  SEARCH_TERMS_RECEIVED,
  SEARCH_TERM_CREATED
} from '../actions';

const SERVER_ENDPOINT = 'http://localhost:5001';

let processImages = function(images) {
  let newArr = images.map(image => {
    image.fullUrl = `${SERVER_ENDPOINT}/${image.filename}`;
    image.fullThumbnailUrl = `${SERVER_ENDPOINT}/${image.thumbnail}`;
    return image;
  })
  return newArr;
}

let starImage = function(images, identifier, starred) {
  let i2 = images.filter(i => i.identifier == identifier)[0];
  i2.starred = starred;
  return images;
}

const terms = function(state = {items: [], receivedAt: null}, action) {
  switch (action.type) {
    case SEARCH_TERMS_RECEIVED:
      return Object.assign({}, state, {
        items: action.data.terms,
        receivedAt: action.receivedAt
      });
    case SEARCH_TERM_CREATED:
      return Object.assign({}, state, {
        items: state.items.concat([action.data.term]),
        receivedAt: action.receivedAt
      })
    default:
      return state;
  }
}

const images = function(state = {items: [], total: -1, receivedAt: null}, action) {
  switch (action.type) {
    case IMAGES_RECEIVED:
      return Object.assign({}, state, {
        items: processImages(action.data.images),
        total: action.data.total,
        receivedAt: action.receivedAt
      });
    case IMAGE_DELETED:
      return Object.assign({}, state, {
        items: state.items.filter(image => image.identifier != action.data.identifier),
        receivedAt: action.receivedAt
      });
    case IMAGE_STARRED:
      return Object.assign({}, state, {
        items: starImage(state.items, action.data.identifier, action.data.starred),
        receivedAt: action.receivedAt
      })
    default:
      return state;
  }
}

const appReducer = combineReducers({
  images: images,
  terms: terms
});

export default appReducer;
