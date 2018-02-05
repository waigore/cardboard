import {combineReducers} from 'redux';

import {
  IMAGES_RECEIVED,
  IMAGE_DELETED,
  SEARCH_TERMS_RECEIVED
} from '../actions';

const SERVER_ENDPOINT = 'http://localhost:5001';

let processImages = function(images) {
  let newArr = images.map(image => {
    console.log(image.thumbnail);
    image.fullThumbnailUrl = `${SERVER_ENDPOINT}/${image.thumbnail}`;
    return image;
  })
  return newArr;
}

const terms = function(state = {items: [], receivedAt: null}, action) {
  switch (action.type) {
    case SEARCH_TERMS_RECEIVED:
      return Object.assign({}, state, {
        items: action.data.terms,
        receivedAt: action.receivedAt
      });
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
    default:
      return state;
  }
}

const appReducer = combineReducers({
  images: images,
  terms: terms
});

export default appReducer;
