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

class Album extends Component {
  renderCard() {
    return (
      <Card className="box-shadow">
        <CardImg top width="100%" src="https://placeholdit.imgix.net/~text?txtsize=33&txt=318%C3%97180&w=318&h=180" alt="Card image cap" />
        <CardBody>
          <CardText>Some quick text</CardText>
          <div className="d-flex justify-content-between align-items-center">
            <ButtonGroup>
              <Button outline>View</Button>
              <Button outline>Edit</Button>
            </ButtonGroup>
            <small className="text-muted">9 mins</small>
          </div>
        </CardBody>
      </Card>
    );
  }

  render() {
    return (
      <Container>
        <Row style={{paddingBottom: "10px", paddingTop: "10px"}}>
          <Col md="4">
            { this.renderCard() }
          </Col>
          <Col md="4">
            { this.renderCard() }
          </Col>
          <Col md="4">
            { this.renderCard() }
          </Col>
        </Row>
        <Row style={{paddingBottom: "10px", paddingTop: "10px"}}>
          <Col md="4">
            { this.renderCard() }
          </Col>
          <Col md="4">
            { this.renderCard() }
          </Col>
          <Col md="4">
            { this.renderCard() }
          </Col>
        </Row>
      </Container>
    )
  }
}

export default Album;
