import React, {Component, useRef} from 'react';
import {
    Button,
    IconButton,
    Slider,
    Typography,
    TextField,
    FormControl,
    Select as SelectMUI,
    MenuItem,
} from '@material-ui/core';

import Loading from '../Loading';

import EmailEditor from 'react-email-editor';

import {
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    Save as SaveIcon,
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Visibility,
    Menu 
} from '@material-ui/icons';

import firebase from "firebase/app";

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

  const EmailingPage = (props) => (
    <div>
        <Emailing {...props}/>
    </div>
)

class EmailingBase extends Component{
    constructor(props) {
        super();
        this.state = {
            idList : [],
            id : localStorage.getItem('id-email') ? localStorage.getItem('id-email') : undefined,
            email : [],
            loading : true,
            refresh: true,
            anchorMore : undefined,
        }
        this.emailEditorRef = React.createRef();
        this.getEmailing = this.getEmailing.bind(this);
    }
    componentDidMount() {
      this.setState({
        refresh:true,
      }, () =>
        this.getEmailing())
    }
    onSave = () => {
        this.emailEditorRef.current.editor.exportHtml((data)=> {
          const {html, design} = data;
          let _design = JSON.stringify(design)
         let email = {
          design : _design,
          html : html
        }
            this.setState({
              email
            });
            this.saveDb(email);
        })
    }

    saveDb = (email) => {
      const {id} = this.state;
      console.log(email);
      let db = this.props.firebase.db;
      let emailRef = db.ref(`email/${id}`);
      emailRef.set({
        email,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        id
      });
    }

    async getEmailing() {
      let db = this.props.firebase.db;
      let emailRef = db.ref("email");
      await emailRef.on('value',(snap)=>{
        let data = snap.val();
        if(data) {
          let email = Object.keys(data).map(i => data[i]);
          let idList =  Object.keys(email).map(i => {return{value : email[i]?.id, label: email[i]?.id}});
          let id = localStorage.getItem("id-email") ? localStorage.getItem("id-email") : email[0]?.id;
          this.setState({
            idList,
            id,
          })
          this.getEmailingByRef(id);
        }
      });
  }

  newEmail = () => {
    let db = this.props.firebase.db;
    let emailRef = db.ref("email");
    let newEmailRef = emailRef.push();
    let newKey = newEmailRef.key;
    newEmailRef.set({
      email: [],
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      id : newKey
    });
    setTimeout(() => { 
      this.setState({
        id: newKey
      });
      this.getEmailingByRef(newKey);}, 1000);
  }

  getEmailingByRef = (id) => {
    let db = this.props.firebase.db;
      let emailRef = db.ref(`email/${id}`);
      emailRef.on('value',
        (dataSnapshot) => {
        let data = dataSnapshot.val();
        let email = data?.email;
        this.setState({
          email,
          refresh:true,        
        }, () => {
          this.setState({
            loading : false,
            refresh: false,
          });
          this.onLoad();
        })
      });
  }
  onLoad = () => {
    const {email} = this.state;
    let design = email?.design;
    let editor = this.emailEditorRef?.current?.editor;
    if(editor && design) {
      editor.loadDesign(JSON.parse(design));
    }
  };

    render() {
        const {classes} = this.props;
        /* const {} = this.state; */
        const {id, idList, anchorMore, loading, refresh, email} = this.state;
        return(
            <>
            {loading ?
            (<Loading />) :
            (<>
            <h1>Emailing</h1>
            <div style={{
                width:"100%",
                display:"flex",
                alignItems:"center",
                justifyContent:""
            }}>
          <FormControl required className={classes.formControl}>
        <SelectMUI
          id="demo-simple-select"
          value={id}
          onChange={(e) => {
            let id = e.target.value;
            this.getEmailingByRef(id);
            this.setState({
              id
            })
            localStorage.setItem('id-email',id);
          }}>
            {idList.map((el, id) => (
            <MenuItem key={id} value={el.value}>{`Email nº${id+1}`}</MenuItem>
            ))}
        </SelectMUI>
      </FormControl>
      <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={(e) => 
      {
        this.setState({
        anchorMore : e.currentTarget
      })
    }
    }>
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
<Menu
  id="simple-menu"
  anchorEl={anchorMore}
  open={Boolean(anchorMore)}
  onClose={() => {
    this.setState({
      anchorMore: undefined,
    })}}
>
  <MenuItem onClick={() => {
   this.onDuplicate();
  }}>Dupliquer</MenuItem>
  <MenuItem onClick={() => {
    this.onDelete();
  }}>Supprimer</MenuItem>
</Menu>
    <Button         
      className={classes.button}
      variant="contained" 
      size="small" 
      disableElevation 
      color="primary" 
      startIcon={<AddIcon/>}
      onClick={() => this.newEmail()}>
      Nouveau
    </Button>
    <SaveButton
        variant="contained"
        color="primary"
        size="small"
        disableElevation
        className={classes.button}
        startIcon={<SaveIcon/>}
        onClick={() => this.onSave()}
      >
        Sauvegarder
      </SaveButton>
      </div>
            {!refresh && (<EmailEditor ref={this.emailEditorRef} onLoad={this.onLoad}/>)}
        </>
        )}
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