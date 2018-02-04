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
import FaTrash from 'react-icons/lib/fa/trash';
import moment from 'moment';

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
            <FaTrash style={{cursor: 'pointer'}}/>
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

    this.state = {
      imageRows: props.images ? this.splitEntriesByRows(props.images) : []
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      imageRows: this.splitEntriesByRows(nextProps.images)
    })
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
                      <Col key={this.getChildKey(image)} md="4">
                        <ImageEntry image={image} />
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

export default Album;
