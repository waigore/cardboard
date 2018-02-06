import React from 'react';
import {
  Button,
  ButtonGroup,
  Col,
  Container,
  Row,
} from 'reactstrap';
import Select from 'react-select';
import {Link} from 'react-router-dom';

import FaList from 'react-icons/lib/fa/list';
import FaThLarge from 'react-icons/lib/fa/th-large';
import FaTh from 'react-icons/lib/fa/th';
import FaEdit from 'react-icons/lib/fa/edit';

import 'react-select/dist/react-select.css';
import './AppActionBar.css';

class AppActionBar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      values: []
      /*
      [
        {value: 'persona5', label: 'persona5'},
        {value: 'persona4', label: 'persona4'}
      ]
      */
    };

    this.handleTagFilterSelectChanged = this.handleTagFilterSelectChanged.bind(this);
    this.handleLargeThumbnailButtonClick = this.handleLargeThumbnailButtonClick.bind(this);
    this.handleSmallThumbnailButtonClick = this.handleSmallThumbnailButtonClick.bind(this);
  }

  handleTagFilterSelectChanged(values) {
    this.setState({ values });

    if (this.props.onSearchFilterChanged) {
      this.props.onSearchFilterChanged(values);
    }
  }

  handleLargeThumbnailButtonClick(evt) {
    if (this.props.onThumbnailModeToggled) {
      this.props.onThumbnailModeToggled('large');
    }
  }

  handleSmallThumbnailButtonClick(evt) {
    if (this.props.onThumbnailModeToggled) {
      this.props.onThumbnailModeToggled('small');
    }
  }

  render() {
    return (
      <div className="clearfix" style={{ padding: '.5rem', margin: '0px' }}>
        <ButtonGroup className="float-left" style={{marginRight: "20px"}}>
          <Button outline color="success"
            style={{ color : 'white', borderColor: 'white' }}
            onClick={evt => this.handleLargeThumbnailButtonClick(evt)}>
              <FaThLarge />
          </Button>
          <Button outline color="success"
            style={{ color : 'white', borderColor: 'white' }}
            onClick={evt => this.handleSmallThumbnailButtonClick(evt)}>
              <FaTh />
          </Button>
        </ButtonGroup>

        <ButtonGroup className="float-left">
          <Button outline color="success" style={{ color : 'white', borderColor: 'white' }}><FaEdit /></Button>
        </ButtonGroup>
        <div className="float-right">
          <Select
            style={{width: "250px", backgroundColor: 'transparent', borderColor: 'white' }}
            multi
            name="tag-filter"
            onChange={this.handleTagFilterSelectChanged}
            removeSelected={true}
            options={this.props.availableFilters}
            value={this.state.values}
          />
        </div>
      </div>
    );
  }
}

export default AppActionBar;
