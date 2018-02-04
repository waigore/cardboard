import {combineReducers} from 'redux';

import {
  SEARCH_TERMS_RECEIVED
} from '../actions';

const mainViewState = function(state = {images: [], terms: []}, action) {
  switch (action.type) {
    case SEARCH_TERMS_RECEIVED:
      return Object.assign({}, state, {
        terms: action.data.terms
      });
    default:
      return state;
  }
}

const appReducer = combineReducers({
  mainViewState: mainViewState
});

export default appReducer;
