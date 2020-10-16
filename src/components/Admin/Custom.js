import React, {Component} from 'react';
import {
    Button,
    IconButton,
    Slider,
    Typography,
    TextField
} from '@material-ui/core';

import {
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    Save as SaveIcon
} from '@material-ui/icons';

import { ChevronRight } from 'react-feather';

import { withStyles } from '@material-ui/core/styles';

import {ChromePicker} from "react-color";

import { withFirebase } from '../Firebase';
import firebase from "firebase/app";
import { compose } from 'recompose';

import OutsideClickHandler from 'react-outside-click-handler';

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

  const CustomPage = () => (
    <div>
        <Custom/>
    </div>
)

class CustomBase extends Component{
    constructor(props) {
        super();
        this.state = {
            custom : undefined,
            showPickerBg:[],
            showSave : false,
            hover:false,
        }
    }
    componentDidMount() {
        this.getCustom();
    }
    getCustom = () => {
        let db = this.props.firebase.db;
        let questionsRef = db.ref("custom");
        questionsRef.on('value',(snap)=>{
          let data = snap.val();
          this.setState({
              custom : data,
          })
        });
    }

    handleUpload = (e, path) => {
        const {storage} = this.props.firebase;
        let image = e?.target?.files[0];
        if(image) {
          const uploadTask = storage.ref(`images/${image.name}`).put(image);
          uploadTask.on("state_changed", 
          snapshot => {
  
          },
          error => {
            console.log(error);
          },
          () => {
            storage.ref("images")
            .child(image.name)
            .getDownloadURL()
            .then(url => {
              this.setUpload(url, path)
            })
          })
        }
      }
  
      setUpload = (url, path) => {
        const {db} = this.props.firebase;
        let mainImage = db.ref(`custom/${path}`);
        mainImage.set(url);
      }

      onSave = () => {
        const {custom} = this.state;
        let db = this.props.firebase.db;
        let questionsRef = db.ref(`custom`);
        questionsRef.set(custom);
        this.setState({
            showSave:false,
        })
      }

    render() {
        const {classes} = this.props;
        const {custom, showPickerBg, showSave, hover} = this.state;
        return(
            <>
            <div style={{display:"flex", alignItems:"center", width:"100%"}}>
            <h1>
                Personnalisation
            </h1>
            {showSave && <SaveButton
        variant="contained"
        color="primary"
        size="small"
        disableElevation
        className={classes.button}
        startIcon={<SaveIcon/>}
        onClick={() => this.onSave()}
      >
        Sauvegarder
      </SaveButton>}
            </div>
            <p>
                Logo de la marque
            </p>
            {custom?.logo?.url ? (
                <p>
                    <img src={custom?.logo?.url} alt="logo" width={custom?.logo?.width} />
                </p>  
            ) :
            (
            <p>
                Aucun logo.
            </p>   
            )}
            <Button
        variant="contained"
        color="default"
        size="small"
        disableElevation
        className={classes.button}
        startIcon={<CloudUploadIcon />}
        component="label"
        onChange={(e) => {this.handleUpload(e, "logo/url")}}
      >
        {custom?.logo?.url ? "Remplacer" : "Téléverser"}
        <input  accept="image/*" className={classes.input} type="file" />
      </Button>
      {custom?.logo && 
      (<IconButton variant="contained" onClick={() => {}}aria-label="delete" className={classes.deleteBtn}>
         <DeleteIcon color={"default"} fontSize="small"/>
      </IconButton>)}
            <div className="categories-settings">
            <p style={{
                marginRight: "1em"
            }}>
            Taille (en px.)
            </p>
            <span>{custom?.logo?.width}px</span>

<Slider
style={{
    width:250,
    marginLeft:"2em",
}}
  value={custom?.logo?.width}
  min={30}
  step={1}
  max={200}
  valueLabelFormat={`${custom?.logo?.width}px`}
  onChange={(e, newValue) => {
      if(newValue) {
      this.setState((state) => ({
          showSave: true,
          custom : {
              ...state.custom,
              logo : {
                  ...state.custom.logo,
                  width : newValue
              }
          },
      }))
    }
  }}
  valueLabelDisplay="auto"
  aria-labelledby="non-linear-slider"
/>
            </div>

        <div className="categories-settings">
            <span>Lien (logo)</span>
            <TextField
            margin="dense"
            onChange={(e, value) => {
                let link = e.target.value;
                this.setState((state) => ({
                    custom : {
                        ...state.custom,
                        logo : {
                            ...state.custom.logo,
                            link : link
                        }
                    },
                    showSave : true,
                }))
            }}
            value={custom?.logo?.link || ''}
            label="Lien associé au logo"
            type="text"/>
        </div>

            <p>
                Couleurs de la marque
            </p>
            <div className="categories-settings">
            <span>Arrière-plan</span>
            {custom?.bgColor &&
            (
                <p style={{position:"relative"}}>
                 <button className="color-select"
                 style={{
                     backgroundColor : custom?.bgColor
                 }}
                 onClick={() => {
                    const {showPickerBg} = this.state;
                    let cp = showPickerBg;
                    showPickerBg[0] = true;
                    this.setState({
                        showPickerBg: cp,
                    });
                 }}/>
                 {
                     showPickerBg[0] && (
                        <OutsideClickHandler
                        onOutsideClick={() => {
                            const {showPickerBg} = this.state;
                            let cp = showPickerBg;
                            showPickerBg[0] = false;
                            this.setState({
                                showPickerBg: cp,
                            });
                        }}
                      >
                        <ChromePicker className="color-picker" color={custom?.bgColor} 
                        onChangeComplete={() => {
                            this.setState({
                                showSave : true,
                            })
                        }}
                        onChange={(color) => {
                            this.setState((state)=>({
                                custom : {
                                    ...state.custom,
                                    bgColor : color.hex,
                                }
                            }))
                        }}/>
                        </OutsideClickHandler>
                     )
                 }
                </p>
            )
            }
            </div>
            <div className="categories-settings">
            <span>Couleur des titres</span>
            {custom?.textColor &&
            (
                <div style={{position:"relative"}}>
                 <button className="color-select"
                 style={{
                     backgroundColor : custom?.textColor?.title
                 }}
                 onClick={() => {
                    const {showPickerBg} = this.state;
                    let cp = showPickerBg;
                    showPickerBg[1] = true;
                    this.setState({
                        showPickerBg: cp,
                    });
                 }}/>
                 {
                     showPickerBg[1] && (
                        <OutsideClickHandler
                        onOutsideClick={() => {
                            const {showPickerBg} = this.state;
                            let cp = showPickerBg;
                            showPickerBg[1] = false;
                            this.setState({
                                showPickerBg: cp,
                            });
                        }}
                      >
                        <ChromePicker className="color-picker" color={custom?.textColor?.title} 
                        onChangeComplete={() => {
                            this.setState({
                                showSave : true,
                            })
                        }}
                        onChange={(color) => {
                            this.setState((state)=>({
                                custom : {
                                    ...state.custom,
                                    textColor : {
                                        ...state.custom.textColor,
                                        title : color.hex,
                                    }
                                }
                            }))
                        }}/>
                        </OutsideClickHandler>
                     )
                 }
                </div>
            )
            }
            </div>
            <div className="categories-settings">
            <span>Couleur des descriptions</span>
            {custom?.textColor &&
            (
                <p style={{position:"relative"}}>
                 <button className="color-select"
                 style={{
                     backgroundColor :  custom?.textColor?.p
                 }}
                 onClick={() => {
                    const {showPickerBg} = this.state;
                    let cp = showPickerBg;
                    showPickerBg[2] = true;
                    this.setState({
                        showPickerBg: cp,
                    });
                 }}/>
                 {
                     showPickerBg[2] && (
                        <OutsideClickHandler
                        onOutsideClick={() => {
                            const {showPickerBg} = this.state;
                            let cp = showPickerBg;
                            showPickerBg[2] = false;
                            this.setState({
                                showPickerBg: cp,
                            });
                        }}
                      >
                        <ChromePicker className="color-picker" color={custom?.textColor?.p} 
                        onChangeComplete={() => {
                            this.setState({
                                showSave : true,
                            })
                        }}
                        onChange={(color) => {
                            this.setState((state)=>({
                                custom : {
                                    ...state.custom,
                                    textColor : {
                                        ...state.custom.textColor,
                                        p : color.hex,
                                    }
                                }
                            }))
                        }}/>
                        </OutsideClickHandler>
                     )
                 }
                </p>
            )
            }
            </div>
            <div className="categories-settings">
                <span>
                    Couleurs globales
                    (Ex. : Bouton)
                </span>
                <button className="btn-nav btn-next btn-nav-demo" 
                style={{
                    backgroundColor: custom?.primary
                }}>
                    <ChevronRight style={{
                        color:custom?.secondary
                    }}/>
                </button>
                <table>
                    <thead>
                        <tr>
                            <td>Primaire</td>
                            <td>Secondaire</td>
                        </tr>
                    </thead>
                    <tbody>
                    <tr>
            <td>
                <div style={{position:"relative"}}>
                 <button className="color-select"
                 style={{
                     backgroundColor :  custom?.primary
                 }}
                 onClick={() => {
                    const {showPickerBg} = this.state;
                    let cp = showPickerBg;
                    showPickerBg[3] = true;
                    this.setState({
                        showPickerBg: cp,
                    });
                 }}/>
                 {
                     showPickerBg[3] && (
                        <OutsideClickHandler
                        onOutsideClick={() => {
                            const {showPickerBg} = this.state;
                            let cp = showPickerBg;
                            showPickerBg[3] = false;
                            this.setState({
                                showPickerBg: cp,
                            });
                        }}
                      >
                        <ChromePicker className="color-picker" color={custom?.primary} 
                        onChangeComplete={() => {
                            this.setState({
                                showSave : true,
                            })
                        }}
                        onChange={(color) => {
                            this.setState((state)=>({
                                custom : {
                                    ...state.custom,
                                    primary: color.hex
                                }
                            }))
                        }}/>
                        </OutsideClickHandler>
                     )
                 }
                </div>
            </td>
            <td>
                <div style={{position:"relative"}}>
                 <button className="color-select"
                 style={{
                     backgroundColor :  custom?.secondary
                 }}
                 onClick={() => {
                    const {showPickerBg} = this.state;
                    let cp = showPickerBg;
                    showPickerBg[4] = true;
                    this.setState({
                        showPickerBg: cp,
                    });
                 }}/>
                 {
                     showPickerBg[4] && (
                        <OutsideClickHandler
                        onOutsideClick={() => {
                            const {showPickerBg} = this.state;
                            let cp = showPickerBg;
                            showPickerBg[4] = false;
                            this.setState({
                                showPickerBg: cp,
                            });
                        }}
                      >
                        <ChromePicker className="color-picker" color={custom?.secondary} 
                        onChangeComplete={() => {
                            this.setState({
                                showSave : true,
                            })
                        }}
                        onChange={(color) => {
                            this.setState((state)=>({
                                custom : {
                                    ...state.custom,
                                    secondary: color.hex
                                }
                            }))
                        }}/>
                        </OutsideClickHandler>
                     )
                 }
                </div>
            </td>
            </tr>
            </tbody>
            </table>
            </div>
            </>
        )
    }
}

const Custom = compose(
    withFirebase,
    withStyles(styles),
  )(CustomBase);
  
  export default CustomPage
  
  export {Custom}