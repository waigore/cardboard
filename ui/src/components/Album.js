import React, { Component } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardImg,
  CardTitle,
  CardText,
  CardSubtitle,
  Col,
  Container,
  Row } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import FaTrash from 'react-icons/lib/fa/trash';
import FaStar from 'react-icons/lib/fa/star';
import FaStarO from 'react-icons/lib/fa/star-o';
import FaExternalLinkSquare from 'react-icons/lib/fa/external-link-square';
import moment from 'moment';

import {
  THUMBNAIL_MODE_LARGE,
  THUMBNAIL_MODE_SMALL,
  EDIT_MODE_EDIT,
  EDIT_MODE_VIEW
} from '../views/MainView';

import {
  doDeleteImage,
  doStarImage,
  doGetImageZip
} from '../actions';

import {
  addEventListener,
  removeEventListener
} from '../actions/pubsub';

import { range } from '../util';
import './Album.css';

const NUM_COLS = 3;

export const EVT_CLEAR_ALL = 'CLEAR_ALL';
export const EVT_SELECT_ALL = 'SELECT_ALL';
export const EVT_GET_IMAGE_ZIP = 'GET_IMAGE_ZIP';

class ImageTags extends Component {
  constructor(props) {
    super(props);

    this.handleTagClicked = this.handleTagClicked.bind(this);
  }

  handleTagClicked(tag) {
    if (this.props.onTagClicked) {
      this.props.onTagClicked(tag);
    }
  }

  renderTags() {
    let tags = [];
    if (this.props.characters) {
      tags = tags.concat(this.props.characters.map(tag => {
        return {
          tag: tag,
          type: 'character'
        }
      }));
    }
    if (this.props.general) {
      tags = tags.concat(this.props.general.map(tag => {
        return {
          tag: tag,
          type: 'general'
        }
      }));
    }

    return tags.map(tag => {
      if (tag.type == 'character')
        return <div key={'tag_' + tag.tag} className="image-tag image-tag-character" onClick={(evt) => this.handleTagClicked(tag.tag)}>{tag.tag}</div>;
      else
        return <div key={'tag_' + tag.tag} className="image-tag" onClick={(evt) => this.handleTagClicked(tag.tag)}>{tag.tag}</div>;
    })
  }

  render() {
    return (
      <div className="image-tag-container">
        {this.renderTags()}
      </div>
    )
  }
}

class ImageEntry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: false,
      hover: false,
      starred: props.image ? props.image.starred : false
    }

    this.handleDeleteIconClick = this.handleDeleteIconClick.bind(this);
    this.handleStarIconClick = this.handleStarIconClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      starred: nextProps.image ? nextProps.image.starred: false
    })
  }

  getCardClassName() {
    let className = "image-entry";
    if (this.state.hover) {
      className += " image-entry-hover";
    }

    if (this.props.selected) {
      className += " image-entry-selected";
    } else if (this.props.selectable) {
      className += " image-entry-selectable";
    }

    return className;
  }

  handleDeleteIconClick(evt, identifier) {
    if (this.props.onDelete) {
      this.props.onDelete(identifier);
    }
  }

  handleStarIconClick(evt, identifier) {
    if (this.props.onStar) {
      this.props.onStar(identifier, !this.state.starred);
      this.setState({
        starred: !this.state.starred
      });
    }
  }

  handleMouseEnter(evt) {
    this.setState({
      hover: true
    })
  }

  handleMouseLeave(evt) {
    this.setState({
      hover: false
    })
  }

  handleClick(evt, identifier) {
    if (this.props.onSelect && this.props.selectable) {
      this.props.onSelect(identifier);
    }
  }

  render() {
    if (!this.props.image) {
      return <div></div>
    }

    var Star = this.state.starred ? FaStar : FaStarO;

    return (
      <Card className={"" + this.getCardClassName()}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          onClick={evt => this.handleClick(evt, this.props.image.identifier)}>
        <a href={this.props.image.fullUrl} target="_blank">
          <CardImg top className="image-thumbnail"
            width="100%"
            src={this.props.image.fullThumbnailUrl}
            alt={this.props.image.identifier} />
        </a>
        <CardBody>
          <ImageTags
            general={this.props.image.tags}
            characters={this.props.image.characters}
            copyrights={this.props.image.copyrights}
            onTagClicked={this.props.onTagClicked} />
          <div>
            <div className="float-left">
              <Star style={{cursor: 'pointer'}} onClick={evt => this.handleStarIconClick(evt, this.props.image.identifier)}/>
              <Link to={this.props.image.externalUrl} target="_blank"><FaExternalLinkSquare /></Link>
              <FaTrash style={{cursor: 'pointer'}} onClick={evt => this.handleDeleteIconClick(evt, this.props.image.identifier)}/>
            </div>
            <div className="float-right">
              <small className="text-muted">{moment(this.props.image.uploadedAt).fromNow()}</small>
              {
                this.props.image.artists && this.props.image.artists.length > 0 &&
                <span style={{cursor: 'pointer'}} onClick={evt => this.props.onTagClicked && this.props.onTagClicked(this.props.image.artists[0])}>
                  <small className="text-muted"> by {this.props.image.artists[0]}</small>
                </span>
              }
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }
}

class Album extends Component {
  constructor(props) {
    super(props);

    let cols = props.thumbnailMode == THUMBNAIL_MODE_LARGE ? 3 : 6;

    this.state = {
      cols: cols,
      imageRows: props.images ? this.splitEntriesByRows(props.images, cols) : [],
      selectedImages: []
    }

    this.handleDeleteImage = this.handleDeleteImage.bind(this);
    this.handleStarImage = this.handleStarImage.bind(this);
    this.handleImageEntrySelect = this.handleImageEntrySelect.bind(this);
    this.isImageEntrySelected = this.isImageEntrySelected.bind(this);
    this.clearAll = this.clearAll.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.getImageZip = this.getImageZip.bind(this);
  }

  componentDidMount() {
    addEventListener(EVT_CLEAR_ALL, this.clearAll);
    addEventListener(EVT_SELECT_ALL, this.selectAll);
    addEventListener(EVT_GET_IMAGE_ZIP, this.getImageZip);
  }

  componentWillReceiveProps(nextProps) {
    let thumbnailMode = nextProps.thumbnailMode;
    let cols = thumbnailMode == THUMBNAIL_MODE_LARGE ? 3 : 6;
    let editMode = nextProps.editMode;

    let stateChange = {
      cols: cols,
      imageRows: this.splitEntriesByRows(nextProps.images, cols)
    };
    if (editMode == EDIT_MODE_VIEW) {
      stateChange.selectedImages = [];
    }

    this.setState(stateChange);
  }

  clearAll() {
    this.setState({
      selectedImages: []
    });
  }

  selectAll() {
    let currSelectedImageIdentifiers = this.state.selectedImages.map(i => i.identifier);

    this.setState({
      selectedImages: this.state.selectedImages.concat(
                        this.props.images.filter(i => !currSelectedImageIdentifiers.includes(i.identifier))
                      )
    })
  }

  getImageZip() {
    let currSelectedImageIdentifiers = this.state.selectedImages.map(i => i.identifier);

    if (currSelectedImageIdentifiers)
    {
      this.props.doGetImageZip(currSelectedImageIdentifiers);
    }
  }

  handleDeleteImage(identifier) {
    this.props.doDeleteImage(identifier);
  }

  handleStarImage(identifier, starred) {
    this.props.doStarImage(identifier, starred);
  }

  handleImageEntrySelect(image) {
    this.toggleImageEntrySelection(image);
  }

  toggleImageEntrySelection(image) {
    let selectedImages = this.state.selectedImages.map(i => i), newSelectedImages;
    let selectedImageIdentifiers = selectedImages.map(i => i.identifier);
    if (!selectedImageIdentifiers.includes(image.identifier))
    {
      selectedImages.push(image);
      newSelectedImages = selectedImages;
    }
    else {
      newSelectedImages = selectedImages.filter(i => i.identifier != image.identifier);
    }

    this.setState({
      selectedImages: newSelectedImages
    })
  }

  isImageEntrySelected(image) {
    if (!image) {
      return false;
    }
    let identifiers = this.state.selectedImages.map(i => i.identifier);
    console.log('Selected: ' + identifiers);
    return identifiers.includes(image.identifier);
  }

  splitEntriesByRows(images, colsPerRow) {
    let myImages = images.map(image => image);
    let imageRows = [];
    while (myImages.length > 0) {
      if (myImages.length >= colsPerRow) {
          imageRows.push(myImages.splice(0, colsPerRow));
      }
      else {
        while (myImages.length < colsPerRow) {
          myImages.push(null);
        }
        imageRows.push(myImages);
      }
    }
    return imageRows;
  }

  getChildKey(image) {
    if (image) {
      return image.identifier;
    }
    else {
      return '' + Math.floor(Math.random()*1000);
    }
  }

  render() {
    if (this.state.imageRows.length == 0) {
      return <div>No images...</div>;
    }
    else {
      let rowNum = 0;
      return (
        <Container>
          {
            this.props.editMode == EDIT_MODE_EDIT &&
            this.state.selectedImages.length > 0 &&
            <Row>
              <Col xs="12">
                <div style={{color: 'white'}}>{this.state.selectedImages.length} images selected.</div>
              </Col>
            </Row>
          }
          {
            this.state.imageRows.map(imageRow =>
                <Row key={'row' + (rowNum++)} style={{paddingBottom: "10px", paddingTop: "10px"}}>
                  {
                    imageRow.map(image =>
                      <Col
                        key={this.getChildKey(image)}
                        md={this.props.thumbnailMode == THUMBNAIL_MODE_LARGE ? 4 : 2 }
                        xs="12">
                        <ImageEntry
                          selectable={this.props.editMode == EDIT_MODE_EDIT}
                          selected={this.props.editMode == EDIT_MODE_EDIT && this.isImageEntrySelected(image)}
                          image={image}
                          onTagClicked={this.props.onTagClicked}
                          onDelete={this.handleDeleteImage}
                          onStar={this.handleStarImage}
                          onSelect={ identifier => this.handleImageEntrySelect(image)}/>
                      </Col>
                    )
                  }
                </Row>
            )
          }
        </Container>
      );
    }
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      doDeleteImage,
      doStarImage,
      doGetImageZip
    }, dispatch);
}

export default connect(null, mapDispatchToProps)(Album);
