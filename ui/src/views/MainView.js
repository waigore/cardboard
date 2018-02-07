import React, { Component } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AppActionBar from '../components/AppActionBar';
import Album, { EVT_CLEAR_ALL, EVT_SELECT_ALL } from '../components/Album';
import PageControl from '../components/PageControl';

import {
  doGetAllSearchTerms,
  doFindImagesByCriteria
} from '../actions';
import {
  emitEvent
} from '../actions/pubsub';

const PAGE_SIZE = 30;
const PAGE_WINDOW_SIZE = 5;

export const THUMBNAIL_MODE_LARGE = 'large';
export const THUMBNAIL_MODE_SMALL = 'small';
export const EDIT_MODE_EDIT = 'edit';
export const EDIT_MODE_VIEW = 'view';

class MainView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      filterString: 'All',
      filters: [],
      availableFilters: [],
      page: 1,
      pageFrom: 1,
      pageTo: 1,
      totalPages: 1,
      thumbnailMode: THUMBNAIL_MODE_LARGE,
      editMode: EDIT_MODE_VIEW
    }

    this.handlePageChanged = this.handlePageChanged.bind(this);
    this.handleSearchFilterChanged = this.handleSearchFilterChanged.bind(this);
    this.handleThumbnailModeToggled = this.handleThumbnailModeToggled.bind(this);
    this.handleEditModeToggled = this.handleEditModeToggled.bind(this);
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.handleSelectClear = this.handleSelectClear.bind(this);
  }

  componentWillMount() {
    this.props.doFindImagesByCriteria("", this.state.page);
    this.props.doGetAllSearchTerms();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.images.receivedAt != this.props.images.receivedAt) {
      let imageTotal = nextProps.images.total;
      let numPages = Math.ceil(imageTotal/PAGE_SIZE);
      //let currPage = 1;
      let currPageFrom = 1;
      let currPageTo = Math.min(currPageFrom+PAGE_WINDOW_SIZE-1, numPages);
      console.log("currPageFrom: " + currPageFrom);
      console.log("currPageTo: " + currPageTo);
      console.log("numPages: " + numPages);

      this.setState({
        pageFrom: currPageFrom,
        pageTo: currPageTo,
        totalPages: numPages
      })
    }

    this.setState({
      availableFilters: nextProps.terms.items.map(term => {
        return {
          value: term.name,
          label: term.name
        }
      })
    })
  }

  findImages() {
    let filters = this.state.filters;
    filters.sort((f1, f2) => {
      if (f1.value > f2.value) return 1;
      else if (f1.value < f2.value) return -1;
      return 0;
    })
    let searchTag = filters.map(filter => filter.value).join(' ');
    console.log("Search tag: " + searchTag + " page: " + this.state.page);

    this.props.doFindImagesByCriteria(searchTag, this.state.page);
  }

  handlePageChanged(newPage) {
    console.log("Page changed: " + newPage);
    this.setState({ page : newPage }, () => {
      this.findImages();
    });
  }

  handleSearchFilterChanged(filterValues) {
    console.log("Filter changed: " + filterValues);
    this.setState({filters: filterValues}, () => {
      this.findImages();
    });

    if (filterValues.length == 0)
    {
      this.setState({filterString: 'All'});
    }
    else {
      let filterString = filterValues.reduce((s, item) => s + ' ' + item.label, 'Tag: ');
      this.setState({filterString: filterString});
    }
  }

  handleSelectAll() {
    if (this.state.editMode == EDIT_MODE_EDIT)
    {
      emitEvent(EVT_SELECT_ALL, null);
    }
  }

  handleSelectClear() {
    if (this.state.editMode == EDIT_MODE_EDIT)
    {
      emitEvent(EVT_CLEAR_ALL, null);
    }
  }

  handleEditModeToggled(toggleMode) {
    this.setState({
      editMode: toggleMode
    })
  }

  handleThumbnailModeToggled(toggleMode) {
    this.setState({
      thumbnailMode : toggleMode
    });
  }

  render() {
    return (
      <div>
        <AppActionBar
          availableFilters={this.state.availableFilters}
          onSearchFilterChanged={this.handleSearchFilterChanged}
          onThumbnailModeToggled={this.handleThumbnailModeToggled}
          onEditModeToggled={this.handleEditModeToggled}
          onSelectClear={this.handleSelectClear}
          onSelectAll={this.handleSelectAll}
          thumbnailMode={this.state.thumbnailMode}
          editMode={this.state.editMode}
           />
        <div style={{ padding: '.5rem', margin: '0px' }}>
          <h3 style={{color: 'white'}}>{this.state.filterString}</h3>
        </div>
        <Container fluid>
          <Row>
            <Col sm={{ size: 1, offset: 5 }}>
              <PageControl
                from={this.state.pageFrom}
                to={this.state.pageTo}
                total={this.state.totalPages}
                active={this.state.page}
                onPageChanged={this.handlePageChanged}/>
            </Col>
          </Row>
          <Row noGutters={true}>
            <Col md="auto">
              <Album
                images={this.props.images.items}
                thumbnailMode={this.state.thumbnailMode}
                editMode={this.state.editMode}/>
            </Col>
          </Row>
          <Row>
            <Col sm={{ size: 1, offset: 5 }}>
              <PageControl
                from={this.state.pageFrom}
                to={this.state.pageTo}
                total={this.state.totalPages}
                active={this.state.page}
                onPageChanged={this.handlePageChanged}/>
            </Col>
          </Row>
        </Container>
      </div>

    );
  }
}

function mapStateToProps(state) {
  return {
      images: state.images,
      terms: state.terms,
  };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      doGetAllSearchTerms,
      doFindImagesByCriteria
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MainView);
