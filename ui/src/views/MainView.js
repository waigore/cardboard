import React, { Component } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AppActionBar from '../components/AppActionBar';
import Album from '../components/Album';
import PageControl from '../components/PageControl';

import { doGetAllSearchTerms } from '../actions';

class MainView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      numPages: 20,
      filterString: 'All',
      availableFilters: []
    }

    this.handlePageChanged = this.handlePageChanged.bind(this);
    this.handleSearchFilterChanged = this.handleSearchFilterChanged.bind(this);
  }

  componentWillMount() {
    this.props.doGetAllSearchTerms();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      availableFilters: nextProps.mainViewState.terms.map(term => {
        return {
          value: term.name,
          label: term.name
        }
      })
    })
  }

  handlePageChanged(newPage) {
    console.log("Page changed: " + newPage);
  }

  handleSearchFilterChanged(filterValues) {
    if (filterValues.length == 0)
    {
      this.setState({filterString: 'All'});
    }
    else {
      let filterString = filterValues.reduce((s, item) => s + ' ' + item.label, 'Tag: ');
      console.log("Filter changed: " + filterString);
      this.setState({filterString: filterString});
    }
  }

  render() {
    return (
      <div>
        <AppActionBar availableFilters={this.state.availableFilters} onSearchFilterChanged={this.handleSearchFilterChanged} />
        <div style={{ padding: '.5rem', margin: '0px' }}>
          <h3 style={{color: 'white'}}>{this.state.filterString}</h3>
        </div>
        <Container fluid>
          <Row>
            <Col sm="12" md={{ size: 8, offset: 4 }}>
              <PageControl total={this.state.numPages} onPageChanged={this.handlePageChanged}/>
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

function mapStateToProps(state) {
  return {
      mainViewState: state.mainViewState
  };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      doGetAllSearchTerms
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MainView);
