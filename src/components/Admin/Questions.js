import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Select,
  Menu,
  MenuItem,
  InputLabel,
  Chip,
  Input,
} from "@material-ui/core";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import SaveIcon from "@material-ui/icons/Save";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import red from "@material-ui/core/colors/red";
import green from "@material-ui/core/colors/green";
import TextField from "@material-ui/core/TextField";

import Resizer from "react-image-file-resizer";

import { withFirebase } from "../Firebase";
import firebase from "firebase/app";
import { compose } from "recompose";

import Loading from "../Loading";
import { Visibility } from "@material-ui/icons";

const NEW_QUESTION = {
  type: "",
  answers: {
    0: {
      content: "",
    },
  },
  mainImage: "",
  question: "",
  description: "",
};

const NEW_CONDITION = {
  0: {
    question: "",
    operator: "",
    value: "",
    next: "",
  },
};

const QuestionsPage = () => (
  <div>
    <Questions />
  </div>
);

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
  // styles we need to apply on draggables
  ...draggableStyle,

  ...(isDragging && {
    background: "rgb(235,235,235)",
  }),
});

const getStyles = (content, items) => {
  return {
    fontWeight:
      items
        .map((item) => {
          return item.content;
        })
        .indexOf(content) === -1
        ? 500
        : 900,
  };
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const styles = (theme) => ({
  root: {
    width: "100%",
  },
  formControl: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    minWidth: 160,
  },
  tableRow: {
    "& > *": {
      borderBottom: "unset",
    },
  },
  table: {
    minWidth: 750,
  },
  input: {
    display: "none",
  },
  button: {
    margin: theme.spacing(1),
    textTransform: "none",
  },
  padding: {
    padding: theme.spacing(2),
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
});

const DeleteButton = withStyles((theme) => ({
  root: {
    backgroundColor: red[500],
    "&:hover": {
      backgroundColor: red[700],
    },
  },
}))(Button);

const SaveButton = withStyles((theme) => ({
  root: {
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[700],
    },
  },
}))(Button);

class QuestionsBase extends Component {
  constructor(props) {
    super();
    this.state = {
      show: 0,
      loading: true,
      open: {},
      openDeleteDialog: false,
      deleteIndex: null,
      editIndex: null,
      idList: [],
      id: localStorage.getItem("id") ? localStorage.getItem("id") : undefined,
      idListEmail: [],
      openNewQuestionDialog: false,
      openEditDialog: false,
      newQuestion: NEW_QUESTION,
      items: [],
      questions: {},
      conditions: [],
      anchorMore: undefined,
      saveConditions: false,
    };
    this.onDragEnd = this.onDragEnd.bind(this);
    this.handleChangeNewQuestionAnswers = this.handleChangeNewQuestionAnswers.bind(
      this
    );
    this.handleChangeNameNewQuestion = this.handleChangeNameNewQuestion.bind(
      this
    );
    this.handleChangeDescriptionNewQuestion = this.handleChangeDescriptionNewQuestion.bind(
      this
    );
    this.handleChangeNameQuestion = this.handleChangeNameQuestion.bind(this);
    this.handleChangeDescriptionQuestion = this.handleChangeDescriptionQuestion.bind(
      this
    );
    this.handleChangeY = this.handleChangeY.bind(this);
    this.handleChangeX = this.handleChangeX.bind(this);
  }

  /* shouldComponentUpdate(nextProps, nextState) {
    return nextState.items !== this.state.items;
  } */

  componentDidMount() {
    this.getQuestions();
    this.getEmailing();
  }

  handleChangeMultiple = (e, id, key) => {
    const { conditions } = this.state;
    const { value } = e.target;
    let cp = conditions;
    cp[id].conditions[key].value = value;
    console.log(value);
    this.setState({
      conditions: cp,
    });
  };

  async getEmailing() {
    let db = this.props.firebase.db;
    let emailRef = db.ref("email");
    await emailRef.on("value", (snap) => {
      let data = snap.val();
      if (data) {
        let email = Object.keys(data).map((i) => data[i]);
        if (email) {
          let idListEmail = Object.keys(email).map((i) => {
            return { value: email[i]?.id, label: email[i]?.id };
          });
          this.setState({
            idListEmail,
            email: data,
          });
        }
      }
    });
  }

  resetNewQuestion = () => {
    this.setState({
      newQuestion: NEW_QUESTION,
    });
  };

  resetQuestion = () => {
    this.setState((state) => ({
      questions: JSON.parse(JSON.stringify(state.items)),
    }));
  };

  handleChangeNameNewQuestion = (e) => {
    let value = e.target.value;
    this.setState((state) => ({
      newQuestion: {
        ...state.newQuestion,
        question: value,
      },
    }));
  };
  handleChangeDescriptionNewQuestion = (e) => {
    let value = e.target.value;
    this.setState((state) => ({
      newQuestion: {
        ...state.newQuestion,
        description: value,
      },
    }));
  };

  handleChangeNewQuestionAnswers = (e, id) => {
    const { answers } = this.state.newQuestion;
    let value = e?.target?.value;
    let cp = answers;
    cp[id] = { content: value };
    this.setState((state, props) => ({
      newQuestion: {
        ...state.newQuestion,
        answers: cp,
      },
    }));
  };

  addNewQuestionAnswers = () => {
    const { answers } = this.state.newQuestion;
    let cp = answers;
    let length = Object.keys(answers).length;
    cp[length] = { content: "" };
    this.setState((state, props) => ({
      newQuestion: {
        ...state.newQuestion,
        answers: cp,
      },
    }));
  };

  deleteNewQuestionAnswers = (id) => {
    const { answers } = this.state.newQuestion;
    let cp = answers;
    delete cp[id];
    console.log(cp);
    this.setState((state, props) => ({
      newQuestion: {
        ...state.newQuestion,
        answers: cp,
      },
    }));
  };

  deleteQuestionAnswers = (id) => {
    const { editIndex, questions } = this.state;
    let copy = questions;
    delete copy[editIndex].answers[id];
    this.setState({
      questions: copy,
    });
  };

  handleChangeNameQuestion = (e) => {
    const { editIndex, questions } = this.state;
    let cp = questions;
    let value = e?.target?.value;
    cp[editIndex].question = value;
    this.setState({
      questions: cp,
    });
  };

  handleChangeDescriptionQuestion = (e) => {
    const { editIndex, questions } = this.state;
    let cp = questions;
    let value = e?.target?.value;
    cp[editIndex].description = value;
    this.setState({
      questions: cp,
    });
  };

  handleChangeQuestionAnswers = (e, id) => {
    const { editIndex, questions } = this.state;
    let cp = questions;
    let value = e?.target?.value;
    cp[editIndex].answers[id] = { content: value };
    this.setState({
      questions: cp,
    });
  };

  addQuestionAnswers = () => {
    const { editIndex, questions } = this.state;
    let cp = questions;
    let answers = cp[editIndex].answers;
    let length = 0;
    if (answers) {
      length = Object.keys(answers).length;
    }
    cp[editIndex].answers[length] = { content: "" };
    this.setState({
      questions: cp,
    });
  };

  addNewQuestion = () => {
    const { id, items, newQuestion } = this.state;
    let length = 0;
    if (items) length = Object.keys(items).length;
    let db = this.props.firebase.db;
    let question = db.ref(`questions/${id}/questions/${length}`);
    question.set({ ...newQuestion });
    this.setState({
      openNewQuestionDialog: false,
    });
    this.resetNewQuestion();
    setTimeout(() => {
      this.setState({
        id,
      });
      this.getQuestionsByRef(id);
    }, 1000);
  };

  addNewCondition = () => {
    const { id, conditions } = this.state;
    let length = 0;
    if (conditions) length = Object.keys(conditions).length;
    let db = this.props.firebase.db;
    let conditionRef = db.ref(`questions/${id}/conditions/${length}`);
    conditionRef.set({
      conditions: NEW_CONDITION,
      sendEmail: "",
    });
  };

  onSaveConditions = () => {
    const { id, conditions } = this.state;
    let db = this.props.firebase.db;
    let questionsRef = db.ref(`questions/${id}/conditions/`);
    let j = 0;
    const filtered = Object.keys(conditions).reduce((obj, key) => {
      if (conditions[key]) {
        console.log(conditions[key]);
        obj[j] = conditions[key];
        j++;
      }
      return obj;
    }, []);
    questionsRef.set(filtered);
    this.setState({
      saveConditions: false,
    });
  };

  //edit
  editQuestion = () => {
    const { id, editIndex, questions } = this.state;
    let db = this.props.firebase.db;
    let q = questions[editIndex];
    let ref = db.ref(`questions/${id}/questions/${editIndex}`);
    ref.set(q);
    this.setState({
      openEditDialog: false,
    });
    this.resetQuestion();
  };

  setOpen = (key) => {
    this.setState({
      open: { ...this.state.open, [key]: this.state.open[key] ? false : true },
    });
  };

  resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        800,
        800,
        "PNG",
        80,
        0,
        (uri) => {
          resolve(uri);
        },
        "blob"
      );
    });

  getRandomString = (length) => {
    var randomChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "";
    for (var i = 0; i < length; i++) {
      result += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }
    return result;
  };

  handleUploadMain = async (e, index) => {
    const { storage } = this.props.firebase;
    let file = e?.target?.files[0];
    const image = await this.resizeFile(file);
    const name = this.getRandomString(24);
    if (image) {
      const uploadTask = storage.ref(`images/${name}`).put(image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.log(error);
        },
        () => {
          storage
            .ref("images")
            .child(name)
            .getDownloadURL()
            .then((url) => {
              this.setUploadMain(url, index);
            });
        }
      );
    }
  };

  handleUploadAnswer = async (e, index, key) => {
    const { storage } = this.props.firebase;
    let file = e?.target?.files[0];
    const image = await this.resizeFile(file);
    const name = this.getRandomString(24);
    if (image) {
      const uploadTask = storage.ref(`images/${name}`).put(image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.log(error);
        },
        () => {
          storage
            .ref("images")
            .child(name)
            .getDownloadURL()
            .then((url) => {
              this.setUploadAnswer(url, index, key);
            });
        }
      );
    }
  };

  setUploadMain = (url, index) => {
    const { id } = this.state;
    let db = this.props.firebase.db;
    let mainImage = db.ref(`questions/${id}/questions/${index}/mainImage`);
    mainImage.set(url);
  };

  setUploadAnswer = (url, index, key) => {
    const { id } = this.state;
    let db = this.props.firebase.db;
    let image = db.ref(
      `questions/${id}/questions/${index}/answers/${key}/image`
    );
    image.set(url);
  };

  onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );
    this.setState({
      items,
      dragged: true,
    });
  };

  showDeleteDialog = (index) => {
    this.setState({
      openDeleteDialog: true,
      deleteIndex: index,
    });
  };

  showEditDialog = (index) => {
    this.setState({
      openEditDialog: true,
      editIndex: index,
    });
  };

  deleteItem = () => {
    const { items, deleteIndex } = this.state;
    let copy = items;
    copy.splice(deleteIndex, 1);
    this.setState(
      {
        items: copy,
        deleteIndex: null,
        openDeleteDialog: false,
      },
      () => {
        this.onSave();
      }
    );
  };

  editItem = () => {
    const { items } = this.state;
    this.setState(
      {
        items,
        editIndex: null,
        openEditDialog: false,
      },
      () => {
        this.onSave();
      }
    );
  };
  onSave = () => {
    const { items, id } = this.state;
    let db = this.props.firebase.db;
    let questionsRef = db.ref(`questions/${id}/questions`);
    questionsRef.set(items);
    this.setState({
      dragged: false,
    });
  };

  onDelete = () => {
    let db = this.props.firebase.db;
    const { id } = this.state;
    if (id) {
      let questionsRef = db.ref(`questions/${id}`);
      questionsRef.remove();
    }
  };

  deleteCondition = (_id, key) => {
    let db = this.props.firebase.db;
    const { id, conditions } = this.state;
    let cp = JSON.parse(JSON.stringify(conditions));
    const length = Object.keys(cp[_id].conditions).length;
    if (length > 1) {
      let j = 0;
      const filtered = Object.keys(cp[_id].conditions)
        .filter((id) => Number(id) !== Number(key))
        .reduce((obj, key) => {
          console.log(cp[_id].conditions[key]);
          obj[j] = cp[_id].conditions[key];
          j++;
          return obj;
        }, []);
      cp[_id].conditions = filtered;
      this.setState({
        conditions: cp,
      });
      let ref = db.ref(`questions/${id}/conditions/${_id}/conditions`);
      ref.set(filtered);
    } else {
      let ref = db.ref(`questions/${id}/conditions/${_id}`);
      ref.remove();
    }
  };

  onDuplicate = () => {
    const { items } = this.state;
    let db = this.props.firebase.db;
    let questionsRef = db.ref("questions");
    let newQuestionsRef = questionsRef.push();
    let newKey = newQuestionsRef.key;
    newQuestionsRef.set({
      questions: items,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      id: newKey,
    });
    setTimeout(() => {
      this.setState({
        id: newKey,
      });
      this.getQuestionsByRef(newKey);
    }, 1000);
  };

  newQuestions = () => {
    let db = this.props.firebase.db;
    let questionsRef = db.ref("questions");
    let newQuestionsRef = questionsRef.push();
    let newKey = newQuestionsRef.key;
    newQuestionsRef.set({
      questions: {},
      conditions: {},
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      id: newKey,
    });
    setTimeout(() => {
      this.setState({
        id: newKey,
      });
      this.getQuestionsByRef(newKey);
    }, 1000);
  };
  newQuestion = () => {
    this.setState({
      openNewQuestionDialog: true,
    });
  };

  getQuestions = () => {
    let db = this.props.firebase.db;
    let questionsRef = db.ref("questions");
    questionsRef.on("value", (snap) => {
      let data = snap.val();
      if (data) {
        let questions = Object.keys(data).map((i) => data[i]);
        if (questions) {
          let idList = Object.keys(questions).map((i) => {
            return { value: questions[i].id, label: questions[i].id };
          });
          let id = localStorage.getItem("id")
            ? localStorage.getItem("id")
            : questions[0].id;
          this.setState({
            idList,
            id,
          });
          this.getQuestionsByRef(id);
        }
      } else {
        this.setState({
          loading: false,
        });
      }
    });
  };

  getQuestionsByRef(id) {
    let db = this.props.firebase.db;
    let questionsRef = db.ref(`questions/${id}`);
    questionsRef.on("value", (snap) => {
      let data = snap.val();
      let questions = data?.questions;
      let conditions = data?.conditions;
      let items = [];
      if (questions && conditions) {
        items = JSON.parse(JSON.stringify(questions));
        this.setState({
          loading: false,
          questions,
          conditions,
          items,
        });
      } else if (questions) {
        items = JSON.parse(JSON.stringify(questions));
        this.setState({
          loading: false,
          questions,
          conditions: [],
          items,
        });
      } else if (conditions) {
        this.setState({
          loading: false,
          conditions,
          items: [],
          questions: [],
        });
      } else {
        this.setState({
          loading: false,
          items: [],
          questions: [],
          conditions: [],
        });
      }
    });
  }

  handleChangeY = (value, index, key, id) => {
    this.setState((prevState) => {
      let items = [...prevState.items];
      items[index].answers[key].answers[id].y = value;
      return { items };
    });
  };

  handleChangeX = (value, index, key, id) => {
    this.setState((prevState) => {
      let items = [...prevState.items];
      items[index].answers[key].answers[id].x = value;
      return { items };
    });
  };

  render() {
    const { classes } = this.props;
    const {
      dragged,
      items,
      loading,
      open,
      saveConditions,
      openDeleteDialog,
      openEditDialog,
      openNewQuestionDialog,
      editIndex,
      anchorMore,
      idList,
      id,
      conditions,
      idListEmail,
      questions,
    } = this.state;
    return loading ? (
      <Loading />
    ) : (
      <>
        <h1>Questions</h1>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "",
          }}
        >
          <FormControl
            required
            variant="outlined"
            className={classes.formControl}
            margin="dense"
            size="small"
          >
            <Select
              id="demo-simple-select"
              value={id}
              onChange={(e) => {
                this.getQuestionsByRef(e.target.value);
                this.setState({
                  id: e.target.value,
                });
                localStorage.setItem("id", e.target.value);
              }}
            >
              {idList.map((el, id) => (
                <MenuItem key={id} value={el.value}>{`Questionnaire nº${
                  id + 1
                }`}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={(e) => {
              let currentTarget = e.currentTarget;
              this.setState({
                anchorMore: currentTarget,
              });
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={anchorMore}
            open={anchorMore}
            keepMounted
            onClose={() => {
              this.setState({
                anchorMore: undefined,
              });
            }}
          >
            <MenuItem
              onClick={() => {
                this.onDuplicate();
              }}
            >
              Dupliquer
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.onDelete();
              }}
            >
              Supprimer
            </MenuItem>
          </Menu>
          <Button
            className={classes.button}
            variant="contained"
            target="_blank"
            href={`${window.location.origin}/?id=${id}`}
            size="small"
            color="secondary"
            startIcon={<Visibility />}
          >
            Visualiser
          </Button>
          <Button
            className={classes.button}
            variant="contained"
            size="small"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => this.newQuestions()}
          >
            Nouveau
          </Button>
          {dragged && (
            <SaveButton
              variant="contained"
              color="primary"
              size="small"
              className={classes.button}
              startIcon={<SaveIcon />}
              disabled={!dragged}
              onClick={() => this.onSave()}
            >
              Sauvegarder
            </SaveButton>
          )}
        </div>
        <Paper className={classes.root} elevation={3}>
          <TableContainer className={classes.container}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>#</TableCell>
                  <TableCell>Questions</TableCell>
                  <TableCell alignRight />
                </TableRow>
              </TableHead>
              <TableBody component={DroppableComponent(this.onDragEnd)}>
                {items?.map((item, index) => (
                  <React.Fragment key={index}>
                    <TableRow
                      className={classes.tableRow}
                      component={DraggableComponent(index.toString(), index)}
                    >
                      <TableCell>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() => this.setOpen(index)}
                        >
                          {open[index] ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell scope="row">{index + 1}</TableCell>
                      <TableCell>{item?.question}</TableCell>
                      <TableCell alignRight>
                        <IconButton
                          aria-label="edit"
                          onClick={() => this.showEditDialog(index)}
                          disabled={dragged}
                          className={classes.deleteBtn}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          onClick={() => this.showDeleteDialog(index)}
                          disabled={dragged}
                          className={classes.deleteBtn}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={6}
                      >
                        <Collapse in={open[index]} timeout="auto" unmountOnExit>
                          <Box margin={1}>
                            <div>
                              <span>
                                <b>Image principale</b>
                              </span>
                              <Button
                                variant="contained"
                                color="default"
                                size="small"
                                className={classes.button}
                                startIcon={<CloudUploadIcon />}
                                disabled={dragged}
                                component="label"
                                onChange={(e) =>
                                  this.handleUploadMain(e, index)
                                }
                              >
                                {item?.mainImage ? "Remplacer" : "Téléverser"}
                                <input
                                  disabled={dragged}
                                  accept="image/*"
                                  className={classes.input}
                                  type="file"
                                />
                              </Button>
                              {item?.mainImage && (
                                <IconButton
                                  disabled={dragged}
                                  variant="contained"
                                  onClick={() => this.setUploadMain("", index)}
                                  aria-label="delete"
                                  className={classes.deleteBtn}
                                >
                                  <DeleteIcon
                                    fontSize="small"
                                    disabled={dragged}
                                  />
                                </IconButton>
                              )}
                              {item?.mainImage && (
                                <div>
                                  <img
                                    width="50"
                                    src={item?.mainImage}
                                    alt="Main"
                                  />
                                </div>
                              )}
                            </div>
                            <div style={{ marginBottom: "1.5em" }}>
                              <p>
                                <b>Description</b>
                              </p>
                              {item?.description ? (
                                <p>{item?.description}</p>
                              ) : (
                                <p>Aucune description</p>
                              )}
                            </div>

                            <Table size="small" aria-label="purchases">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Numéro</TableCell>
                                  <TableCell>Nom/Contenu</TableCell>
                                  {(item?.type === "radio" ||
                                    item?.type === "checkbox" ||
                                    item?.type === "body") && (
                                    <TableCell>Image</TableCell>
                                  )}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {item?.type !== "body" &&
                                  item?.answers.map((el, key, array) => (
                                    <TableRow key={key + "_answers"}>
                                      <TableCell scope="row">
                                        {key + 1}
                                      </TableCell>
                                      <TableCell>{el.content}</TableCell>
                                      <TableCell>
                                        {(item?.type === "radio" ||
                                          item?.type === "checkbox") &&
                                        !el.image ? (
                                          <IconButton
                                            color="primary"
                                            disabled={dragged}
                                            aria-label="upload picture"
                                            component="label"
                                            onChange={(e) =>
                                              this.handleUploadAnswer(
                                                e,
                                                index,
                                                key
                                              )
                                            }
                                          >
                                            <PhotoCamera />
                                            <input
                                              accept="image/*"
                                              className={classes.input}
                                              id="icon-button-file"
                                              type="file"
                                            />
                                          </IconButton>
                                        ) : (
                                          el.image && (
                                            <>
                                              <img
                                                src={el.image}
                                                style={{ maxWidth: 80 }}
                                                alt="Answer img"
                                              />
                                              <IconButton
                                                disabled={dragged}
                                                variant="contained"
                                                onClick={() =>
                                                  this.setUploadAnswer(
                                                    "",
                                                    index,
                                                    key
                                                  )
                                                }
                                                aria-label="delete"
                                                className={classes.deleteBtn}
                                              >
                                                <DeleteIcon
                                                  fontSize="small"
                                                  disabled={dragged}
                                                />
                                              </IconButton>
                                            </>
                                          )
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                {item?.type === "body" &&
                                  item?.answers.map((el, key, array) => (
                                    <TableRow key={"answers_" + key}>
                                      <TableCell scope="row">
                                        {`${key + 1}`}
                                      </TableCell>
                                      <TableCell>
                                        {el.answers.map((ele, id) => (
                                          <div
                                            key={`set_XY_${index}${key}${id}`}
                                          >
                                            <p>{ele.content}</p>

                                            <form
                                              id={`setXY${index}${key}${id}`}
                                              key={`setXY${index}${key}${id}`}
                                              noValidate
                                              autoComplete="off"
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                                margin: "0.5em 0",
                                              }}
                                            >
                                              <TextField
                                                id={`setX${index}${key}${id}`}
                                                key={`setX${index}${key}${id}`}
                                                size="small"
                                                label={"Position en x"}
                                                style={{
                                                  marginLeft: "0.5em",
                                                }}
                                                type={"number"}
                                                onChange={(e) => {
                                                  this.handleChangeX(
                                                    e.target.value,
                                                    index,
                                                    key,
                                                    id
                                                  );
                                                }}
                                                id="outlined-basic"
                                                value={ele?.x || ""}
                                              />
                                              <TextField
                                                id={`setY${index}${key}${id}`}
                                                key={`setY${index}${key}${id}`}
                                                size="small"
                                                label={"Position en y"}
                                                style={{
                                                  marginLeft: "0.5em",
                                                }}
                                                type={"number"}
                                                onChange={(e) => {
                                                  this.handleChangeY(
                                                    e.target.value,
                                                    index,
                                                    key,
                                                    id
                                                  );
                                                }}
                                                onBlur={(e) => {
                                                  this.handleChangeY(
                                                    e.target.value,
                                                    index,
                                                    key,
                                                    id
                                                  );
                                                }}
                                                id="outlined-basic"
                                                value={ele?.y || ""}
                                              />
                                            </form>
                                          </div>
                                        ))}
                                      </TableCell>
                                      <TableCell>
                                        {(item?.type === "radio" ||
                                          item?.type === "checkbox" ||
                                          item?.type === "body") &&
                                        !el.image ? (
                                          <IconButton
                                            color="primary"
                                            disabled={dragged}
                                            aria-label="upload picture"
                                            component="label"
                                            onChange={(e) =>
                                              this.handleUploadAnswer(
                                                e,
                                                index,
                                                key
                                              )
                                            }
                                          >
                                            <PhotoCamera />
                                            <input
                                              accept="image/*"
                                              className={classes.input}
                                              id="icon-button-file"
                                              type="file"
                                            />
                                          </IconButton>
                                        ) : (
                                          el.image && (
                                            <>
                                              <img
                                                src={el.image}
                                                style={{ width: 210 }}
                                                alt=""
                                              />
                                              <IconButton
                                                disabled={dragged}
                                                variant="contained"
                                                onClick={() =>
                                                  this.setUploadAnswer(
                                                    "",
                                                    index,
                                                    key
                                                  )
                                                }
                                                aria-label="delete"
                                                className={classes.deleteBtn}
                                              >
                                                <DeleteIcon
                                                  fontSize="small"
                                                  disabled={dragged}
                                                />
                                              </IconButton>
                                            </>
                                          )
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
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
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => this.newQuestion()}
        >
          Nouvelle question
        </Button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <h1>Emailing/Résumé</h1>
          {saveConditions && (
            <SaveButton
              variant="contained"
              color="primary"
              size="small"
              className={classes.button}
              startIcon={<SaveIcon />}
              onClick={() => this.onSaveConditions()}
            >
              Sauvegarder
            </SaveButton>
          )}
        </div>
        {conditions?.map((el, id) => (
          <>
            {el?.conditions?.map((condition, key) => (
              <div style={{ display: "flex", alignItems: "center" }}>
                {key === 0 && <b style={{ marginRight: "0.5em" }}>Si</b>}
                {key >= 1 && <b style={{ marginRight: "0.5em" }}>et</b>}
                <FormControl variant="outlined" className={classes.formControl}>
                  <Select
                    labelId="simple-select-label-1"
                    id="simple-select-1"
                    value={conditions[id]?.conditions[key]?.question || ""}
                    onChange={(e) => {
                      const { conditions } = this.state;
                      let cp = conditions;
                      let value = e.target.value;
                      cp[id].conditions[key].question = value;
                      if (
                        items[
                          items.findIndex((item) => item?.question === value)
                        ]?.type === "checkbox"
                      ) {
                        cp[id].conditions[key].value = [];
                      }
                      this.setState({
                        conditions: cp,
                        saveConditions: true,
                      });
                    }}
                  >
                    {items.map((item) => (
                      <MenuItem value={item?.question}>
                        {item?.question}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="outlined" className={classes.formControl}>
                  {items[
                    items.findIndex(
                      (item) =>
                        item?.question ===
                        conditions[id]?.conditions[key]?.question
                    )
                  ]?.type === "number" ? (
                    <Select
                      style={{ marginLeft: "0.5em" }}
                      labelId="simple-select-label-2"
                      id="simple-select-2"
                      value={conditions[id]?.conditions[key]?.operator || ""}
                      onChange={(e) => {
                        const { conditions } = this.state;
                        let cp = conditions;
                        let value = e.target.value;
                        cp[id].conditions[key].operator = value;
                        if (value === "><" || value === ">><<") {
                          conditions[id].conditions[key].value = [];
                        }
                        this.setState({
                          conditions: cp,
                          saveConditions: true,
                        });
                      }}
                    >
                      <MenuItem value={"==="}>
                        <b>est égal à</b>
                      </MenuItem>
                      <MenuItem value={">"}>
                        <b>est strictement supérieur à</b>
                      </MenuItem>
                      <MenuItem value={"<"}>
                        <b>est strictement inférieur à</b>
                      </MenuItem>
                      <MenuItem value={">="}>
                        <b>est supérieur ou égal à</b>
                      </MenuItem>
                      <MenuItem value={"<="}>
                        <b>est inférieur ou égal à</b>
                      </MenuItem>
                      <MenuItem value={">><<"}>
                        <b>est compris entre</b>
                      </MenuItem>
                      <MenuItem value={"><"}>
                        <b>est strictement compris entre</b>
                      </MenuItem>
                    </Select>
                  ) : (
                    <Select
                      style={{ marginLeft: "0.5em" }}
                      labelId="simple-select-label-2"
                      id="simple-select-2"
                      value={conditions[id]?.conditions[key]?.operator || ""}
                      onChange={(e) => {
                        const { conditions } = this.state;
                        let cp = conditions;
                        let value = e.target.value;
                        cp[id].conditions[key].operator = value;
                        this.setState({
                          conditions: cp,
                          saveConditions: true,
                        });
                      }}
                    >
                      <MenuItem value={"==="}>
                        <b>est égal à</b>
                      </MenuItem>
                    </Select>
                  )}
                </FormControl>
                <FormControl variant="outlined" className={classes.formControl}>
                  {items[
                    items.findIndex(
                      (item) =>
                        item?.question ===
                        conditions[id]?.conditions[key]?.question
                    )
                  ]?.type === "checkbox" ? (
                    <Select
                      style={{ marginLeft: "0.5em" }}
                      labelId="demo-mutiple-chip-label"
                      id="demo-mutiple-chip"
                      multiple
                      variant="outlined"
                      value={conditions[id]?.conditions[key]?.value || ""}
                      onChange={(e) => this.handleChangeMultiple(e, id, key)}
                      input={<Input id="select-multiple-chip" />}
                      renderValue={(selected) => (
                        <div className={classes.chips}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              className={classes.chip}
                            />
                          ))}
                        </div>
                      )}
                      MenuProps={MenuProps}
                    >
                      {items[
                        items.findIndex(
                          (item) =>
                            item?.question ===
                            conditions[id]?.conditions[key]?.question
                        )
                      ]?.answers.map((item) => (
                        <MenuItem
                          key={item?.content}
                          value={item?.content}
                          style={getStyles(item?.content, items)}
                        >
                          {item?.content}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : items[
                      items.findIndex(
                        (item) =>
                          item?.question ===
                          conditions[id]?.conditions[key]?.question
                      )
                    ]?.type === "radio" ? (
                    <Select
                      style={{ marginLeft: "0.5em" }}
                      variant="outlined"
                      labelId="simple-select-label"
                      id="simple-select"
                      value={conditions[id]?.conditions[key]?.value || ""}
                      onChange={(e) => {
                        const { conditions } = this.state;
                        let cp = conditions;
                        let value = e.target.value;
                        cp[id].conditions[key].value = value;
                        this.setState({
                          conditions: cp,
                          saveConditions: true,
                        });
                      }}
                    >
                      {items[
                        items.findIndex(
                          (item) =>
                            item?.question ===
                            conditions[id]?.conditions[key]?.question
                        )
                      ]?.answers.map((item) => {
                        return (
                          <MenuItem value={item?.content}>
                            {item?.content}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  ) : conditions[id]?.conditions[key]?.operator !== "><" &&
                    conditions[id]?.conditions[key]?.operator !== ">><<" ? (
                    <TextField
                      style={{ marginLeft: "0.5em" }}
                      type={
                        items[
                          items.findIndex(
                            (item) =>
                              item?.question ===
                              conditions[id]?.conditions[key]?.question
                          )
                        ]?.type || "text"
                      }
                      onChange={(e) => {
                        const { conditions } = this.state;
                        let cp = conditions;
                        let value = e.target.value;
                        cp[id].conditions[key].value = value;
                        this.setState({
                          conditions: cp,
                          saveConditions: true,
                        });
                      }}
                      id="outlined-basic"
                      variant="outlined"
                      value={conditions[id]?.conditions[key]?.value || ""}
                    />
                  ) : (
                    <>
                      <TextField
                        style={{ marginLeft: "0.5em" }}
                        type={
                          items[
                            items.findIndex(
                              (item) =>
                                item?.question ===
                                conditions[id]?.conditions[key]?.question
                            )
                          ]?.type || "text"
                        }
                        onChange={(e) => {
                          const { conditions } = this.state;
                          let cp = conditions;
                          let value = e.target.value;
                          cp[id].conditions[key].value[0] = value;
                          this.setState({
                            conditions: cp,
                            saveConditions: true,
                          });
                        }}
                        id="outlined-basic"
                        variant="outlined"
                        value={conditions[id]?.conditions[key]?.value[0] || ""}
                      />
                      <b style={{ textAlign: "center", margin: "0.5em" }}>et</b>
                      <TextField
                        style={{ marginLeft: "0.5em" }}
                        type={
                          items[
                            items.findIndex(
                              (item) =>
                                item?.question ===
                                conditions[id]?.conditions[key]?.question
                            )
                          ]?.type || "text"
                        }
                        onChange={(e) => {
                          const { conditions } = this.state;
                          let cp = conditions;
                          let value = e.target.value;
                          cp[id].conditions[key].value[1] = value;
                          this.setState({
                            conditions: cp,
                            saveConditions: true,
                          });
                        }}
                        id="outlined-basic"
                        variant="outlined"
                        value={conditions[id]?.conditions[key]?.value[1] || ""}
                      />
                    </>
                  )}
                </FormControl>
                <IconButton
                  style={{ marginLeft: "0.5em" }}
                  aria-label="delete"
                  onClick={() => {
                    this.deleteCondition(id, key);
                  }}
                  className={classes.deleteBtn}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            ))}
            <Button
              variant="outlined"
              className={classes.button}
              size="small"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                const { conditions } = this.state;
                let cp = conditions;
                let length = 0;
                if (cp[id]?.conditions) {
                  length = Object.keys(cp[id].conditions).length;
                  cp[id].conditions[length] = {
                    question: "",
                    operator: "",
                    value: "",
                    next: "",
                  };
                } else {
                  cp[id] = {
                    conditions: NEW_CONDITION,
                  };
                }
                this.setState({
                  conditions: cp,
                });
              }}
            >
              Ajouter une condition
            </Button>
            <p>Alors, afficher/envoyer :</p>
            <FormControl className={classes.formControl} variant="outlined">
              <Select
                id="demo-simple-select"
                value={conditions[id]?.sendEmail?.id || ""}
                onChange={(e) => {
                  const { conditions, email } = this.state;
                  let cp = conditions;
                  let index = e.target.value;
                  cp[id].sendEmail = email[index];
                  this.setState({
                    conditions: cp,
                    saveConditions: true,
                  });
                }}
              >
                {idListEmail &&
                  idListEmail.map((el, id) => (
                    <MenuItem key={id} value={el.value}>{`Email nº${
                      id + 1
                    }`}</MenuItem>
                  ))}
              </Select>
            </FormControl>
            <hr />
          </>
        ))}
        <br />
        <Button
          className={classes.button}
          variant="contained"
          size="small"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => this.addNewCondition()}
        >
          Nouvelle condition
        </Button>
        <Dialog
          open={openDeleteDialog}
          onClose={() => {
            this.setState({
              deleteIndex: null,
              openDeleteDialog: false,
            });
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Êtes-vous sûr de vouloir supprimer cette question ?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Cette action est irréversible
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({
                  deleteIndex: null,
                  openDeleteDialog: false,
                });
              }}
              color="primary"
            >
              Annuler
            </Button>
            <DeleteButton
              onClick={() => {
                this.deleteItem();
              }}
              autoFocus
              color="primary"
              variant="contained"
            >
              Supprimer
            </DeleteButton>
          </DialogActions>
        </Dialog>
        <Dialog
          fullWidth
          open={openNewQuestionDialog}
          onClose={() => {
            this.setState({
              openNewQuestionDialog: false,
            });
          }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Nouvelle question</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              onChange={(e) => this.handleChangeNameNewQuestion(e)}
              value={this.state.newQuestion?.question || ""}
              label="Question"
              type="text"
              fullWidth
            />
            <TextField
              margin="dense"
              onChange={(e) => this.handleChangeDescriptionNewQuestion(e)}
              value={this.state.newQuestion?.description || ""}
              label="Description"
              type="text"
              fullWidth
            />
            <FormControl
              variant="outlined"
              required
              className={classes.formControl}
            >
              <InputLabel id="simple-select-label">Type</InputLabel>
              <Select
                labelId="simple-select-label"
                id="simple-select"
                value={this.state.newQuestion?.type || ""}
                onChange={(e) => {
                  this.setState((state, props) => ({
                    newQuestion: {
                      ...state.newQuestion,
                      type: e.target.value,
                      answers: {
                        0: {
                          content: "",
                        },
                      },
                    },
                  }));
                }}
              >
                <MenuItem value={"text"}>Entrée</MenuItem>
                <MenuItem value={"number"}>Nombre</MenuItem>
                <MenuItem value={"email"}>Email</MenuItem>
                <MenuItem value={"radio"}>Sélection</MenuItem>
                <MenuItem value={"checkbox"}>Multi-sélection</MenuItem>
              </Select>
            </FormControl>
            {this.state.newQuestion?.type === "number" && (
              <TextField
                required
                margin="dense"
                label="Ex. : âge"
                type="text"
                onChange={(e) => this.handleChangeNewQuestionAnswers(e, 0)}
                value={this.state.newQuestion.answers[0]?.content || ""}
                fullWidth
              />
            )}
            {this.state.newQuestion?.type === "text" && (
              <TextField
                required
                margin="dense"
                label="Ex. : Prénom"
                type="text"
                onChange={(e) => this.handleChangeNewQuestionAnswers(e, 0)}
                value={this.state.newQuestion.answers[0]?.content || ""}
                fullWidth
              />
            )}
            {this.state.newQuestion?.type === "email" && (
              <TextField
                required
                margin="dense"
                label="Ex. : Email"
                type="text"
                onChange={(e) => this.handleChangeNewQuestionAnswers(e, 0)}
                value={this.state.newQuestion.answers[0]?.content || ""}
                fullWidth
              />
            )}
            {this.state.newQuestion?.type === "checkbox" && (
              <>
                {Object.keys(this.state.newQuestion.answers).map((el, id) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TextField
                      required
                      margin="dense"
                      label={`Option n°${id + 1}`}
                      value={
                        this.state.newQuestion.answers[`${id}`]?.content || ""
                      }
                      onChange={(e) =>
                        this.handleChangeNewQuestionAnswers(e, id)
                      }
                      type="text"
                      fullWidth
                    />
                    <IconButton
                      aria-label="delete"
                      onClick={() => this.deleteNewQuestionAnswers(id)}
                      className={classes.deleteBtn}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))}
                <Button
                  onClick={() => this.addNewQuestionAnswers()}
                  color="primary"
                  variant="contained"
                  size="small"
                >
                  Ajouter un champ
                </Button>
              </>
            )}
            {this.state.newQuestion?.type === "radio" && (
              <>
                {Object.keys(this.state.newQuestion.answers).map((el, id) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TextField
                      required
                      margin="dense"
                      label={`Option n°${id + 1}`}
                      value={
                        this.state.newQuestion.answers[`${id}`]?.content || ""
                      }
                      onChange={(e) =>
                        this.handleChangeNewQuestionAnswers(e, id)
                      }
                      type="text"
                      fullWidth
                    />
                    <IconButton
                      aria-label="delete"
                      onClick={() => this.deleteNewQuestionAnswers(id)}
                      className={classes.deleteBtn}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))}
                <Button
                  onClick={() => this.addNewQuestionAnswers()}
                  color="primary"
                  variant="contained"
                  size="small"
                >
                  Ajouter un champ
                </Button>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({
                  openNewQuestionDialog: false,
                });
                this.resetNewQuestion();
              }}
              color="primary"
            >
              Annuler
            </Button>
            <Button
              disabled={
                !this.state.newQuestion.answers[0]?.content ||
                !this.state.newQuestion.question
              }
              onClick={() => this.addNewQuestion()}
              color="primary"
              variant="contained"
            >
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          fullWidth
          open={openEditDialog}
          onClose={() => {
            this.setState({
              openEditDialog: false,
            });
          }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            Modifier une question
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              onChange={(e) => this.handleChangeNameQuestion(e)}
              value={questions[editIndex]?.question || ""}
              label="Question"
              type="text"
              fullWidth
            />
            <TextField
              margin="dense"
              onChange={(e) => this.handleChangeDescriptionQuestion(e)}
              value={questions[editIndex]?.description || ""}
              label="Description"
              type="text"
              fullWidth
            />
            <FormControl required className={classes.formControl}>
              <InputLabel id="simple-select-label">Type</InputLabel>
              <Select
                labelId="simple-select-label"
                id="simple-select"
                value={questions[editIndex]?.type || ""}
                onChange={(e) => {
                  let value = e.target.value;
                  this.setState((state, props) => ({
                    questions: {
                      ...state.questions,
                      [state.editIndex]: {
                        ...state.questions[state.editIndex],
                        type: value,
                        answers: {
                          0: {
                            content: "",
                          },
                        },
                      },
                    },
                  }));
                }}
              >
                <MenuItem value={"text"}>Entrée</MenuItem>
                <MenuItem value={"number"}>Nombre</MenuItem>
                <MenuItem value={"email"}>Email</MenuItem>
                <MenuItem value={"radio"}>Sélection</MenuItem>
                <MenuItem value={"checkbox"}>Multi-sélection</MenuItem>
              </Select>
            </FormControl>
            {questions[editIndex]?.type === "number" && (
              <TextField
                required
                margin="dense"
                label="Ex. : âge"
                type="text"
                onChange={(e) => this.handleChangeQuestionAnswers(e, 0)}
                value={questions[editIndex]?.answers[0]?.content || ""}
                fullWidth
              />
            )}
            {questions[editIndex]?.type === "text" && (
              <TextField
                required
                margin="dense"
                label="Ex. : Prénom"
                type="text"
                onChange={(e) => this.handleChangeQuestionAnswers(e, 0)}
                value={questions[editIndex]?.answers[0]?.content || ""}
                fullWidth
              />
            )}
            {questions[editIndex]?.type === "email" && (
              <TextField
                required
                margin="dense"
                label="Ex. : Email"
                type="text"
                onChange={(e) => this.handleChangeQuestionAnswers(e, 0)}
                value={questions[editIndex]?.answers[0]?.content || ""}
                fullWidth
              />
            )}
            {questions[editIndex]?.type === "checkbox" && (
              <>
                {Object.keys(questions[editIndex]?.answers).map((el, id) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TextField
                      required
                      margin="dense"
                      label={`Option n°${id + 1}`}
                      value={
                        questions[editIndex]?.answers[`${id}`]?.content || ""
                      }
                      onChange={(e) => this.handleChangeQuestionAnswers(e, id)}
                      type="text"
                      fullWidth
                    />
                    <IconButton
                      aria-label="delete"
                      onClick={() => this.deleteQuestionAnswers(id)}
                      className={classes.deleteBtn}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))}
                <Button
                  onClick={() => this.addQuestionAnswers()}
                  color="primary"
                  variant="contained"
                  size="small"
                >
                  Ajouter un champ
                </Button>
              </>
            )}
            {questions[editIndex]?.type === "radio" && (
              <>
                {Object.keys(questions[editIndex]?.answers).map((el, id) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TextField
                      required
                      margin="dense"
                      label={`Option n°${id + 1}`}
                      value={
                        questions[editIndex]?.answers[`${id}`]?.content || ""
                      }
                      onChange={(e) => this.handleChangeQuestionAnswers(e, id)}
                      type="text"
                      fullWidth
                    />
                    <IconButton
                      aria-label="delete"
                      onClick={() => this.deleteQuestionAnswers(id)}
                      className={classes.deleteBtn}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))}
                <Button
                  onClick={() => this.addQuestionAnswers()}
                  color="primary"
                  variant="contained"
                  size="small"
                >
                  Ajouter un champ
                </Button>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({
                  openEditDialog: false,
                });
                this.resetQuestion();
              }}
              color="primary"
            >
              Annuler
            </Button>
            <Button
              disabled={
                !questions[editIndex]?.answers[0]?.content ||
                !questions[editIndex]?.question
              }
              onClick={() => this.editQuestion()}
              color="primary"
              variant="contained"
            >
              Modifier
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
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
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
          {...props}
        >
          {props.children}
        </TableRow>
      )}
    </Draggable>
  );
};

const DroppableComponent = (onDragEnd) => (props) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={"1"} direction="vertical">
        {(provided) => {
          return (
            <TableBody
              ref={provided.innerRef}
              {...provided.droppableProps}
              {...props}
            >
              {props.children}
              {provided.placeholder}
            </TableBody>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
};

const Questions = compose(withFirebase, withStyles(styles))(QuestionsBase);

export default QuestionsPage;

export { Questions };
