import React, { Component } from 'react';
import { Col, Container, Row } from 'reactstrap';

import AppActionBar from '../components/AppActionBar';
import Album from '../components/Album';
import PageControl from '../components/PageControl';

class MainView extends Component {
  render() {
    return (
      <div>
        <AppActionBar />
        <div style={{ padding: '.5rem', margin: '0px' }}>
          <h3 style={{color: 'white'}}>All</h3>
        </div>

        <Container fluid>
          <Row>
            <Col sm="12" md={{ size: 8, offset: 4 }}>
              <PageControl />
            </Col>
          </Row>
          <Row noGutters={true}>
            <Col xl="auto"><Album /></Col>
          </Row>
        </Container>
      </div>

    );
  }
}

export default MainView;
