import {combineReducers} from 'redux';

let _images = [
  
];

const images = function(state = {items: []}, action) {
  switch (action.type) {
    default:
    return state;
  }
}

const appReducer = combineReducers({
  images: images
});

export default appReducer;
