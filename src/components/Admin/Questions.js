
import React, { Component } from "react"
import { makeStyles, withStyles, createMuiTheme } from '@material-ui/core/styles'
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, Collapse, Box, Typography, Button, Tab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import red from '@material-ui/core/colors/red';

import { withFirebase } from '../Firebase';
import firebase from "firebase/app";
import { compose } from 'recompose';

import Loading from '../Loading';
import { RedeemRounded } from "@material-ui/icons"

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
      color: red[500],
      '&:hover': {
        color: red[700],
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
        }
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    componentDidMount() {
        this.getQuestions();
    }

    setOpen = (key) => {
        this.setState({
            open : {...this.state.open, [key] : this.state.open[key]? false : true}
        })
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
        })
    }

    /* onSave = () => {
        const {items} = this.state;
      const timestamp = firebase.firestore.FieldValue.serverTimestamp;
      let date = new Date();
      db.collection('answers').add({answers, createdAt: timestamp(), date : date.toLocaleString()}).catch((error) => {
        console.log(error.message);
      })
    } */

    newQuestions() {
        let db = this.props.firebase.db;
        let questionsRef = db.ref("questions");
        let newQuestionsRef = questionsRef.push();
        newQuestionsRef.set({
          questions: [],
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          open : {},
          dragged : false,
        });
      }

    getQuestions() {
        let db = this.props.firebase.db;
        let questionsRef = db.ref("questions");
        questionsRef.on('value',(snap)=>{
          let data = snap.val();
          let questions = Object.keys(data).map(i => data[i]);
          let items =  Object.keys(questions).map(i => questions[i]);
          this.setState({
            questions : questions[0].questions,
            items : items[0].questions,
            loading : false,
          })
        });
    }

    render() {
        const {classes} = this.props;
        const {dragged, items, questions, loading, open, openDeleteDialog, deleteIndex} = this.state;
        return loading ? ( <Loading /> ) : ( 
            <>
            <div style={{
                width:"100%",
                display:"flex",
                alignItems:"center",
                justifyContent:"space-between"
            }}>
            <h1>Questionnaires</h1>
        {dragged && <Button
        variant="contained"
        color="primary"
        size="small"
        disableElevation
        className={classes.button}
        startIcon={<SaveIcon/>}
        disabled={!dragged}
        onClick={this.onSave}
      >
        Sauvegarder
      </Button>}
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
      <input disabled={dragged} accept="image/*" className={classes.input} id="contained-button-file" type="file" />
                                        <label htmlFor="contained-button-file">
                                        <Button
        variant="contained"
        color="default"
        size="small"
        disableElevation
        className={classes.button}
        startIcon={<CloudUploadIcon />}
        disabled={dragged}
      >
        {item.image ? "Remplacer" : "Téléverser"}
      </Button>
                                        </label>
      {item.image && 
      (<IconButton disabled={dragged} variant="contained" color="red" aria-label="delete" className={classes.deleteBtn} onClick={(e)=>{
          console.log(e)
          }}>
         <DeleteIcon fontSize="small" disabled={dragged}/>
      </IconButton>)
      }
      </div>
                                
                                  <Table size="small" aria-label="purchases">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Numéro</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Nom/Contenu</TableCell>
                                                <TableCell>Image</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                  {item.answers.map((el, key) => {
                                      return(
                                        <TableRow key={key+"_answers"}>
                                          <TableCell scope="row">
                                              {`${key+1}`}
                                          </TableCell>
                                          <TableCell>
                                              {el.type}
                                          </TableCell>
                                          <TableCell>
                                              {el.content}
                                          </TableCell>
                                          <TableCell>
                                          {el.type === "radio" && !el.image ? (
                                        <>
                                        <input accept="image/*" className={classes.input} id="icon-button-file" type="file" />
                                        <label htmlFor="icon-button-file">
                                          <IconButton color="primary" disabled={dragged} aria-label="upload picture" component="span">
                                            <PhotoCamera />
                                          </IconButton>
                                        </label>
                                        </>
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
          }} autoFocus color="primary">
            Supprimer
          </DeleteButton>
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