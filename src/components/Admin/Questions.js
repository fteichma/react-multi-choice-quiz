
import React, { Component } from "react"
import { makeStyles, withStyles, createMuiTheme } from '@material-ui/core/styles'
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, Collapse, Box, Typography, Button, Tab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Select as SelectMUI, Menu, MenuItem, InputLabel, Popover} from '@material-ui/core'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import Select, { components } from 'react-select';
import TextField from '@material-ui/core/TextField';

import { withFirebase } from '../Firebase';
import firebase from "firebase/app";
import { compose } from 'recompose';

import Loading from '../Loading';
import SelectStyle from '../select';
import { Visibility } from "@material-ui/icons"

const NEW_QUESTION = {
  type : "",
  answers : {
    0 : {
      content : ""
    }
  },
  mainImage: "",
  question: "",
  description: ""
};

const QuestionsPage = () => (
    <div>
        <Questions/>
    </div>
)

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
}

const getItemStyle = (isDragging, draggableStyle) => ({
    // styles we need to apply on draggables
    ...draggableStyle,

    ...(isDragging && {
        background: "rgb(235,235,235)"
    })
});


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
      button: {
        margin: theme.spacing(1),
        textTransform:"none"
      },
      padding: {
        padding: theme.spacing(2),
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

class QuestionsBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show : 0,
            loading: true,
            open : {},
            openDeleteDialog: false,
            deleteIndex: null,
            editIndex:  null,
            idList : undefined,
            id : localStorage.getItem('id') ? localStorage.getItem('id') : undefined,
            openNewQuestionDialog : false,
            openEditDialog : false,
            newQuestion : NEW_QUESTION,
            items : {},
            questions: {},
            conditions: {},
            anchorMore: undefined
        }
        this.onDragEnd = this.onDragEnd.bind(this);
        this.handleChangeNewQuestionAnswers.bind(this);
        this.handleChangeNameNewQuestion.bind(this);
        this.handleChangeDescriptionNewQuestion.bind(this);
        this.handleChangeNameQuestion.bind(this);
        this.handleChangeDescriptionQuestion.bind(this);
    }

    componentDidMount() {
        this.getQuestions();
    }
    
    resetNewQuestion = () => {
      this.setState({
        newQuestion : NEW_QUESTION,
      })
    }

    resetQuestion = () => {
      this.setState((state) => ({
        questions : JSON.parse(JSON.stringify(state.items))
      }));
    }

    handleChangeNameNewQuestion = (e) => {
      let value = e.target.value;
      this.setState((state) => ({
        newQuestion : {
          ...state.newQuestion,
        question : value,
      },
      }));
    }
    handleChangeDescriptionNewQuestion = (e) => {
      let value = e.target.value;
      this.setState((state) => ({
        newQuestion : {
          ...state.newQuestion,
        description : value,
      },
      }));
    }

    handleChangeNewQuestionAnswers = (e, id) => {
      const {answers} = this.state.newQuestion;
      let value = e?.target?.value;
      let cp = answers;
      cp[id] = {content : value};
      this.setState((state, props) => ({
        newQuestion : {
          ...state.newQuestion,
        answers : cp,
      },
      }));
    }

    addNewQuestionAnswers = () => {
      const {answers} = this.state.newQuestion;
      let cp = answers;
      let length = Object.keys(answers).length;
      cp[length] = {content : ""};
      this.setState((state, props) => ({
        newQuestion : {
          ...state.newQuestion,
        answers : cp
      },
      }));
    }

    deleteNewQuestionAnswers = (id) => {
      const {answers} = this.state.newQuestion;
      let cp = answers;
      delete cp[id];
      console.log(cp);
      this.setState((state, props) => ({
        newQuestion : {
          ...state.newQuestion,
        answers : cp
      },
      }));
    }

    deleteQuestionAnswers = (id) => {
      const {editIndex, questions} = this.state;
      let copy = questions;
      delete copy[editIndex].answers[id];
      this.setState({
        questions : copy
      });
    }

    handleChangeNameQuestion = (e) => {
      const {editIndex, questions} = this.state;
      let cp = questions;
      let value = e?.target?.value;
      cp[editIndex].question = value;
      this.setState({
        questions : cp,
      });
    }

    handleChangeDescriptionQuestion = (e) => {
      const {editIndex, questions} = this.state;
      let cp = questions;
      let value = e?.target?.value;
      cp[editIndex].description = value;
      this.setState({
        questions : cp,
      });
    }

    handleChangeQuestionAnswers = (e, id) => {
      const {editIndex, questions} = this.state;
      let cp = questions;
      let value = e?.target?.value;
      cp[editIndex].answers[id] = {content : value};
      this.setState({
        questions : cp,
      });
    }

    addQuestionAnswers = () => {
      const {editIndex, questions} = this.state;
      let cp = questions;
      let answers = cp[editIndex].answers;
      let length = Object.keys(answers).length;
      cp[editIndex].answers[length] = {content : ""};
      this.setState({
        questions : cp,
      });
    }

    addNewQuestion = () => {
      const {id, items, newQuestion} = this.state;
      let length = 0;
      if(items) length = Object.keys(items).length;
      let db = this.props.firebase.db;
      let mainImage = db.ref(`questions/${id}/questions/${length}`);
      mainImage.set(newQuestion);
      this.setState({
        openNewQuestionDialog:false,
      })
      this.resetNewQuestion();
    }

    newCondition = () => {
      const {id} = this.state;
      let db = this.props.firebase.db;
      let conditionRef = db.ref(`questions/${id}/conditions`);
      let newConditionRef = conditionRef.push();
      let newKey = newConditionRef.key;
      newConditionRef.set({
        condition : [],
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        id : newKey
      });
    }

    //edit
    editQuestion = () => {
      const {id, editIndex, questions} = this.state;
      let db = this.props.firebase.db;
      let q = questions[editIndex];
      let ref = db.ref(`questions/${id}/questions/${editIndex}`);
      ref.set(q);
      this.setState({
        openEditDialog:false,
      })
      this.resetQuestion();
    }

    setOpen = (key) => {
        this.setState({
            open : {...this.state.open, [key] : this.state.open[key]? false : true}
        })
    }

    handleUploadMain = (e, index) => {
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
            this.setUploadMain(url, index)
          })
        })
      }
    }

    handleUploadAnswer = (e, index, key) => {
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
            this.setUploadAnswer(url, index, key)
          })
        })
      }
    }

    setUploadMain = (url, index) => {
      const {id} = this.state;
      let db = this.props.firebase.db;
      let mainImage = db.ref(`questions/${id}/questions/${index}/mainImage`);
      mainImage.set(url);
    }

    setUploadAnswer = (url, index, key) => {
      const {id} = this.state;
      let db = this.props.firebase.db;
      let image = db.ref(`questions/${id}/questions/${index}/answers/${key}/image`);
      image.set(url);
    }

    onDragEnd(result) { 
        // dropped outside the list
        if (!result.destination) {
            return
        }

        console.log(`dragEnd ${result.source.index} to  ${result.destination.index}`)
        const items = reorder(
            this.state.items,
            result.source.index,
            result.destination.index
        )
        this.setState({
            items,
            dragged:true
        })
    }

    showDeleteDialog = (index) => {
        this.setState({
            openDeleteDialog : true,
            deleteIndex : index
        })
    }

    showEditDialog = (index) => {
      this.setState({
          openEditDialog : true,
          editIndex : index
      })
  }

    deleteItem = () => {
        const {items, deleteIndex} = this.state;
        let copy = items;
        copy.splice(deleteIndex,1);
        this.setState({
            items : copy,
            deleteIndex: null,
            openDeleteDialog:false,
        }, () => {
          this.onSave()
        })
    }

    editItem = () => {
      const {items, editIndex} = this.state;
      this.setState({
          items,
          editIndex: null,
          openEditDialog:false,
      }, () => {
        this.onSave()
      })
  }
    onSave = () => {
      const {items,id} = this.state;
      let db = this.props.firebase.db;
      let questionsRef = db.ref(`questions/${id}`);
      questionsRef.set({
        questions : items,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        id
      });
      this.setState({
        dragged:false
      })
    }

    onDelete = () => {
      let db = this.props.firebase.db;
      const {id} = this.state;
      if(id){
        let questionsRef = db.ref(`questions/${id}`);
        questionsRef.remove();
      }
    }

    onDuplicate = () => {
      const {items} = this.state;
      let db = this.props.firebase.db;
      let questionsRef = db.ref("questions");
      let newQuestionsRef = questionsRef.push();
      let newKey = newQuestionsRef.key;
      newQuestionsRef.set({
        questions: items,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        id : newKey
      });
      setTimeout(() => { 
        this.setState({
          id: newKey
        });
        this.getQuestionsByRef(newKey);}, 1000);
    }

    newQuestions = () => {
        let db = this.props.firebase.db;
        let questionsRef = db.ref("questions");
        let newQuestionsRef = questionsRef.push();
        let newKey = newQuestionsRef.key;
        newQuestionsRef.set({
          questions: [],
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          id : newKey
        });
        setTimeout(() => { 
          this.setState({
            id: newKey
          });
          this.getQuestionsByRef(newKey);}, 1000);
      }
      newQuestion = () => {
        this.setState({
          openNewQuestionDialog : true
        })
      }

    getQuestions = () => {
        let db = this.props.firebase.db;
        let questionsRef = db.ref("questions");
        questionsRef.on('value',(snap)=>{
          let data = snap.val();
          let questions = Object.keys(data).map(i => data[i]);
          let idList =  Object.keys(questions).map(i => {return{value : questions[i].id, label: questions[i].id}});
          let id = localStorage.getItem("id") ? localStorage.getItem("id") : questions[0].id;
          this.setState({
            idList,
            id
          })
          this.getQuestionsByRef(id);
        });
    }

    getQuestionsByRef(id) {
      let db = this.props.firebase.db;
        let questionsRef = db.ref(`questions/${id}`);
        questionsRef.on('value',(snap)=>{ 
          let data = snap.val();
          let questions = data?.questions;
          let conditions = data?.conditions;
          let items = JSON.parse(JSON.stringify(questions));
          this.setState({
            loading : false,
            questions,
            conditions,
            items
          })
        });
    }

    render() {
        const {classes} = this.props;
        const {dragged, items, loading, open, openDeleteDialog, openEditDialog, openNewQuestionDialog, deleteIndex, editIndex, anchorMore, idList, id, conditions} = this.state;
        return loading ? ( <Loading /> ) : ( 
            <>
            <h1>Questions</h1>
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
            this.getQuestionsByRef(e.target.value);
            this.setState({
              id: e.target.value
            })
            localStorage.setItem('id',e.target.value);
          }}>
            {idList.map((el, id) => (
            <MenuItem key={id} value={el.value}>{`Questionnaire nº${id+1}`}</MenuItem>
            ))}
        </SelectMUI>
      </FormControl>
      <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={(e) => 
      {
        let currentTarget = e.currentTarget;
        this.setState({
        anchorMore : currentTarget
      })
    }
    }>
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
<Menu
  id="simple-menu"
  anchorEl={anchorMore}
  open={anchorMore}
  keepMounted
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'right',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'right',
  }}
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
      target="_blank" 
      href={`${window.location.origin}/?id=${id}`}
      size="small" 
      disableElevation 
      color="secondary" 
      startIcon={<Visibility/>}
      >
      Visualiser
    </Button>
    <Button         
      className={classes.button}
      variant="contained" 
      size="small" 
      disableElevation 
      color="primary" 
      startIcon={<AddIcon/>}
      onClick={() => this.newQuestions()}>
      Nouveau
    </Button>
    {dragged && <SaveButton
        variant="contained"
        color="primary"
        size="small"
        disableElevation
        className={classes.button}
        startIcon={<SaveIcon/>}
        disabled={!dragged}
        onClick={() => this.onSave()}
      >
        Sauvegarder
      </SaveButton>}
      </div>
            <Paper className={classes.root}>
            <TableContainer className={classes.container}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell/>
                            <TableCell>#</TableCell>
                            <TableCell>Questions</TableCell>
                            <TableCell alignRight/>
                        </TableRow>
                    </TableHead>
                    <TableBody component={DroppableComponent(this.onDragEnd)}>
                        {items?.map((item, index) => (
                            <React.Fragment key={index}>
                            <TableRow className={classes.tableRow} component={DraggableComponent(index.toString(), index)}>
                                <TableCell>
                                    <IconButton aria-label="expand row" size="small" onClick={() => this.setOpen(index)}>
                                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </IconButton>
                                </TableCell>
                                <TableCell scope="row">{index + 1}</TableCell>
                                <TableCell>{item.question}</TableCell>
                                <TableCell alignRight>
                                    <IconButton aria-label="edit" onClick={() => this.showEditDialog(index)} disabled={dragged} className={classes.deleteBtn}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton aria-label="delete" onClick={() => this.showDeleteDialog(index)} disabled={dragged} className={classes.deleteBtn}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                              <Collapse in={open[index]} timeout="auto" unmountOnExit>
                                <Box margin={1}>
                                <div>
                                    <span><b>Image principale</b></span>                                    
                                        <Button
        variant="contained"
        color="default"
        size="small"
        disableElevation
        className={classes.button}
        startIcon={<CloudUploadIcon />}
        disabled={dragged}
        component="label"
        onChange={(e) => this.handleUploadMain(e, index)}
      >
        {item.mainImage ? "Remplacer" : "Téléverser"}
        <input disabled={dragged}  accept="image/*" className={classes.input} type="file" />
      </Button>
      {item.mainImage && 
      (<IconButton disabled={dragged} variant="contained" onClick={() => this.setUploadMain("",index)}aria-label="delete" className={classes.deleteBtn}>
         <DeleteIcon fontSize="small" disabled={dragged}/>
      </IconButton>)
      }
            {item.mainImage &&
      (<div>
        <img width="50" src={item.mainImage} />
      </div>)
    }
      </div>
      <div style={{marginBottom:"1.5em"}}>
      <p><b>Description</b></p> 
      {item.description ? (
      <p>{item.description}</p>
      ) : (
        <p>Aucune description</p>
      )}
      </div>
      
                                
                                  <Table size="small" aria-label="purchases">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Numéro</TableCell>
                                                <TableCell>Nom/Contenu</TableCell>
                                                {(item.type === "radio" || item.type==="checkbox") && (<TableCell>Image</TableCell>)}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                  {item.answers.map((el, key, array) => {
                                      return(
                                        <TableRow key={key+"_answers"}>
                                          <TableCell scope="row">
                                              {`${key+1}`}
                                          </TableCell>
                                          <TableCell>
                                              {el.content}
                                          </TableCell>
                                          <TableCell>
                                          {(item.type === "radio" || item.type==="checkbox") && !el.image ? (
                                          <IconButton color="primary" disabled={dragged} aria-label="upload picture" component="label" onChange={(e) => this.handleUploadAnswer(e, index, key)}>
                                            <PhotoCamera />
                                            <input accept="image/*" className={classes.input} id="icon-button-file" type="file" />
                                          </IconButton>
                                    ) : el.image &&
                                    ( 
                                        <>
                                          <img src={el.image} style={{maxWidth:80}}/>
                                          <IconButton disabled={dragged} variant="contained" onClick={() => this.setUploadAnswer("",index, key)} aria-label="delete" className={classes.deleteBtn}>
                                            <DeleteIcon fontSize="small" disabled={dragged}/>
                                          </IconButton>
                                        </>
                                    )}
                                          </TableCell>
                                        </TableRow>
                                  )})}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                          </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </Paper>
            <Button         
      className={classes.button}
      variant="contained" 
      size="small" 
      disableElevation 
      color="primary" 
      startIcon={<AddIcon/>}
      onClick={() => this.newQuestion()}>
      Ajouter une question
    </Button>
            <h1>Emailing/Résumé</h1>
            {Object.keys(conditions).map((el, id) => (
                  <p>{conditions[id]}</p>
                
            ))}
                        <Button         
      className={classes.button}
      variant="contained" 
      size="small" 
      disableElevation 
      color="primary" 
      startIcon={<AddIcon/>}
      onClick={() => this.newCondition()}>
      Ajouter une condition
    </Button>
            <Dialog
        open={openDeleteDialog}
        onClose={() => {
            this.setState({
                deleteIndex : null,
                openDeleteDialog : false,
            }) 
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Êtes-vous sûr de vouloir supprimer cette question ?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Cette action est irréversible
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
              this.setState({
                  deleteIndex : null,
                  openDeleteDialog : false,
              })
          }} color="primary">
            Annuler
          </Button>
          <DeleteButton onClick={() => {
              this.deleteItem()
          }} autoFocus color="primary" variant="contained">
            Supprimer
          </DeleteButton>
        </DialogActions>
      </Dialog>
      <Dialog fullWidth open={openNewQuestionDialog} onClose={() => {
        this.setState({
          openNewQuestionDialog : false,
        })
      }} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Ajouter une question</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            onChange={(e) => this.handleChangeNameNewQuestion(e)}
            value={this.state.newQuestion?.question || ''}
            label="Question"
            type="text"
            fullWidth
          />
          <TextField
            margin="dense"
            onChange={(e) => this.handleChangeDescriptionNewQuestion(e)}
            value={this.state.newQuestion?.description || ''}
            label="Description"
            type="text"
            fullWidth
          />
          <FormControl required className={classes.formControl}>
        <InputLabel id="simple-select-label">Type</InputLabel>
        <SelectMUI
          labelId="simple-select-label"
          id="simple-select"
          value={this.state.newQuestion?.type || ''}
          onChange={(e) => {
            this.setState((state, props) => ({
              newQuestion : {
                ...state.newQuestion,
              type : e.target.value,
              answers: {
                0 : {
                  content : ""
                }
              },
            },
            }));
          }}>
          <MenuItem value={'text'}>Entrée</MenuItem>
          <MenuItem value={'number'}>Nombre</MenuItem>
          <MenuItem value={'email'}>Email</MenuItem>
          <MenuItem value={'radio'}>Sélection</MenuItem>
          <MenuItem value={'checkbox'}>Multi-sélection</MenuItem>
        </SelectMUI>
      </FormControl>
      {this.state.newQuestion?.type === "number" && (
        <TextField
        required
        margin="dense"
        label="Ex. : âge"
        type="text"
        onChange={(e) => this.handleChangeNewQuestionAnswers(e, 0)}
        value={
          this.state.newQuestion.answers[0]?.content || ''
        }
        fullWidth />          
      )}
      {this.state.newQuestion?.type === "text" && (
        <TextField
        required
        margin="dense"
        label="Ex. : Prénom"
        type="text"
        onChange={(e) => this.handleChangeNewQuestionAnswers(e, 0)}
        value={
          this.state.newQuestion.answers[0]?.content || ''
        }
        fullWidth />
      )}
      {this.state.newQuestion?.type === "email" && (
        <TextField
          required
          margin="dense"
          label="Ex. : Email"
          type="text"
          onChange={(e) => this.handleChangeNewQuestionAnswers(e, 0)}
          value={
            this.state.newQuestion.answers[0]?.content || ''
          }
          fullWidth />
      )}
      {this.state.newQuestion?.type === "checkbox" && (
        <>
        {Object.keys(this.state.newQuestion.answers).map((el,id) =>
          (
            <div style={{
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
            }}>
          <TextField
          required
          margin="dense"
          label={`Option n°${id+1}`}
          value={
            this.state.newQuestion.answers[`${id}`]?.content || ''
          }
          onChange={(e) => this.handleChangeNewQuestionAnswers(e, id)}
          type="text"
          fullWidth />
          <IconButton aria-label="delete" onClick={() => this.deleteNewQuestionAnswers(id)} className={classes.deleteBtn}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
          </div>
          )
        )}
          <Button onClick={() => this.addNewQuestionAnswers()} color="primary" variant="contained" size="small">
            Ajouter un champ
          </Button>
        </>
      )}
      {this.state.newQuestion?.type === "radio" && (
                <>
                {Object.keys(this.state.newQuestion.answers).map((el,id) =>
                  (<div style={{
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center"
                  }}>
                  <TextField
                  required
                  margin="dense"
                  label={`Option n°${id+1}`}
                  value={
                    this.state.newQuestion.answers[`${id}`]?.content || ''
                  }
                  onChange={(e) => this.handleChangeNewQuestionAnswers(e, id)}
                  type="text"
                  fullWidth />
                  <IconButton aria-label="delete" onClick={() => this.deleteNewQuestionAnswers(id)} className={classes.deleteBtn}>
                  <DeleteIcon fontSize="small" />
              </IconButton>
              </div>
                  )
                )}
                  <Button onClick={() => this.addNewQuestionAnswers()} color="primary" variant="contained" size="small">
                    Ajouter un champ
                  </Button>
                </>
      )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            this.setState({
              openNewQuestionDialog: false,
            });
            this.resetNewQuestion();
          }} color="primary">
            Annuler
          </Button>
          <Button 
          disabled={!this.state.newQuestion.answers[0]?.content || !this.state.newQuestion.question}
          onClick={() => 
          this.addNewQuestion()
          } color="primary" variant="contained">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
      
      
      
      
      
      
      <Dialog fullWidth open={openEditDialog} onClose={() => {
        this.setState({
          openEditDialog : false,
        })
      }} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Modifier une question</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            onChange={(e) => this.handleChangeNameQuestion(e)}
            value={this.state.questions[editIndex]?.question || ''}
            label="Question"
            type="text"
            fullWidth
          />
          <TextField
            margin="dense"
            onChange={(e) => this.handleChangeDescriptionQuestion(e)}
            value={this.state.questions[editIndex]?.description || ''}
            label="Description"
            type="text"
            fullWidth
          />
          <FormControl required className={classes.formControl}>
        <InputLabel id="simple-select-label">Type</InputLabel>
        <SelectMUI
          labelId="simple-select-label"
          id="simple-select"
          value={this.state.questions[editIndex]?.type || ''}
          onChange={(e) => {
            let value = e.target.value;
            this.setState((state, props) => ({
              questions : {
                ...state.questions,
                [state.editIndex] : {
                  ...state.questions[state.editIndex],
                  type : value,
                  answers: {
                    0 : {
                      content : ""
                    }
                  }
                },
            },
            }));
          }}>
          <MenuItem value={'text'}>Entrée</MenuItem>
          <MenuItem value={'number'}>Nombre</MenuItem>
          <MenuItem value={'email'}>Email</MenuItem>
          <MenuItem value={'radio'}>Sélection</MenuItem>
          <MenuItem value={'checkbox'}>Multi-sélection</MenuItem>
        </SelectMUI>
      </FormControl>
      {this.state.questions[editIndex]?.type === "number" && (
        <TextField
        required
        margin="dense"
        label="Ex. : âge"
        type="text"
        onChange={(e) => this.handleChangeQuestionAnswers(e, 0)}
        value={
          this.state.questions[editIndex]?.answers[0]?.content || ''
        }
        fullWidth />
      )}
      {this.state.questions[editIndex]?.type === "text" && (
        <TextField
        required
        margin="dense"
        label="Ex. : Prénom"
        type="text"
        onChange={(e) => this.handleChangeQuestionAnswers(e, 0)}
        value={
          this.state.questions[editIndex]?.answers[0]?.content || ''
        }
        fullWidth />
      )}
      {this.state.questions[editIndex]?.type === "email" && (
        <TextField
          required
          margin="dense"
          label="Ex. : Email"
          type="text"
          onChange={(e) => this.handleChangeQuestionAnswers(e, 0)}
          value={
            this.state.questions[editIndex]?.answers[0]?.content || ''
          }
          fullWidth />
      )}
      {this.state.questions[editIndex]?.type === "checkbox" && (
        <>
        {Object.keys(this.state.questions[editIndex]?.answers).map((el,id) =>
          (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
          <TextField
          required
          margin="dense"
          label={`Option n°${id+1}`}
          value={
            this.state.questions[editIndex]?.answers[`${id}`]?.content || ''
          }
          onChange={(e) => this.handleChangeQuestionAnswers(e, id)}
          type="text"
          fullWidth />
                    <IconButton aria-label="delete" onClick={() => this.deleteQuestionAnswers(id)} className={classes.deleteBtn}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
          </div>
          )
        )}
          <Button onClick={() => this.addQuestionAnswers()} color="primary" variant="contained" size="small">
            Ajouter un champ
          </Button>
        </>
      )}
      {this.state.questions[editIndex]?.type === "radio" && (
                <>
                {Object.keys(this.state.questions[editIndex]?.answers).map((el,id) =>
                  (
                    <div style={{
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center"
                    }}>
                  <TextField
                  required
                  margin="dense"
                  label={`Option n°${id+1}`}
                  value={
                    this.state.questions[editIndex]?.answers[`${id}`]?.content || ''
                  }
                  onChange={(e) => this.handleChangeQuestionAnswers(e, id)}
                  type="text"
                  fullWidth />
                            <IconButton aria-label="delete" onClick={() => this.deleteQuestionAnswers(id)} className={classes.deleteBtn}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                  </div>
                  )
                )}
                  <Button onClick={() => this.addQuestionAnswers()} color="primary" variant="contained" size="small">
                    Ajouter un champ
                  </Button>
                </>
      )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            this.setState({
              openEditDialog: false,
            });
            this.resetQuestion();
          }} color="primary">
            Annuler
          </Button>
          <Button 
          disabled={!this.state.questions[editIndex]?.answers[0]?.content || !this.state.questions[editIndex]?.question}
          onClick={() => 
          this.editQuestion()
          } color="primary" variant="contained">
            Modifier
          </Button>
        </DialogActions>
      </Dialog>
          
            </>
        )
    }
}

const DraggableComponent = (id, index) => (props) => {
    return (
        <Draggable draggableId={id} index={index}>
            {(provided, snapshot) => (
                <TableRow
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}

                    {...props}
                >
                    {props.children}
                </TableRow>
            )}
        </Draggable>
    )
}

const DroppableComponent = (
    onDragEnd: (result, provided) => void) => (props) =>
{
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={'1'} direction="vertical">
                {(provided) => {
                    return (
                        <TableBody ref={provided.innerRef} {...provided.droppableProps} {...props}>
                            {props.children}
                            {provided.placeholder}
                        </TableBody>
                    )
                }}
            </Droppable>
        </DragDropContext>
    )
}

const Questions = compose(
    withFirebase,
    withStyles(styles),
  )(QuestionsBase);
  
  export default QuestionsPage
  
  export {Questions}