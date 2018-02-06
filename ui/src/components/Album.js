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
import FaTrash from 'react-icons/lib/fa/trash';
import { shake } from 'react-animations';
import Radium, { StyleRoot } from 'radium';
import moment from 'moment';

import {
  doDeleteImage
} from '../actions';

import { range } from '../util';
import './Album.css';

const NUM_COLS = 3;

export const THUMBNAIL_MODE_LARGE = 'large';
export const THUMBNAIL_MODE_SMALL = 'small';

const styles = {
  infiniteShake: {
    animation: 'infinite',
    animationName: Radium.keyframes(shake, 'shake')
  }
}

class ImageTags extends Component {
  constructor(props) {
    super(props);
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
        return <div key={'tag_' + tag.tag} className="image-tag image-tag-character">{tag.tag}</div>;
      else
        return <div key={'tag_' + tag.tag} className="image-tag">{tag.tag}</div>;
    })


    /*
    if (this.props.characters) {
      return this.props.characters.map(tag => {
        return <div key={'tag_' + tag} className="image-tag image-tag-character">{tag}</div>
      })
    }
    else {
      return this.props.general.map(tag => {
        return <div key={'tag_' + tag} className="image-tag">{tag}</div>
      })
    }
    */

    /*
    return tags.map(tag => {
      return <div key={'tag_' + tag} className="image-tag image-tag-character">{tag}</div>
    })*/


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
      hover: false
    }

    this.handleDeleteIconClick = this.handleDeleteIconClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selected: nextProps.selected
    })
  }

  getCardClassName() {
    let className = "image-entry";
    if (this.props.selectable && this.state.hover) {
      className += " image-entry-hover";
    }
    if (this.state.selected) {
      className += " image-entry-selected";
    }
    return className;
  }

  handleDeleteIconClick(evt, identifier) {
    if (this.props.onDelete) {
      this.props.onDelete(identifier);
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
    if (this.props.onSelect) {
      this.props.onSelect(identifier);
    }
  }

  render() {
    if (!this.props.image) {
      return <div></div>
    }

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
            copyrights={this.props.image.copyrights} />
          <div className="d-flex justify-content-between align-items-center">
            <FaTrash style={{cursor: 'pointer'}} onClick={evt => this.handleDeleteIconClick(evt, this.props.image.identifier)}/>
            <small className="text-muted">{moment(this.props.image.uploadedAt).fromNow()}</small>
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
      selectedImages: [],
      refreshedAt: moment()
    }

    this.handleDeleteImage = this.handleDeleteImage.bind(this);
    this.handleImageEntrySelect = this.handleImageEntrySelect.bind(this);
    this.isImageEntrySelected = this.isImageEntrySelected.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    let thumbnailMode = nextProps.thumbnailMode || THUMBNAIL_MODE_LARGE;
    let cols = thumbnailMode == THUMBNAIL_MODE_LARGE ? 3 : 6;

    this.setState({
      cols: cols,
      imageRows: this.splitEntriesByRows(nextProps.images, cols)
    })
  }

  handleDeleteImage(identifier) {
    this.props.doDeleteImage(identifier);
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
      selectedImages: newSelectedImages,
      refreshedAt: moment()
    })
  }

  isImageEntrySelected(image) {
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
            this.state.imageRows.map(imageRow =>
                <Row key={'row' + (rowNum++)} style={{paddingBottom: "10px", paddingTop: "10px"}}>
                  {
                    imageRow.map(image =>
                      <Col
                        key={this.getChildKey(image)}
                        md={this.props.thumbnailMode == THUMBNAIL_MODE_LARGE ? 4 : 2 }
                        xs="12">
                        <ImageEntry
                          selectable={true}
                          selected={this.isImageEntrySelected(image)}
                          image={image}
                          onDelete={this.handleDeleteImage}
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
      doDeleteImage
    }, dispatch);
}

export default connect(null, mapDispatchToProps)(Album);
