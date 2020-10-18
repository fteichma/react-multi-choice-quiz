import React, {Component} from 'react';
import {
    Button,
    IconButton,
    Slider,
    Typography,
    TextField
} from '@material-ui/core';

import EmailEditor from 'react-email-editor';

import {
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    Save as SaveIcon
} from '@material-ui/icons';


import { withStyles } from '@material-ui/core/styles';

import { withFirebase } from '../Firebase';
import { compose } from 'recompose';

import {
    red,
    green
} from '@material-ui/core/colors';


const styles = (theme) => ({
    root: {
      width : "100%"
    },
    formControl: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      minWidth: 120,
    },
    tableRow: {
      '& > *': {
        borderBottom: 'unset',
      },
    },
    table: {
      minWidth : 750
    },
    input: {
        display: 'none',
      },
      container: {
        maxHeight: "90vh",
      },
      button: {
        margin: theme.spacing(1),
        textTransform:"none"
      },
  });

const DeleteButton = withStyles((theme) => ({
    root: {
      backgroundColor: red[500],
      '&:hover': {
        backgroundColor: red[700],
      },
    },
  }))(Button);

  const SaveButton = withStyles((theme) => ({
    root: {
      backgroundColor: green[500],
      '&:hover': {
        backgroundColor: green[700],
      },
    },
  }))(Button);

  const EmailingPage = () => (
    <div>
        <Emailing/>
    </div>
)

class EmailingBase extends Component{
    constructor(props) {
        super();
        this.state = {
            emailing : undefined,
        }
        this.emailEditorRef = React.createRef();
    }
    componentDidMount() {
        this.getEmailing();
    }
    exportHtml = () => {
        this.emailEditorRef.current.editor.exportHtml((data)=> {
            const {design,html} = data;
            console.log('exportHtml', html);
        });
    }
    getEmailing = () => {
        let db = this.props.firebase.db;
        let questionsRef = db.ref("emailing");
        questionsRef.on('value',(snap)=>{
          let data = snap.val();
          this.setState({
              emailing : data,
          })
          if(data) {
              this.emailEditorRef.current.editor.loadDesign(data)
          }
        });
    }

    onLoad = () => {

    }

    render() {
        const {classes} = this.props;
        /* const {} = this.state; */
        return(
            <>
            <h1>Emailing</h1>
            <button onClick={() => this.exportHtml()}>Export HTML</button>
            <EmailEditor
        ref={this.emailEditorRef}
        onLoad={() => this.onLoad()}
      />
            </>
        )
    }
}

const Emailing = compose(
    withFirebase,
    withStyles(styles),
  )(EmailingBase);
  
  export default EmailingPage
  
  export {Emailing}