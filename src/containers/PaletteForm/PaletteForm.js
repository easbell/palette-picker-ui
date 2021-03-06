import React, { Component } from 'react';
import { addProject, setProjects, addPalette, setPalettes } from '../../actions';
import { connect } from 'react-redux';
import { handleFetch } from '../../thunks/handleFetch';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal'
import './PaletteForm.css';
import cogoToast from 'cogo-toast';
import PropTypes from 'prop-types';

export class PaletteForm extends Component {
  constructor() {
    super();
    this.state = {
      paletteName: '',
      projectName: '',
      newProject: false
    }
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const newName = this.state.projectName.toUpperCase()
    const projectNames = this.props.projects.map(project => project.name)
    if (projectNames.includes(newName)) {
      cogoToast.warn(`${newName} already exists. Please choose another name for your project`, {position: 'bottom-left'})
    } else {
      this.addProject(newName)
    }
  }
  
  addProject = async (newName) => {
    const url = process.env.REACT_APP_BACKEND_URL + 'api/v1/projects/'
    const optionsObject = {
      method: 'POST',
      body: JSON.stringify({name: newName}),
      headers: { 
        'Content-Type': 'application/json'
      }
    }
    const id = await this.props.handleFetch(url, addProject, optionsObject);
    await this.props.handleFetch(url, setProjects);
    this.addPalette(id)
    cogoToast.success('Project was added.', {position: 'bottom-left'});
  }
  
  addPalette = async (projectId) => {
    const { paletteName } = this.state
    const { colors } = this.props
    const url = process.env.REACT_APP_BACKEND_URL + `api/v1/projects/${projectId.id}/palettes/`
    const allPalettesUrl = process.env.REACT_APP_BACKEND_URL + `api/v1/palettes/`    
    const optionsObject = {
      method: 'POST',
      body: JSON.stringify({
        palette_name: paletteName,
        color_1: colors.color1.color,
        color_2: colors.color2.color,
        color_3: colors.color3.color,
        color_4: colors.color4.color,
        color_5: colors.color5.color
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
    await this.props.handleFetch(url, addPalette, optionsObject)
    this.props.showForm(false);
    this.props.handleFetch(allPalettesUrl, setPalettes);
    cogoToast.success('Palette was added.', {position: 'bottom-left'});
  }

  showProjects = () => {
    const { projects } = this.props;
    return projects.map(project => {
      return <Dropdown.Item onClick={() => {this.addPalette(project)}} key={project.id}>{project.name}</Dropdown.Item>
    })
  }

  newProject = () => {
    this.setState({ newProject: true })
  }
  
  handleClose = () => {
    this.props.showForm(false);
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.handleClose} className='modal palette-form'>
        <form onSubmit={this.handleSubmit} className='form'>
          <input 
            placeholder='Name this palette'
            name='paletteName'
            className='name-input'
            value={this.state.paletteName}
            onChange={this.handleChange}
          />
          { this.state.paletteName.length >= 1 &&
            <DropdownButton id="dropdown-custom-1" title="Add To Project">
              <Dropdown.Item className="dropdown-item" onClick={this.newProject}>Add new project</Dropdown.Item>
              <div className="dropdown-divider"></div>
              {this.showProjects()}
            </DropdownButton>
          }
          { this.state.newProject &&
            <input 
              placeholder='Name this project' 
              name='projectName'
              className='project-input'
              value={this.state.projectName}
              onChange={this.handleChange}
            />
          }
          <button type='submit' className='pal-form-control disable' disabled={!this.state.paletteName || !this.state.projectName}>Save</button>
        </form>
      </Modal>
    )
  }
}

export const mapStateToProps = (state) => ({
  projects: state.projects
})

export const mapDispatchToProps = (dispatch) => ({
  handleFetch: (url, action, options) => dispatch(handleFetch(url, action, options))
})

PaletteForm.propTypes = {
  projects: PropTypes.array,
  handleFetch: PropTypes.func,
  showForm: PropTypes.func,
  colors: PropTypes.object,
}

export default connect(mapStateToProps, mapDispatchToProps)(PaletteForm)
