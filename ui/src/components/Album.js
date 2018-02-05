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
import moment from 'moment';

import {
  doDeleteImage
} from '../actions';

import { range } from '../util';
import './Album.css';

const NUM_COLS = 3;

class ImageTags extends Component {
  constructor(props) {
    super(props);
  }

  renderTags() {
    return this.props.tags.map(tag => {
      return <div key={'tag_' + tag} className="image-tag">{tag}</div>
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

    this.handleDeleteIconClick = this.handleDeleteIconClick.bind(this);
  }

  render() {
    if (!this.props.image) {
      return <div></div>
    }

    return (
      <Card className="box-shadow">
        <CardImg top
          width="100%"
          src={this.props.image.fullThumbnailUrl}
          alt={this.props.image.identifier} />
        <CardBody>
          <ImageTags tags={this.props.image.tags} />
          <div className="d-flex justify-content-between align-items-center">
            <FaTrash style={{cursor: 'pointer'}} onClick={evt => this.handleDeleteIconClick(evt, this.props.image.identifier)}/>
            <small className="text-muted">{moment(this.props.image.uploadedAt).fromNow()}</small>
          </div>
        </CardBody>
      </Card>
    );
  }

  handleDeleteIconClick(evt, identifier) {
    if (this.props.onDelete) {
      this.props.onDelete(identifier);
    }
  }
}

class Album extends Component {

  constructor(props) {
    super(props);

    this.state = {
      imageRows: props.images ? this.splitEntriesByRows(props.images) : []
    }

    this.handleDeleteImage = this.handleDeleteImage.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      imageRows: this.splitEntriesByRows(nextProps.images)
    })
  }

  handleDeleteImage(identifier) {
    this.props.doDeleteImage(identifier);
  }

  splitEntriesByRows(images) {
    let myImages = images.map(image => image);
    let imageRows = [];
    while (myImages.length > 0) {
      if (myImages.length >= 3) {
          imageRows.push(myImages.splice(0, NUM_COLS));
      }
      else {
        while (myImages.length < 3) {
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
                      <Col key={this.getChildKey(image)} md="4" xs="12">
                        <ImageEntry image={image} onDelete={this.handleDeleteImage}/>
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
