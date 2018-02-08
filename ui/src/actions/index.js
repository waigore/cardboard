import download from 'downloadjs';

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

export const FIND_IMAGES_BY_CRITERIA = 'FIND_IMAGES_BY_CRITERIA';
export function findImagesByCriteria(tag, page) {
  return {
    type: FIND_IMAGES_BY_CRITERIA,
    tag: tag,
    page: page
  }
}

export const IMAGES_RECEIVED = 'IMAGES_RECEIVED';
export function imagesReceived(json) {
  return {
    type: IMAGES_RECEIVED,
    data: json,
    receivedAt: Date.now()
  }
}

export const DELETE_IMAGE = 'DELETE_IMAGE';
export function deleteImage(identifier) {
  return {
    type: DELETE_IMAGE,
    identifier: identifier
  }
}

export const IMAGE_DELETED = 'IMAGE_DELETED';
export function imageDeleted(json) {
  return {
    type: IMAGE_DELETED,
    data: json,
    receivedAt: Date.now()
  }
}

export const GET_IMAGE_ZIP = 'GET_IMAGE_ZIP';
export function getImageZip(identifiers) {
  return {
    type: GET_IMAGE_ZIP,
    identifiers: identifiers
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


export function doFindImagesByCriteria(tag, page) {
  return (dispatch) => {
    dispatch(findImagesByCriteria(tag, page));

    let apiUrl = `${API_ENDPOINT}/images/byCriteria`;
    return fetch(apiUrl, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({tag, page})
    })
    .then(response => response.json())
    .then(json => dispatch(imagesReceived(json)))
    .catch(error => console.log('An error occurred.', error));
  }
}

export function doDeleteImage(identifier) {
  return (dispatch) => {
    dispatch(deleteImage(identifier));

    let apiUrl = `${API_ENDPOINT}/images/delete`;
    return fetch(apiUrl, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({identifier})
    })
    .then(response => response.json())
    .then(json => dispatch(imageDeleted(json)))
    .catch(error => console.log('An error occurred.', error));
  }
}

export function doGetImageZip(identifiers) {
  return (dispatch) => {
    dispatch(getImageZip(identifiers));

    let apiUrl = `${API_ENDPOINT}/images/zip`;
    return fetch(apiUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({identifiers})
    })
    .then(response => response.blob())
    .then(blob => download(blob))
    .catch(error => console.log('An error occurred.', error));
  }
}
