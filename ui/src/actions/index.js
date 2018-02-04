const API_ENDPOINT = 'http://localhost:5001/api';

export const GET_ALL_SEARCH_TERMS = 'GET_ALL_SEARCH_TERMS';
export function getAllSearchTerms() {
  return {
    type: GET_ALL_SEARCH_TERMS
  }
}

export const SEARCH_TERMS_RECEIVED = 'SEARCH_TERMS_RECEIVED';
export function searchTermsReceived(json) {
  return {
    type: SEARCH_TERMS_RECEIVED,
    data: json,
    receivedAt: Date.now()
  }
}

export function doGetAllSearchTerms() {
  return (dispatch) => {
    dispatch(getAllSearchTerms());

    let apiUrl = `${API_ENDPOINT}/terms/all`;

    return fetch(apiUrl)
      .then(response => response.json())
      .then(json => dispatch(searchTermsReceived(json)))
      .catch(error => console.log('An error occurred.', error));
  }
}
