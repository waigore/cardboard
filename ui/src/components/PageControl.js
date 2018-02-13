import React from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import './PageControl.css';

class PageControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      from: props.from || 1,
      to: props.to || 5,
      total: props.total || 10,
      active: props.activePage || 1
    }

    this.handlePaginationItemClick = this.handlePaginationItemClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      from: nextProps.from,
      to: nextProps.to,
      total: nextProps.total,
      active: nextProps.active
    })
  }

  recalculatePages(currPage) {
    let numItems = this.state.to - this.state.from;
    let from = currPage - numItems/2;
    let to = currPage + numItems/2;
    if (from < 1) {
      from = 1;
      to = from + numItems;
    }
    else if (to > this.state.total) {
      to = this.state.total;
      from = to - numItems;
    }
    return {to, from}
  }

  handlePaginationItemClick(evt, itemVal) {
    let {to, from} = this.recalculatePages(itemVal);
    this.setState({
      active: itemVal,
      from: from,
      to: to
    })

    if (this.props.onPageChanged) {
      this.props.onPageChanged(itemVal);
    }
  }

  handleNextItemClick(evt) {
    let itemVal = this.state.active+1;
    let {to, from} = this.recalculatePages(itemVal);
    this.setState({
      active: itemVal,
      from: from,
      to: to
    })

    if (this.props.onPageChanged) {
      this.props.onPageChanged(itemVal);
    }
  }

  handlePrevItemClick(evt) {
    let itemVal = this.state.active-1;
    let {to, from} = this.recalculatePages(itemVal);
    this.setState({
      active: itemVal,
      from: from,
      to: to
    })

    if (this.props.onPageChanged) {
      this.props.onPageChanged(itemVal);
    }
  }

  renderPaginationItems() {
    return Array.from({length: this.state.to-this.state.from+1}, (x, i) => i+this.state.from).map(i => {
      return (
        <PaginationItem key={i} active={i == this.state.active}>
          <PaginationLink onClick={ (evt) => this.handlePaginationItemClick(evt, i) }>
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    })
  }

  render() {
    return (
      <Pagination style={{backgroundColor: 'transparent'}}>
        <PaginationItem disabled={ this.state.active <= 1 }>
          <PaginationLink previous onClick={ (evt) => this.handlePrevItemClick(evt) }/>
        </PaginationItem>
        {this.renderPaginationItems()}
        <PaginationItem disabled={ this.state.active >= this.state.total }>
          <PaginationLink next onClick={ (evt) => this.handleNextItemClick(evt) }/>
        </PaginationItem>
      </Pagination>
    );
  }
}

export default PageControl;
