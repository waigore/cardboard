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
import FaCloudDownload from 'react-icons/lib/fa/cloud-download';
import FaSquare from 'react-icons/lib/fa/square';
import FaSquareO from 'react-icons/lib/fa/square-o';

import {
  THUMBNAIL_MODE_LARGE,
  THUMBNAIL_MODE_SMALL,
  EDIT_MODE_EDIT,
  EDIT_MODE_VIEW
} from '../views/MainView';

import 'react-select/dist/react-select.css';
import './AppActionBar.css';

class AppActionBar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      values: []
    };

    this.handleTagFilterSelectChanged = this.handleTagFilterSelectChanged.bind(this);
    this.handleLargeThumbnailButtonClick = this.handleLargeThumbnailButtonClick.bind(this);
    this.handleSmallThumbnailButtonClick = this.handleSmallThumbnailButtonClick.bind(this);
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
    this.handleClearAllButtonClick = this.handleClearAllButtonClick.bind(this);
    this.handleSelectAllButtonClick = this.handleSelectAllButtonClick.bind(this);
    this.handleDownloadButtonClick = this.handleDownloadButtonClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown(evt) {
    if (evt.keyCode == 27) { //escape
      if (this.props.onEditModeToggled) {
        this.props.onEditModeToggled(EDIT_MODE_VIEW);
      }
    }
  }

  handleTagFilterSelectChanged(values) {
    this.setState({ values });

    if (this.props.onSearchFilterChanged) {
      this.props.onSearchFilterChanged(values);
    }
  }

  handleClearAllButtonClick(evt) {
    if (this.props.onSelectClear) {
      this.props.onSelectClear();
    }
  }

  handleSelectAllButtonClick(evt) {
    if (this.props.onSelectAll) {
      this.props.onSelectAll();
    }
  }

  handleDownloadButtonClick(evt) {
    if (this.props.onDownload) {
      this.props.onDownload();
    }
  }

  handleEditButtonClick(evt) {
    if (this.props.onEditModeToggled) {
      this.props.onEditModeToggled(this.props.editMode == EDIT_MODE_EDIT ? EDIT_MODE_VIEW : EDIT_MODE_EDIT);
    }
  }

  handleLargeThumbnailButtonClick(evt) {
    if (this.props.onThumbnailModeToggled) {
      this.props.onThumbnailModeToggled(THUMBNAIL_MODE_LARGE);
    }
  }

  handleSmallThumbnailButtonClick(evt) {
    if (this.props.onThumbnailModeToggled) {
      this.props.onThumbnailModeToggled(THUMBNAIL_MODE_SMALL);
    }
  }

  render() {
    return (
      <div className="clearfix" style={{ padding: '.5rem', margin: '0px' }}>
        <ButtonGroup className="float-left" style={{marginRight: "20px"}}>
          <Button outline={this.props.thumbnailMode != THUMBNAIL_MODE_LARGE}
            color="success"
            style={{ color : 'white', borderColor: 'white' }}
            onClick={evt => this.handleLargeThumbnailButtonClick(evt)}>
              <FaThLarge />
          </Button>
          <Button outline={this.props.thumbnailMode != THUMBNAIL_MODE_SMALL}
            color="success"
            style={{ color : 'white', borderColor: 'white' }}
            onClick={evt => this.handleSmallThumbnailButtonClick(evt)}>
              <FaTh />
          </Button>
        </ButtonGroup>

        <ButtonGroup className="float-left" style={{marginRight: "20px"}}>
          <Button outline={this.props.editMode != EDIT_MODE_EDIT}
            color="success"
            style={{ color : 'white', borderColor: 'white' }}
            onClick={evt => this.handleEditButtonClick(evt)}>
              <FaEdit />
          </Button>
        </ButtonGroup>

        {
          this.props.editMode == EDIT_MODE_EDIT &&
            <ButtonGroup className="float-left" style={{marginRight: "20px"}}>
              <Button outline color="success"
              style={{ color : 'white', borderColor: 'white' }}
              onClick={evt => this.handleClearAllButtonClick(evt)}>
                <FaSquareO />
              </Button>
              <Button outline color="success"
              style={{ color : 'white', borderColor: 'white' }}
              onClick={evt => this.handleSelectAllButtonClick(evt)}>
                <FaSquare />
              </Button>
            </ButtonGroup>
        }

        {
          this.props.editMode == EDIT_MODE_EDIT &&
            <ButtonGroup className="float-left">
              <Button outline color="success"
              style={{ color : 'white', borderColor: 'white' }}
              onClick={evt => this.handleDownloadButtonClick(evt)}>
                <FaCloudDownload />
              </Button>
            </ButtonGroup>
        }

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
