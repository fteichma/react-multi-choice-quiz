
import React, { Component } from "react"
import { makeStyles, withStyles, createMuiTheme } from '@material-ui/core/styles'
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, Collapse, Box, Typography, Button, Tab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Select as SelectMUI, MenuItem, InputLabel} from '@material-ui/core'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
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

class QuestionsBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show : 0,
            loading: true,
            open : {},
            openDeleteDialog: false,
            deleteIndex: null,
            idList : undefined,
            id : localStorage.getItem('id') ? localStorage.getItem('id') : undefined,
            openNewQuestionDialog : false,
            newQuestion : NEW_QUESTION,
            items : {},
            questions: {}
        }
        this.onDragEnd = this.onDragEnd.bind(this);
        this.handleChangeNewQuestionAnswers.bind(this);
        this.handleChangeName.bind(this);
        this.handleChangeDescription.bind(this);
    }

    componentDidMount() {
        this.getQuestions();
    }
    
    resetNewQuestion = () => {
      this.setState({
        newQuestion : NEW_QUESTION,
      })
    }

    handleChangeName = (e) => {
      let value = e.target.value;
      this.setState((state) => ({
        newQuestion : {
          ...state.newQuestion,
        question : value,
      },
      }));
    }
    handleChangeDescription = (e) => {
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

    setUploadMain = (url, index) => {
      const {id} = this.state;
      let db = this.props.firebase.db;
      let mainImage = db.ref(`questions/${id}/questions/${index}/mainImage`);
      mainImage.set(url);
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
        /* let db = this.props.firebase.db;
        let questionsRef = db.ref("questions");
        let newQuestionsRef = questionsRef.push();
        let newKey = newQuestionsRef.key;
        newQuestionsRef.set({
          questions: [],
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          id : newKey
        }); */
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
          this.setState({
            loading : false,
            questions,
            items :  questions,
          })
        });
    }

    render() {
        const {classes} = this.props;
        const {dragged, items, loading, open, openDeleteDialog, openNewQuestionDialog, deleteIndex, idList, id} = this.state;
        return loading ? ( <Loading /> ) : ( 
            <>
            <div style={{
                width:"100%",
                display:"flex",
                alignItems:"center",
                justifyContent:""
            }}>
      {/* <span style={{
        margin: "0 1em"
      }}><Select
						blurInputOnSelect={false}
						tabSelectsValue={false}
						menuShouldScrollIntoView={true}
						styles={SelectStyle('160px').default}
						isSearchable
						menuPlacement={'auto'}
						onChange={(e)=>{
              this.getQuestionsByRef(e.value);
              this.setState({
                id: e.value
              })
              localStorage.setItem('id',e.value);
            }}
            options={idList}
            value={{value:id,label:id}}
						placeholder={'Identifiant'}
					/></span> */}
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
            <MenuItem value={el.value}>{`Questionnaire nº${id+1}`}</MenuItem>
            ))}
        </SelectMUI>
      </FormControl>
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
                            <TableCell/>
                        </TableRow>
                    </TableHead>
                    <TableBody component={DroppableComponent(this.onDragEnd)}>
                        {items?.map((item, index) => (
                            <React.Fragment>
                            <TableRow className={classes.tableRow} component={DraggableComponent(index.toString(), index)} key={index} >
                                <TableCell>
                                    <IconButton aria-label="expand row" size="small" onClick={() => this.setOpen(index)}>
                                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </IconButton>
                                </TableCell>
                                <TableCell scope="row">{index + 1}</TableCell>
                                <TableCell>{item.question}</TableCell>
                                <TableCell>
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
         <DeleteIcon color={red[500]} fontSize="small" disabled={dragged}/>
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
                                                <TableCell>Image</TableCell>
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
                                          {array.type === "radio" && !el.image ? (
                                          <IconButton color="primary" disabled={dragged} aria-label="upload picture" component="label">
                                            <PhotoCamera />
                                            <input accept="image/*" className={classes.input} id="icon-button-file" type="file" />
                                          </IconButton>
                                    ) : el.image ?
                                    ( 
                                        <>
                                        <img src={el.image} style={{maxWidth:80}}/>
                                        </>
                                    )
                                    :
                                    (
                                        "/"
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
            onChange={(e) => this.handleChangeName(e)}
            value={this.state.newQuestion?.question || ''}
            label="Question"
            type="text"
            fullWidth
          />
          <TextField
            margin="dense"
            onChange={(e) => this.handleChangeDescription(e)}
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
          (<TextField
          required
          margin="dense"
          label={`Option n°${id+1}`}
          value={
            this.state.newQuestion.answers[`${id}`]?.content || ''
          }
          onChange={(e) => this.handleChangeNewQuestionAnswers(e, id)}
          type="text"
          fullWidth />)
        )}
          <Button onClick={() => this.addNewQuestionAnswers()} color="primary" variant="contained" size="small">
            Ajouter un champ
          </Button>
        </>
      )}
      {this.state.newQuestion?.type === "radio" && (
                <>
                {Object.keys(this.state.newQuestion.answers).map((el,id) =>
                  (<TextField
                  required
                  margin="dense"
                  label={`Option n°${id+1}`}
                  value={
                    this.state.newQuestion.answers[`${id}`]?.content || ''
                  }
                  onChange={(e) => this.handleChangeNewQuestionAnswers(e, id)}
                  type="text"
                  fullWidth />)
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