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
import FaEdit from 'react-icons/lib/fa/edit';

import 'react-select/dist/react-select.css';
import './AppActionBar.css';

class AppActionBar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      values: []
    };

    this.handleTagFilterSelectChange = this.handleTagFilterSelectChange.bind(this);
  }

  handleTagFilterSelectChange(values) {
    console.log("Selected:", values);
    this.setState({ values });
  }

  render() {
    return (
      <div className="clearfix" style={{ padding: '.5rem', margin: '0px' }}>
        <ButtonGroup className="float-left" style={{marginRight: "20px"}}>
          <Button outline color="success" style={{ color : 'white', borderColor: 'white' }}><FaList /></Button>
          <Button outline color="success" style={{ color : 'white', borderColor: 'white' }}><FaThLarge /></Button>
        </ButtonGroup>

        <ButtonGroup className="float-left">
          <Button outline color="success" style={{ color : 'white', borderColor: 'white' }}><FaEdit /></Button>
        </ButtonGroup>
        <div className="float-right">
          <Select
            style={{width: "250px", backgroundColor: 'transparent', borderColor: 'white' }}
            multi
            name="tag-filter"
            onChange={this.handleTagFilterSelectChange}
            removeSelected={true}
            options={[
              {value: 'persona5', label: 'persona5'},
              {value: 'persona4', label: 'persona4'}
            ]}
            value={this.state.values}
          />
        </div>
      </div>
    );
  }
}

export default AppActionBar;
