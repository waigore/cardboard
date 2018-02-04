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

import { range } from '../util';
import './Album.css';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

class ImageTags extends Component {
  renderTags() {
    return range(0, getRandomInt(3, 15)).map(i => {
      return <div key={'tag' + i} className="image-tag">persona5</div>
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
    return (
      <Card className="box-shadow">
        <CardImg top width="100%" src="https://placeholdit.imgix.net/~text?txtsize=33&txt=318%C3%97180&w=318&h=180" alt="Card image cap" />
        <CardBody>
          <ImageTags />
          <div className="d-flex justify-content-between align-items-center">
            <FaTrash style={{cursor: 'pointer'}}/>
            <small className="text-muted">9 mins</small>
          </div>
        </CardBody>
      </Card>
    );
  }
}

class Album extends Component {
  renderImageEntry() {
    return <ImageEntry />;
  }

  render() {
    return (
      <Container>
        <Row style={{paddingBottom: "10px", paddingTop: "10px"}}>
          <Col md="4">
            { this.renderImageEntry() }
          </Col>
          <Col md="4">
            { this.renderImageEntry() }
          </Col>
          <Col md="4">
            { this.renderImageEntry() }
          </Col>
        </Row>
        <Row style={{paddingBottom: "10px", paddingTop: "10px"}}>
          <Col md="4">
            { this.renderImageEntry() }
          </Col>
          <Col md="4">
            { this.renderImageEntry() }
          </Col>
          <Col md="4">
            { this.renderImageEntry() }
          </Col>
        </Row>
      </Container>
    )
  }
}

export default Album;
