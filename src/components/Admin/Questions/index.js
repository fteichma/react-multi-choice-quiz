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
  Link,
  Tab,
  Tabs,
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

import Notify from "../../../notify";

import { withFirebase } from "../../Firebase";
import firebase from "firebase/app";
import { compose } from "recompose";

import Loading from "../../Loading";
/* import { Visibility } from "@material-ui/icons";
 */
import update from "immutability-helper";

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

const NEW_VARIABLE = {
  name: "",
  constants: {
    0: {
      question: "",
      name: "",
    },
  },
  calc: "",
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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      key={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

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
  tab: {
    textTransform: "none",
  },
  tabs: {
    flexGrow: 1,
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
      tab: 0,
      loading: true,
      open: {},
      openDeleteDialog: false,
      deleteIndex: null,
      deleteVariableIndex: null,
      editIndex: null,
      editVariableIndex: null,
      idList: [],
      idListEmail: [],
      idListSummary: [],
      id: localStorage.getItem("id") ? localStorage.getItem("id") : undefined,
      openNewQuestionDialog: false,
      openNewVariableDialog: false,
      openEditDialog: false,
      openEditVariableDialog: false,
      openDeleteVariableDialog: false,
      newQuestion: NEW_QUESTION,
      newVariable: NEW_VARIABLE,
      items: [],
      variables: [],
      variablesItems: [],
      questions: {},
      conditions: [],
      anchorMore: undefined,
      saveConditions: false,
      sex: "male",
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
    this.handleChangePart = this.handleChangePart.bind(this);
  }

  /* shouldComponentUpdate(nextProps, nextState) {
    return nextState.items !== this.state.items;
  } */

  componentDidMount() {
    this.getQuestions();
    this.getEmailing();
    this.getSummary();
  }

  /* handleChangeMultiple = (e, id, key) => {
    let value = e.target.value;
    let questions = update(this.state.questions, {
      [id]: {
        conditions: {
          [key]: {
            value: {
              $set: value,
            },
          },
        },
      },
    });
    this.setState({ questions });
  }; */

  handleChangeMultiple = (e, id, key) => {
    const { conditions } = this.state;
    const { value } = e.target;
    let cp = conditions;
    cp[id].conditions[key].value = value;
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

  async getSummary() {
    let db = this.props.firebase.db;
    let emailRef = db.ref("summary");
    await emailRef.on("value", (snap) => {
      let data = snap.val();
      if (data) {
        let summary = Object.keys(data).map((i) => data[i]);
        if (summary) {
          let idListSummary = Object.keys(summary).map((i) => {
            return { value: summary[i]?.id, label: summary[i]?.id };
          });
          this.setState({
            idListSummary,
            summary: data,
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

  resetNewVariable = () => {
    this.setState({
      newVariable: NEW_VARIABLE,
    });
  };

  resetQuestion = () => {
    this.setState((state) => ({
      questions: JSON.parse(JSON.stringify(state.items)),
    }));
  };

  resetVariable = () => {
    this.setState((state) => ({
      variables: JSON.parse(JSON.stringify(state.variablesItems)),
    }));
  };

  handleChangeNameNewQuestion = (e) => {
    let value = e.target.value;
    let newQuestion = update(this.state.newQuestion, {
      question: {
        $set: value,
      },
    });
    this.setState({ newQuestion });
  };
  handleChangeDescriptionNewQuestion = (e) => {
    let value = e.target.value;
    let newQuestion = update(this.state.newQuestion, {
      description: {
        $set: value,
      },
    });
    this.setState({ newQuestion });
  };

  handleChangeNewQuestionAnswers = (e, id) => {
    let value = e.target.value;
    let newQuestion = update(this.state.newQuestion, {
      answers: {
        [id]: {
          content: {
            $set: value,
          },
        },
      },
    });
    this.setState({ newQuestion });
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

  addNewPart = (key, editIndex, sex) => {
    const { questions, newQuestion } = this.state;
    if (editIndex) {
      let length = 0;
      if (
        sex === "male" &&
        this.state.questions[editIndex]?.answers?.male[key]?.answers
      ) {
        length = this.state.questions[editIndex]?.answers?.male[key]?.answers
          .length;
      } else if (
        this.state.questions[editIndex]?.answers?.female[key]?.answers
      ) {
        length = this.state.questions[editIndex]?.answers?.female[key]?.answers
          .length;
      }
      let cp = questions;
      cp[editIndex].answers[`${sex}`][key].answers[length] = {
        x: 0,
        y: 0,
        content: "",
      };
      this.setState({
        questions: cp,
      });
    } else {
      let length = 0;
      if (
        sex === "male" &&
        this.state.newQuestion?.answers?.male[key]?.answers
      ) {
        length = Object.keys(
          this.state.newQuestion?.answers?.male[key]?.answers
        ).length;
      } else if (this.state.newQuestion?.answers?.male[key]?.answers) {
        length = Object.keys(
          this.state.newQuestion?.answers?.female[key]?.answers
        ).length;
      }
      let cp = newQuestion;
      cp.answers[`${sex}`][key].answers[length] = { x: 0, y: 0, content: "" };
      this.setState({
        newQuestion: cp,
      });
    }
  };

  deleteNewQuestionAnswers = (id) => {
    const { answers } = this.state.newQuestion;
    let cp = answers;
    delete cp[id];
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
    const { editIndex } = this.state;
    let value = e.target.value;
    let questions = update(this.state.questions, {
      [editIndex]: {
        question: {
          $set: value,
        },
      },
    });
    this.setState({ questions });
  };

  handleChangeDescriptionQuestion = (e) => {
    const { editIndex } = this.state;
    let value = e.target.value;
    let questions = update(this.state.questions, {
      [editIndex]: {
        description: {
          $set: value,
        },
      },
    });
    this.setState({ questions });
  };

  handleChangeQuestionAnswers = (e, id) => {
    const { editIndex } = this.state;
    let value = e.target.value;
    let questions = update(this.state.questions, {
      [editIndex]: {
        answers: {
          [id]: {
            content: {
              $set: value,
            },
          },
        },
      },
    });
    this.setState({ questions });
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

  addNewVariable = () => {
    const { id, variablesItems, newVariable } = this.state;
    let length = 0;
    if (variablesItems) length = Object.keys(variablesItems).length;
    let db = this.props.firebase.db;
    let variable = db.ref(`questions/${id}/variables/${length}`);
    variable.set({ ...newVariable });
    this.setState({
      openNewVariableDialog: false,
    });
    this.resetNewVariable();
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
      showSummary: "",
    });
  };

  onSaveConditions = () => {
    const { id, conditions } = this.state;
    let db = this.props.firebase.db;
    let questionsRef = db.ref(`questions/${id}/conditions/`);
    let j = 0;
    let filtered = Object.keys(conditions).reduce((obj, key) => {
      if (conditions[key]) {
        obj[j] = conditions[key];
        j++;
      }
      return obj;
    }, []);
    questionsRef.set(filtered, (error) => {
      if (error) {
        Notify("Problème lors de la sauvegarde : " + error, "error");
      } else {
        this.setState({
          saveConditions: false,
        });
        Notify("Sauvegardé !", "success");
      }
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
    this.setState((state) => ({
      open: { ...state.open, [key]: state.open[key] ? false : true },
    }));
  };

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
    const image = file;
    const name = this.getRandomString(24);
    if (image) {
      const uploadTask = storage.ref(`images/${name}`).put(image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          Notify(
            "Problème lors du téléversement de l'image : " + error,
            "error"
          );
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

  handleUploadAnswer = async (e, index, key, sex = undefined) => {
    const { storage } = this.props.firebase;
    let file = e?.target?.files[0];
    const image = file;
    const name = this.getRandomString(24);
    if (image) {
      const uploadTask = storage.ref(`images/${name}`).put(image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          Notify(
            "Problème lors du téléversement de l'image : " + error,
            "error"
          );
        },
        () => {
          storage
            .ref("images")
            .child(name)
            .getDownloadURL()
            .then((url) => {
              this.setUploadAnswer(url, index, key, sex);
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

  setUploadAnswer = (url, index, key, sex = undefined) => {
    const { id } = this.state;
    let db = this.props.firebase.db;
    let image = db.ref(
      `questions/${id}/questions/${index}/answers/${key}/image`
    );
    if (sex) {
      image = db.ref(
        `questions/${id}/questions/${index}/answers/${sex}/${key}/image`
      );
    }
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

  showDeleteVariableDialog = (index) => {
    this.setState({
      openDeleteVariableDialog: true,
      deleteVariableIndex: index,
    });
  };

  showEditVariableDialog = (index) => {
    this.setState({
      openEditVariableDialog: true,
      editVariableIndex: index,
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

  deleteVariable = () => {
    const { variablesItems, deleteVariableIndex } = this.state;
    let copy = variablesItems;
    copy.splice(deleteVariableIndex, 1);
    this.setState(
      {
        variablesItems: copy,
        deleteVariableIndex: null,
        openDeleteVariableDialog: false,
      },
      () => {
        this.onSave();
      }
    );
  };

  editVariable = () => {
    const { id, editVariableIndex, variables } = this.state;
    let db = this.props.firebase.db;
    let q = variables[editVariableIndex];
    let ref = db.ref(`questions/${id}/variables/${editVariableIndex}`);
    ref.set(q);
    this.setState({
      openEditVariableDialog: false,
    });
    this.resetVariable();
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

  async onSave() {
    const { items, variablesItems, id } = this.state;
    let db = this.props.firebase.db;
    await db
      .ref(`questions/${id}`)
      .set({ questions: items, variables: variablesItems, id }, (error) => {
        if (error) {
          Notify("Problème lors de la sauvegarde : " + error, "error");
        } else {
          this.setState({
            dragged: false,
          });
          Notify("Sauvegardé !", "success");
        }
      });
  }

  async onDelete() {
    let db = this.props.firebase.db;
    const { id } = this.state;
    if (id) {
      await db.ref(`questions/${id}`).remove(() => {
        const { idList } = this.state;
        let lg = idList.length - 1;
        let id = idList[lg >= 0 ? lg : 0].value;
        this.setState(
          {
            id,
          },
          () => {
            this.getQuestionsByRef(id);
          }
        );
      });
    }
  }

  deleteCondition = (_id, key) => {
    let db = this.props.firebase.db;
    const { id, conditions } = this.state;
    let cp = JSON.parse(JSON.stringify(conditions));
    const length = Object.keys(cp[_id].conditions).length;
    if (length > 1) {
      let j = 0;
      let filtered = Object.keys(cp[_id].conditions)
        .filter((id) => Number(id) !== Number(key))
        .reduce((obj, key) => {
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

  deleteConstance = (_id, key) => {
    let db = this.props.firebase.db;
    const { id, variablesItems } = this.state;
    let cp = JSON.parse(JSON.stringify(variablesItems));
    const length = Object.keys(cp[_id].constants).length;
    if (length > 1) {
      let j = 0;
      let filtered = Object.keys(cp[_id].constants)
        .filter((id) => Number(id) !== Number(key))
        .reduce((obj, key) => {
          obj[j] = cp[_id].constants[key];
          j++;
          return obj;
        }, []);
      cp[_id].constants = filtered;
      this.setState({
        variablesItems: cp,
      });
      let ref = db.ref(`questions/${id}/variables/${_id}/constants`);
      ref.set(filtered);
    } else {
      let ref = db.ref(`questions/${id}/variables/${_id}`);
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

  newVariable = () => {
    this.setState({
      openNewVariableDialog: true,
    });
  };

  async getQuestions() {
    let db = this.props.firebase.db;
    await db.ref("questions").on("value", (snap) => {
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
  }

  getQuestionsByRef(id) {
    let db = this.props.firebase.db;
    let questionsRef = db.ref(`questions/${id}`);
    questionsRef.on("value", (snap) => {
      let data = snap.val();
      let questions = data?.questions ?? [];
      let conditions = data?.conditions ?? [];
      let variables = data?.variables ?? [];
      let items = JSON.parse(JSON.stringify(questions)) ?? [];
      let variablesItems = JSON.parse(JSON.stringify(variables)) ?? [];
      this.setState({
        loading: false,
        questions,
        conditions,
        variables,
        variablesItems,
        items,
      });
    });
  }

  handleChangeY = (e, index, key, id, type, sex) => {
    e.preventDefault();
    let value = e.target.value;
    if (type === "edit") {
      let questions = update(this.state.questions, {
        [index]: {
          answers: {
            [`${sex}`]: {
              [key]: {
                answers: {
                  [id]: {
                    y: {
                      $set: value,
                    },
                  },
                },
              },
            },
          },
        },
      });
      this.setState({ questions });
    } else {
      let newQuestion = update(this.state.newQuestion, {
        answers: {
          [`${sex}`]: {
            [key]: {
              answers: {
                [id]: {
                  y: {
                    $set: value,
                  },
                },
              },
            },
          },
        },
      });
      this.setState({ newQuestion });
    }
  };

  handleChangeX = (e, index, key, id, type, sex) => {
    e.preventDefault();
    let value = e.target.value;
    if (type === "edit") {
      let questions = update(this.state.questions, {
        [index]: {
          answers: {
            [`${sex}`]: {
              [key]: {
                answers: {
                  [id]: {
                    x: {
                      $set: value,
                    },
                  },
                },
              },
            },
          },
        },
      });
      this.setState({ questions });
    } else {
      let newQuestion = update(this.state.newQuestion, {
        answers: {
          [`${sex}`]: {
            [key]: {
              answers: {
                [id]: {
                  x: {
                    $set: value,
                  },
                },
              },
            },
          },
        },
      });
      this.setState({ newQuestion });
    }
  };

  handleChangePart = (e, index, key, id, type, sex) => {
    e.preventDefault();
    let value = e.target.value;
    if (type === "edit") {
      let questions = update(this.state.questions, {
        [index]: {
          answers: {
            [`${sex}`]: {
              [key]: {
                answers: {
                  [id]: {
                    content: {
                      $set: value,
                    },
                  },
                },
              },
            },
          },
        },
      });
      this.setState({ questions });
    } else {
      let newQuestion = update(this.state.newQuestion, {
        answers: {
          [`${sex}`]: {
            [key]: {
              answers: {
                [id]: {
                  content: {
                    $set: value,
                  },
                },
              },
            },
          },
        },
      });
      this.setState({ newQuestion });
    }
  };

  deletePart = (editIndex, key, id, sex) => {
    const { questions, newQuestion } = this.state;
    if (editIndex) {
      let j = 0;
      let cp = JSON.parse(JSON.stringify(questions));
      let filtered = Object.keys(cp[editIndex].answers[`${sex}`][key].answers)
        .filter((_key) => Number(id) !== Number(_key))
        .reduce((obj, _key) => {
          obj[j] = cp[editIndex].answers[`${sex}`][key].answers[_key];
          j++;
          return obj;
        }, []);
      cp[editIndex].answers[`${sex}`][key].answers = filtered;
      this.setState({ questions: cp });
    } else {
      let j = 0;
      let cp = JSON.parse(JSON.stringify(newQuestion));
      let filtered = Object.keys(cp.answers[`${sex}`][key].answers)
        .filter((_key) => Number(id) !== Number(_key))
        .reduce((obj, _key) => {
          obj[j] = cp.answers[`${sex}`][key].answers[_key];
          j++;
          return obj;
        }, []);
      cp.answers[`${sex}`][key].answers = filtered;
      this.setState({ newQuestion: cp });
    }
  };

  handleChangeTab = (event, newValue) => {
    this.setState({
      tab: newValue,
    });
  };

  render() {
    const { classes } = this.props;
    const {
      dragged,
      items,
      tab,
      loading,
      open,
      saveConditions,
      openDeleteDialog,
      openDeleteVariableDialog,
      openEditDialog,
      openEditVariableDialog,
      openNewQuestionDialog,
      openNewVariableDialog,
      editIndex,
      editVariableIndex,
      anchorMore,
      idList,
      idListEmail,
      idListSummary,
      id,
      conditions,
      questions,
      variables,
      variablesItems,
      newVariable,
      newQuestion,
      sex,
    } = this.state;
    return loading ? (
      <Loading />
    ) : (
      <>
        <h2>Questions</h2>
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
              inputProps={{ "aria-label": "Without label" }}
              displayEmpty
              style={{
                background: "white",
              }}
              value={id}
              onChange={(e) => {
                this.getQuestionsByRef(e.target.value);
                this.setState({
                  id: e.target.value,
                });
                localStorage.setItem("id", e.target.value);
              }}
            >
              <MenuItem value="" disabled>
                Questionnaires
              </MenuItem>
              {idList?.map((el, id) => (
                <MenuItem
                  key={"questionnaire_" + id}
                  value={`${el?.value}`}
                >{`Questionnaire nº${id + 1}`}</MenuItem>
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
            anchorEl={anchorMore}
            open={anchorMore || false}
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
                this.newQuestions();
              }}
            >
              Nouveau
            </MenuItem>
            <MenuItem
              component={Link}
              style={{
                color: "rgba(0, 0, 0, 0.87)",
              }}
              target="_blank"
              href={`${window.location.origin}/?id=${id}`}
              rel="noopener noreferrer"
            >
              Visualiser
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.onDelete();
              }}
            >
              Supprimer
            </MenuItem>
          </Menu>
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
        <Paper className={classes.tabs}>
          <Tabs
            indicatorColor="primary"
            textColor="primary"
            value={tab}
            onChange={this.handleChangeTab}
            aria-label="simple tabs example"
            style={{
              marginBottom: "1em",
            }}
          >
            <Tab className={classes.tab} label="Questions" {...a11yProps(0)} />
            <Tab className={classes.tab} label="Variables" {...a11yProps(1)} />
            <Tab
              className={classes.tab}
              label="Emailing & Récapitulatifs"
              {...a11yProps(2)}
            />
          </Tabs>
        </Paper>
        <TabPanel value={tab} index={0}>
          <Paper className={classes.root} elevation={3}>
            <TableContainer className={classes.container}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>#</TableCell>
                    <TableCell
                      style={{
                        width: "100%",
                      }}
                    >
                      Questions
                    </TableCell>
                    <TableCell
                      align={"right"}
                      style={{
                        minWidth: 125,
                      }}
                    />
                  </TableRow>
                </TableHead>
                <TableBody component={DroppableComponent(this.onDragEnd)}>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="2" />
                      <TableCell
                        colSpan="3"
                        style={{
                          color: "rgba(0, 0, 0, 0.54)",
                        }}
                      >
                        Aucune question.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items?.map((item, index) => (
                      <React.Fragment key={"item_" + index}>
                        <TableRow
                          className={classes.tableRow}
                          component={DraggableComponent(
                            index.toString(),
                            index
                          )}
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
                          <TableCell align={"right"}>
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
                            <Collapse
                              in={open[index]}
                              timeout="auto"
                              unmountOnExit
                            >
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
                                    {item?.mainImage
                                      ? "Remplacer"
                                      : "Téléverser"}
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
                                      onClick={() =>
                                        this.setUploadMain("", index)
                                      }
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

                                {item?.type === "body" && (
                                  <Select
                                    variant="outlined"
                                    value={sex || ""}
                                    onChange={(e) => {
                                      let value = e.target.value;
                                      this.setState({
                                        sex: value,
                                      });
                                    }}
                                  >
                                    <MenuItem value={"male"}>Homme</MenuItem>
                                    <MenuItem value={"female"}>Femme</MenuItem>
                                  </Select>
                                )}

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
                                      item?.answers?.map((el, key, array) => (
                                        <TableRow key={key + "_answers"}>
                                          <TableCell scope="row">
                                            {key + 1}
                                          </TableCell>
                                          <TableCell>{el?.content}</TableCell>
                                          <TableCell>
                                            {(item?.type === "radio" ||
                                              item?.type === "checkbox") &&
                                            !el?.image ? (
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
                                                  type="file"
                                                />
                                              </IconButton>
                                            ) : (
                                              el?.image && (
                                                <>
                                                  <img
                                                    src={el?.image}
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
                                                    className={
                                                      classes.deleteBtn
                                                    }
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

                                    {item?.type === "body" && (
                                      <>
                                        {sex === "male" &&
                                          item?.answers?.male.map(
                                            (el, key, array) => (
                                              <TableRow key={"answers_" + key}>
                                                <TableCell scope="row">
                                                  {`${key + 1}`}
                                                </TableCell>
                                                <TableCell>
                                                  {el?.answers?.map(
                                                    (ele, id) => (
                                                      <div
                                                        style={{
                                                          display: "flex",
                                                          alignItems: "center",
                                                        }}
                                                        key={`XY_${index}${key}${id}`}
                                                      >
                                                        <p>{ele?.content}</p>
                                                        <p
                                                          style={{
                                                            marginLeft: "0.5em",
                                                          }}
                                                        >
                                                          x: {ele?.x}
                                                        </p>
                                                        <p
                                                          style={{
                                                            marginLeft: "0.5em",
                                                          }}
                                                        >
                                                          y: {ele?.y}
                                                        </p>
                                                      </div>
                                                    )
                                                  )}
                                                </TableCell>
                                                <TableCell>
                                                  {(item?.type === "radio" ||
                                                    item?.type === "checkbox" ||
                                                    item?.type === "body") &&
                                                  !el?.image ? (
                                                    <IconButton
                                                      color="primary"
                                                      disabled={dragged}
                                                      aria-label="upload picture"
                                                      component="label"
                                                      onChange={(e) =>
                                                        this.handleUploadAnswer(
                                                          e,
                                                          index,
                                                          key,
                                                          item?.type === "body"
                                                            ? sex
                                                            : undefined
                                                        )
                                                      }
                                                    >
                                                      <PhotoCamera />
                                                      <input
                                                        accept="image/*"
                                                        className={
                                                          classes.input
                                                        }
                                                        type="file"
                                                      />
                                                    </IconButton>
                                                  ) : (
                                                    el?.image && (
                                                      <>
                                                        <img
                                                          src={el?.image}
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
                                                              key,
                                                              item?.type ===
                                                                "body"
                                                                ? sex
                                                                : undefined
                                                            )
                                                          }
                                                          aria-label="delete"
                                                          className={
                                                            classes.deleteBtn
                                                          }
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
                                            )
                                          )}
                                        {sex === "female" &&
                                          item?.answers?.female.map(
                                            (el, key, array) => (
                                              <TableRow key={"answers_" + key}>
                                                <TableCell scope="row">
                                                  {`${key + 1}`}
                                                </TableCell>
                                                <TableCell>
                                                  {el?.answers?.map(
                                                    (ele, id) => (
                                                      <div
                                                        style={{
                                                          display: "flex",
                                                          alignItems: "center",
                                                        }}
                                                        key={`XY_${index}${key}${id}`}
                                                      >
                                                        <p>{ele?.content}</p>
                                                        <p
                                                          style={{
                                                            marginLeft: "0.5em",
                                                          }}
                                                        >
                                                          x: {ele?.x}
                                                        </p>
                                                        <p
                                                          style={{
                                                            marginLeft: "0.5em",
                                                          }}
                                                        >
                                                          y: {ele?.y}
                                                        </p>
                                                      </div>
                                                    )
                                                  )}
                                                </TableCell>
                                                <TableCell>
                                                  {(item?.type === "radio" ||
                                                    item?.type === "checkbox" ||
                                                    item?.type === "body") &&
                                                  !el?.image ? (
                                                    <IconButton
                                                      color="primary"
                                                      disabled={dragged}
                                                      aria-label="upload picture"
                                                      component="label"
                                                      onChange={(e) =>
                                                        this.handleUploadAnswer(
                                                          e,
                                                          index,
                                                          key,
                                                          item?.type === "body"
                                                            ? sex
                                                            : undefined
                                                        )
                                                      }
                                                    >
                                                      <PhotoCamera />
                                                      <input
                                                        accept="image/*"
                                                        className={
                                                          classes.input
                                                        }
                                                        type="file"
                                                      />
                                                    </IconButton>
                                                  ) : (
                                                    el?.image && (
                                                      <>
                                                        <img
                                                          src={el?.image}
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
                                                              key,
                                                              item?.type ===
                                                                "body"
                                                                ? sex
                                                                : undefined
                                                            )
                                                          }
                                                          aria-label="delete"
                                                          className={
                                                            classes.deleteBtn
                                                          }
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
                                            )
                                          )}
                                      </>
                                    )}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <Button
            className={classes.button}
            style={{
              marginBottom: "1em",
            }}
            variant="contained"
            size="small"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => this.newQuestion()}
          >
            Nouvelle question
          </Button>
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <Paper className={classes.root} elevation={3}>
            <TableContainer className={classes.container}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>#</TableCell>
                    <TableCell
                      style={{
                        width: "100%",
                      }}
                    >
                      Variable
                    </TableCell>
                    <TableCell
                      align={"right"}
                      style={{
                        minWidth: 125,
                      }}
                    />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variablesItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="2" />
                      <TableCell
                        colSpan="3"
                        style={{
                          color: "rgba(0, 0, 0, 0.54)",
                        }}
                      >
                        Aucune variable.
                      </TableCell>
                    </TableRow>
                  ) : (
                    variablesItems?.map((el, index) => (
                      <TableRow
                        key={`variable${index}`}
                        className={classes.tableRow}
                      >
                        <TableCell />
                        <TableCell>{`${index + 1}`}</TableCell>
                        <TableCell>{el?.name}</TableCell>
                        <TableCell align={"right"}>
                          <IconButton
                            aria-label="edit"
                            onClick={() => this.showEditVariableDialog(index)}
                            disabled={dragged}
                            className={classes.deleteBtn}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            aria-label="delete"
                            onClick={() => this.showDeleteVariableDialog(index)}
                            disabled={dragged}
                            className={classes.deleteBtn}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
            onClick={() => this.newVariable()}
          >
            Nouvelle variable
          </Button>
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <Paper className={classes.root} elevation={3}>
            <div
              style={{
                padding: "1em",
              }}
            >
              {conditions.length === 0 ? (
                <p
                  style={{
                    color: "rgba(0, 0, 0, 0.54)",
                    fontSize: "0.875rem",
                    marginLeft: "1em",
                  }}
                >
                  Aucune condition d'envoi.
                </p>
              ) : (
                conditions?.map((el, id) => (
                  <>
                    {el?.conditions?.map((condition, key) => (
                      <div
                        key={"condition_" + key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        {key === 0 && (
                          <b style={{ marginRight: "0.5em" }}>Si</b>
                        )}
                        {key >= 1 && <b style={{ marginRight: "0.5em" }}>et</b>}
                        <Select
                          inputProps={{ "aria-label": "Without label" }}
                          displayEmpty
                          variant="outlined"
                          size="small"
                          style={{
                            height: 40,
                          }}
                          value={
                            conditions[id]?.conditions[key]?.question || ""
                          }
                          onChange={(e) => {
                            const { conditions } = this.state;
                            let cp = conditions;
                            let value = e.target.value;
                            cp[id].conditions[key].question = value;
                            cp[id].conditions[key].value = "";
                            this.setState({
                              conditions: cp,
                              saveConditions: true,
                            });
                          }}
                        >
                          <MenuItem value="" disabled>
                            Question ou variable
                          </MenuItem>
                          {items.map((item, id) => (
                            <MenuItem
                              value={item?.question}
                              key={"item_question_" + id}
                            >
                              {item?.question}
                            </MenuItem>
                          ))}
                          {variables.map((variable, id) => (
                            <MenuItem
                              value={variable?.name}
                              key={"variable_name_" + id}
                            >
                              {variable?.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {items[
                          items.findIndex(
                            (item) =>
                              item?.question ===
                              conditions[id]?.conditions[key]?.question
                          )
                        ]?.type === "number" ||
                        items.findIndex(
                          (item) =>
                            item?.question ===
                            conditions[id]?.conditions[key]?.question
                        ) === -1 ? (
                          <Select
                            size="small"
                            style={{ marginLeft: "0.5em", height: 40 }}
                            inputProps={{ "aria-label": "Without label" }}
                            displayEmpty
                            variant="outlined"
                            value={
                              conditions[id]?.conditions[key]?.operator || ""
                            }
                            onChange={(e) => {
                              const { conditions } = this.state;
                              let cp = conditions;
                              let value = e.target.value;
                              cp[id].conditions[key].operator = value;
                              cp[id].conditions[key].value = "";
                              this.setState({
                                conditions: cp,
                                saveConditions: true,
                              });
                            }}
                          >
                            <MenuItem value="" disabled>
                              Condition
                            </MenuItem>
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
                          </Select>
                        ) : (
                          <Select
                            size="small"
                            variant="outlined"
                            style={{ marginLeft: "0.5em", height: 40 }}
                            inputProps={{ "aria-label": "Without label" }}
                            displayEmpty
                            value={
                              conditions[id]?.conditions[key]?.operator || ""
                            }
                            onChange={(e) => {
                              const { conditions } = this.state;
                              let cp = conditions;
                              let value = e.target.value;
                              cp[id].conditions[key].operator = value;
                              cp[id].conditions[key].value = "";
                              this.setState({
                                conditions: cp,
                                saveConditions: true,
                              });
                            }}
                          >
                            <MenuItem value="" disabled>
                              Condition
                            </MenuItem>
                            <MenuItem value={"==="}>
                              <b>est égal à</b>
                            </MenuItem>
                          </Select>
                        )}
                        {items[
                          items.findIndex(
                            (item) =>
                              item?.question ===
                              conditions[id]?.conditions[key]?.question
                          )
                        ]?.type === "checkbox" ? (
                          <Select
                            multiple
                            variant="outlined"
                            displayEmpty
                            style={{ marginLeft: "0.5em", height: 40 }}
                            onChange={(e) => {
                              if (e.target.value)
                                this.handleChangeMultiple(e, id, key);
                            }}
                            input={<Select variant="outlined" />}
                            value={conditions[id]?.conditions[key].value || []}
                            renderValue={() => {
                              if (
                                conditions[id]?.conditions[key].value.length ===
                                0
                              ) {
                                return <span>Réponse(s)</span>;
                              }

                              return conditions[id]?.conditions[key].value.join(
                                ", "
                              );
                            }}
                            MenuProps={MenuProps}
                            inputProps={{ "aria-label": "Without label" }}
                          >
                            <MenuItem disabled value="">
                              Réponse(s)
                            </MenuItem>
                            {items[
                              items.findIndex(
                                (item) =>
                                  item?.question ===
                                  conditions[id]?.conditions[key]?.question
                              )
                            ]?.answers?.map((item) => (
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
                          ]?.type === "body" ? (
                          <Select
                            multiple
                            variant="outlined"
                            displayEmpty
                            style={{ marginLeft: "0.5em", height: 40 }}
                            onChange={(e) => {
                              if (e.target.value)
                                this.handleChangeMultiple(e, id, key);
                            }}
                            input={<Select variant="outlined" />}
                            value={conditions[id]?.conditions[key].value || []}
                            renderValue={() => {
                              if (
                                conditions[id]?.conditions[key].value.length ===
                                0
                              ) {
                                return <span>Réponse(s)</span>;
                              }
                              return conditions[id]?.conditions[key].value.join(
                                ", "
                              );
                            }}
                            MenuProps={MenuProps}
                            inputProps={{ "aria-label": "Without label" }}
                          >
                            <MenuItem disabled value="">
                              Réponse(s)
                            </MenuItem>
                            {Object.keys(
                              items[
                                items.findIndex(
                                  (item) =>
                                    item?.question ===
                                    conditions[id]?.conditions[key]?.question
                                )
                              ]?.answers
                            ).map((_, _key) =>
                              items[
                                items.findIndex(
                                  (item) =>
                                    item?.question ===
                                    conditions[id]?.conditions[key]?.question
                                )
                              ]?.answers[_key]?.answers?.map((item) => (
                                <MenuItem
                                  key={item?.content}
                                  value={item?.content}
                                  style={getStyles(item?.content, items)}
                                >
                                  {item?.content}
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        ) : items[
                            items.findIndex(
                              (item) =>
                                item?.question ===
                                conditions[id]?.conditions[key]?.question
                            )
                          ]?.type === "radio" ? (
                          <Select
                            variant="outlined"
                            size="small"
                            style={{ marginLeft: "0.5em", height: 40 }}
                            inputProps={{ "aria-label": "Without label" }}
                            displayEmpty
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
                            <MenuItem value="" disabled>
                              Réponse
                            </MenuItem>
                            {items[
                              items.findIndex(
                                (item) =>
                                  item?.question ===
                                  conditions[id]?.conditions[key]?.question
                              )
                            ]?.answers?.map((item) => {
                              return (
                                <MenuItem
                                  value={item?.content}
                                  key={item?.content}
                                >
                                  {item?.content}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        ) : conditions[id]?.conditions[key]?.operator !==
                            "><" &&
                          conditions[id]?.conditions[key]?.operator !==
                            ">><<" ? (
                          <TextField
                            size="small"
                            style={{ marginLeft: "0.5em", height: 40 }}
                            placeholder="Réponse"
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
                            variant="outlined"
                            value={conditions[id]?.conditions[key]?.value || ""}
                          />
                        ) : (
                          <>
                            <TextField
                              size="small"
                              style={{ marginLeft: "0.5em", height: 40 }}
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
                              variant="outlined"
                              placeholder="Réponse"
                              value={
                                conditions[id]?.conditions[key]?.value[0] || ""
                              }
                            />
                            <b style={{ textAlign: "center", margin: "0.5em" }}>
                              et
                            </b>
                            <TextField
                              size="small"
                              placeholder="Réponse"
                              style={{ marginLeft: "0.5em", height: 40 }}
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
                              variant="outlined"
                              value={
                                conditions[id]?.conditions[key]?.value[1] || ""
                              }
                            />
                          </>
                        )}
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p>Alors, envoyer :</p>
                      <Select
                        size="small"
                        variant="outlined"
                        style={{
                          marginLeft: "0.5em",
                        }}
                        inputProps={{ "aria-label": "Without label" }}
                        displayEmpty
                        value={conditions[id]?.sendEmail || ""}
                        onChange={(e) => {
                          const { conditions } = this.state;
                          let cp = conditions;
                          let index = e.target.value;
                          cp[id].sendEmail = index;
                          this.setState({
                            conditions: cp,
                            saveConditions: true,
                          });
                        }}
                      >
                        <MenuItem value="" disabled>
                          Emailing
                        </MenuItem>
                        {idListEmail?.map((el, id) => (
                          <MenuItem key={id} value={el?.value}>{`Email nº${
                            id + 1
                          }`}</MenuItem>
                        ))}
                      </Select>
                      <p
                        style={{
                          marginLeft: "0.5em",
                        }}
                      >
                        et afficher :
                      </p>
                      <Select
                        size="small"
                        variant="outlined"
                        style={{
                          marginLeft: "0.5em",
                        }}
                        inputProps={{ "aria-label": "Without label" }}
                        displayEmpty
                        value={conditions[id]?.showSummary || ""}
                        onChange={(e) => {
                          const { conditions } = this.state;
                          let cp = conditions;
                          let index = e.target.value;
                          cp[id].showSummary = index;
                          this.setState({
                            conditions: cp,
                            saveConditions: true,
                          });
                        }}
                      >
                        <MenuItem value="" disabled>
                          Récapitulatifs
                        </MenuItem>
                        {idListSummary?.map((el, id) => (
                          <MenuItem
                            key={"recap_" + id}
                            value={el?.value}
                          >{`Récapitulatif nº${id + 1}`}</MenuItem>
                        ))}
                      </Select>
                    </div>
                    <hr />
                  </>
                ))
              )}
            </div>
          </Paper>
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
        </TabPanel>
        <Dialog
          open={openDeleteDialog || false}
          onClose={() => {
            this.setState({
              deleteIndex: null,
              openDeleteDialog: false,
            });
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle>
            {"Êtes-vous sûr de vouloir supprimer cette question ?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>Cette action est irréversible</DialogContentText>
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
          open={openDeleteVariableDialog || false}
          onClose={() => {
            this.setState({
              deleteVariableIndex: null,
              openDeleteVariableDialog: false,
            });
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle>
            {"Êtes-vous sûr de vouloir supprimer cette variable ?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>Cette action est irréversible</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({
                  deleteVariableIndex: null,
                  openDeleteVariableDialog: false,
                });
              }}
              color="primary"
            >
              Annuler
            </Button>
            <DeleteButton
              onClick={() => {
                this.deleteVariable();
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
          maxWidth="md"
          open={openNewQuestionDialog || false}
          onClose={() => {
            this.setState({
              openNewQuestionDialog: false,
            });
          }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle>Nouvelle question</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              variant="outlined"
              onChange={(e) => this.handleChangeNameNewQuestion(e)}
              value={newQuestion?.question || ""}
              placeholder="Question"
              type="text"
              style={{
                width: "100%",
              }}
            />
            <br />

            <TextField
              margin="dense"
              variant="outlined"
              onChange={(e) => this.handleChangeDescriptionNewQuestion(e)}
              value={newQuestion?.description || ""}
              placeholder="Description"
              type="text"
              style={{
                width: "100%",
              }}
              multiline
              rows={3}
              rowsMax={Infinity}
            />
            <br />
            <FormControl
              variant="outlined"
              required
              className={classes.formControl}
            >
              <Select
                placeholder="Type"
                inputProps={{ "aria-label": "Without label" }}
                displayEmpty
                variant="outlined"
                value={newQuestion?.type || ""}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value === "body") {
                    this.setState((state, props) => ({
                      newQuestion: {
                        ...state.newQuestion,
                        type: value,
                        answers: {
                          male: {
                            0: {
                              answers: {
                                0: {
                                  content: "",
                                  x: 0,
                                  y: 0,
                                },
                              },
                              image: "",
                            },
                            1: {
                              answers: {
                                0: {
                                  content: "",
                                  x: 0,
                                  y: 0,
                                },
                              },
                              image: "",
                            },
                          },
                          female: {
                            0: {
                              answers: {
                                0: {
                                  content: "",
                                  x: 0,
                                  y: 0,
                                },
                              },
                              image: "",
                            },
                            1: {
                              answers: {
                                0: {
                                  content: "",
                                  x: 0,
                                  y: 0,
                                },
                              },
                              image: "",
                            },
                          },
                        },
                      },
                    }));
                  } else {
                    this.setState((state, props) => ({
                      newQuestion: {
                        ...state.newQuestion,
                        type: value,
                        answers: {
                          0: {
                            content: "",
                          },
                        },
                      },
                    }));
                  }
                }}
              >
                <MenuItem value="" disabled>
                  Type
                </MenuItem>
                <MenuItem value={"text"}>Entrée</MenuItem>
                <MenuItem value={"number"}>Nombre</MenuItem>
                <MenuItem value={"email"}>Email</MenuItem>
                <MenuItem value={"radio"}>Sélection</MenuItem>
                <MenuItem value={"checkbox"}>Multi-sélection</MenuItem>
                <MenuItem value={"body"}>Parties du corps</MenuItem>
              </Select>
            </FormControl>
            {newQuestion?.type === "number" && (
              <TextField
                required
                variant="outlined"
                margin="dense"
                placeholder="Ex. : âge"
                type="text"
                onChange={(e) => this.handleChangeNewQuestionAnswers(e, 0)}
                value={newQuestion.answers[0]?.content || ""}
              />
            )}
            {newQuestion?.type === "text" && (
              <TextField
                required
                margin="dense"
                variant="outlined"
                placeholder="Ex. : Prénom"
                type="text"
                onChange={(e) => this.handleChangeNewQuestionAnswers(e, 0)}
                value={newQuestion.answers[0]?.content || ""}
              />
            )}
            {newQuestion?.type === "email" && (
              <TextField
                required
                margin="dense"
                variant="outlined"
                placeholder="Ex. : Email"
                type="text"
                onChange={(e) => this.handleChangeNewQuestionAnswers(e, 0)}
                value={newQuestion.answers[0]?.content || ""}
              />
            )}
            {newQuestion?.type === "checkbox" && (
              <>
                {Object.keys(newQuestion.answers).map((el, id) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    key={"newQuestion_answers_" + id}
                  >
                    <TextField
                      required
                      margin="dense"
                      variant="outlined"
                      placeholder={`Option n°${id + 1}`}
                      value={newQuestion.answers[`${id}`]?.content || ""}
                      onChange={(e) =>
                        this.handleChangeNewQuestionAnswers(e, id)
                      }
                      type="text"
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
            {newQuestion?.type === "radio" && (
              <>
                {Object.keys(newQuestion.answers).map((el, id) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    key={"newQuestion_answers_" + id}
                  >
                    <TextField
                      required
                      margin="dense"
                      variant="outlined"
                      placeholder={`Option n°${id + 1}`}
                      value={newQuestion.answers[`${id}`]?.content || ""}
                      onChange={(e) =>
                        this.handleChangeNewQuestionAnswers(e, id)
                      }
                      type="text"
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
            {newQuestion?.type === "body" && (
              <>
                <FormControl
                  required
                  variant="outlined"
                  className={classes.formControl}
                  margin="dense"
                  size="small"
                  style={{
                    marginLeft: "0.5em",
                  }}
                >
                  <Select
                    variant="outlined"
                    value={sex || ""}
                    onChange={(e) => {
                      let value = e.target.value;
                      this.setState({
                        sex: value,
                      });
                    }}
                  >
                    <MenuItem value={"male"}>Homme</MenuItem>
                    <MenuItem value={"female"}>Femme</MenuItem>
                  </Select>
                </FormControl>
                {sex === "male" &&
                  Object.keys(newQuestion.answers.male).map((el, key) => (
                    <TableRow key={"newQuestion_answers_male_" + key}>
                      <TableCell
                        style={{
                          minWidth: 300,
                        }}
                      >
                        {Object.keys(newQuestion.answers.male[key].answers).map(
                          (ele, id) => (
                            <div
                              key={`set_XY_male_${key}${id}`}
                              style={{
                                marginRight: "1em",
                              }}
                            >
                              <TextField
                                id={`setPart_male_${key}${id}`}
                                key={`setPart_male_${key}${id}`}
                                variant="outlined"
                                size="small"
                                placeholder={"Partie"}
                                value={
                                  newQuestion.answers.male[key].answers[ele]
                                    .content || ""
                                }
                                onChange={(e) => {
                                  this.handleChangePart(
                                    e,
                                    undefined,
                                    key,
                                    id,
                                    "new",
                                    "male"
                                  );
                                }}
                              />
                              {id > 0 && (
                                <IconButton
                                  variant="contained"
                                  onClick={() =>
                                    this.deletePart(undefined, key, id, "male")
                                  }
                                  aria-label="delete"
                                  className={classes.deleteBtn}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                              <form
                                id={`setXY${key}${id}`}
                                noValidate
                                variant="outlined"
                                autoComplete="off"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  margin: "0.5em 0 1.5em",
                                }}
                              >
                                <TextField
                                  id={`setX${key}${id}`}
                                  key={`setX${key}${id}`}
                                  size="small"
                                  variant="outlined"
                                  placeholder={"X"}
                                  style={{
                                    width: 75,
                                  }}
                                  type={"number"}
                                  onChange={(e) => {
                                    this.handleChangeX(
                                      e,
                                      undefined,
                                      key,
                                      id,
                                      "new",
                                      "male"
                                    );
                                  }}
                                  value={
                                    newQuestion.answers.male[key].answers[ele]
                                      .x || ""
                                  }
                                />
                                <TextField
                                  id={`setY${key}${id}`}
                                  key={`setY${key}${id}`}
                                  size="small"
                                  variant="outlined"
                                  placeholder={"Y"}
                                  style={{
                                    marginLeft: "0.5em",
                                    width: 75,
                                  }}
                                  type={"number"}
                                  onChange={(e) => {
                                    this.handleChangeY(
                                      e,
                                      undefined,
                                      key,
                                      id,
                                      "new",
                                      "male"
                                    );
                                  }}
                                  value={
                                    newQuestion.answers.male[key].answers[ele]
                                      .y || ""
                                  }
                                />
                              </form>
                            </div>
                          )
                        )}
                        <Button
                          className={classes.button}
                          variant="contained"
                          size="small"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            this.addNewPart(key, undefined, "male");
                          }}
                        >
                          Ajouter une partie
                        </Button>
                      </TableCell>
                      <TableCell>
                        {el?.image && (
                          <div
                            style={{ position: "relative" }}
                            className={"body"}
                          >
                            {Object.keys(
                              newQuestion.answers.male[key].answers
                            ).map((ele, id) => (
                              <div
                                key={`bodySelect_male${id}`}
                                className={`bodySelect`}
                                id={`bodySelect_male${id}`}
                                style={{
                                  left: `${newQuestion.answers.male[key].answers[ele].x}px`,
                                  top: `${newQuestion.answers.male[key].answers[ele].y}px`,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  name="bodySelect"
                                  value={
                                    newQuestion.answers.male[key].answers[ele]
                                      .content
                                  }
                                  id={`part${key}${id}`}
                                />
                                <label htmlFor={`part${key}${id}`}>
                                  {
                                    newQuestion.answers.male[key].answers[ele]
                                      .content
                                  }
                                </label>
                              </div>
                            ))}
                            <img
                              src={newQuestion.answers.male[key].image}
                              width="100%"
                              height="100%"
                              alt=""
                            />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                {sex === "female" &&
                  Object.keys(newQuestion.answers.female).map((el, key) => (
                    <TableRow key={"answers_female" + key}>
                      <TableCell
                        style={{
                          minWidth: 300,
                        }}
                      >
                        {Object.keys(
                          newQuestion.answers.female[key].answers
                        ).map((ele, id) => (
                          <div
                            key={`set_XY_female${key}${id}`}
                            style={{
                              marginRight: "1em",
                            }}
                          >
                            <TextField
                              id={`setPart_female${key}${id}`}
                              key={`setPart_female${key}${id}`}
                              variant="outlined"
                              size="small"
                              placeholder={"Partie"}
                              value={
                                newQuestion.answers.female[key].answers[ele]
                                  .content || ""
                              }
                              onChange={(e) => {
                                this.handleChangePart(
                                  e,
                                  undefined,
                                  key,
                                  id,
                                  "new",
                                  "female"
                                );
                              }}
                            />
                            {id > 0 && (
                              <IconButton
                                variant="contained"
                                onClick={() =>
                                  this.deletePart(undefined, key, id, "female")
                                }
                                aria-label="delete"
                                className={classes.deleteBtn}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                            <form
                              id={`setXY${key}${id}`}
                              noValidate
                              variant="outlined"
                              autoComplete="off"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                margin: "0.5em 0 1.5em",
                              }}
                            >
                              <TextField
                                id={`setX${key}${id}`}
                                key={`setX${key}${id}`}
                                size="small"
                                variant="outlined"
                                placeholder={"X"}
                                style={{
                                  width: 75,
                                }}
                                type={"number"}
                                onChange={(e) => {
                                  this.handleChangeX(
                                    e,
                                    undefined,
                                    key,
                                    id,
                                    "new",
                                    "female"
                                  );
                                }}
                                value={
                                  newQuestion.answers.female[key].answers[ele]
                                    .x || ""
                                }
                              />
                              <TextField
                                id={`setY${key}${id}`}
                                key={`setY${key}${id}`}
                                size="small"
                                variant="outlined"
                                placeholder={"Y"}
                                style={{
                                  marginLeft: "0.5em",
                                  width: 75,
                                }}
                                type={"number"}
                                onChange={(e) => {
                                  this.handleChangeY(
                                    e,
                                    undefined,
                                    key,
                                    id,
                                    "new",
                                    "female"
                                  );
                                }}
                                value={
                                  newQuestion.answers.female[key].answers[ele]
                                    .y || ""
                                }
                              />
                            </form>
                          </div>
                        ))}
                        <Button
                          className={classes.button}
                          variant="contained"
                          size="small"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            this.addNewPart(key, undefined, "female");
                          }}
                        >
                          Ajouter une partie
                        </Button>
                      </TableCell>
                      <TableCell>
                        {el?.image && (
                          <div
                            style={{ position: "relative" }}
                            className={"body"}
                          >
                            {Object.keys(
                              newQuestion.answers.female[key].answers
                            ).map((ele, id) => (
                              <div
                                key={`bodySelect_female${id}`}
                                className={`bodySelect`}
                                id={`bodySelect_female${id}`}
                                style={{
                                  left: `${newQuestion.answers.female[key].answers[ele].x}px`,
                                  top: `${newQuestion.answers.female[key].answers[ele].y}px`,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  name="bodySelect"
                                  value={
                                    newQuestion.answers.female[key].answers[ele]
                                      .content
                                  }
                                  id={`part${key}${id}`}
                                />
                                <label htmlFor={`part${key}${id}`}>
                                  {
                                    newQuestion.answers.female[key].answers[ele]
                                      .content
                                  }
                                </label>
                              </div>
                            ))}
                            <img
                              src={newQuestion.answers.female[key].image}
                              width="100%"
                              height="100%"
                              alt=""
                            />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
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
              disabled={!newQuestion.answers || !newQuestion.question}
              onClick={() => this.addNewQuestion()}
              color="primary"
              variant="contained"
            >
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openEditDialog || false}
          maxWidth="md"
          fullWidth
          onClose={() => {
            this.setState({
              openEditDialog: false,
            });
          }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle>Modifier une question</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              variant="outlined"
              onChange={(e) => this.handleChangeNameQuestion(e)}
              value={questions[editIndex]?.question || ""}
              placeholder="Question"
              type="text"
              style={{
                width: "100%",
              }}
            />
            <br />
            <TextField
              margin="dense"
              variant="outlined"
              onChange={(e) => this.handleChangeDescriptionQuestion(e)}
              value={questions[editIndex]?.description || ""}
              placeholder="Description"
              type="text"
              style={{
                width: "100%",
              }}
              rows={3}
              multiline
              rowsMax={Infinity}
            />
            <br />
            <FormControl required className={classes.formControl}>
              <Select
                placeholder="Type"
                variant="outlined"
                value={questions[editIndex]?.type || ""}
                inputProps={{ "aria-label": "Without label" }}
                displayEmpty
                onChange={(e) => {
                  let value = e.target.value;
                  if (value === "body") {
                    this.setState((state, props) => ({
                      questions: {
                        ...state.questions,
                        [state.editIndex]: {
                          ...state.questions[state.editIndex],
                          type: value,
                          answers: {
                            0: {
                              answers: {
                                0: {
                                  content: "",
                                  x: 0,
                                  y: 0,
                                },
                              },
                              image: "",
                            },
                            1: {
                              answers: {
                                0: {
                                  content: "",
                                  x: 0,
                                  y: 0,
                                },
                              },
                              image: "",
                            },
                          },
                        },
                      },
                    }));
                  } else {
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
                  }
                }}
              >
                <MenuItem value="" disabled>
                  Type
                </MenuItem>
                <MenuItem value={"text"}>Entrée</MenuItem>
                <MenuItem value={"number"}>Nombre</MenuItem>
                <MenuItem value={"email"}>Email</MenuItem>
                <MenuItem value={"radio"}>Sélection</MenuItem>
                <MenuItem value={"checkbox"}>Multi-sélection</MenuItem>
                <MenuItem value={"body"}>Parties du corps</MenuItem>
              </Select>
            </FormControl>
            {questions[editIndex]?.type === "number" && (
              <TextField
                required
                margin="dense"
                variant="outlined"
                placeholder="Ex. : âge"
                type="text"
                onChange={(e) => this.handleChangeQuestionAnswers(e, 0)}
                value={questions[editIndex]?.answers[0]?.content || ""}
              />
            )}
            {questions[editIndex]?.type === "text" && (
              <TextField
                required
                margin="dense"
                variant="outlined"
                placeholder="Ex. : Prénom"
                type="text"
                onChange={(e) => this.handleChangeQuestionAnswers(e, 0)}
                value={questions[editIndex]?.answers[0]?.content || ""}
              />
            )}
            {questions[editIndex]?.type === "email" && (
              <TextField
                required
                margin="dense"
                variant="outlined"
                placeholder="Ex. : Email"
                type="text"
                onChange={(e) => this.handleChangeQuestionAnswers(e, 0)}
                value={questions[editIndex]?.answers[0]?.content || ""}
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
                    key={"options_" + id}
                  >
                    <TextField
                      required
                      margin="dense"
                      variant="outlined"
                      placeholder={`Option n°${id + 1}`}
                      value={
                        questions[editIndex]?.answers[`${id}`]?.content || ""
                      }
                      onChange={(e) => this.handleChangeQuestionAnswers(e, id)}
                      type="text"
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
                    key={"options_" + id}
                  >
                    <TextField
                      required
                      variant="outlined"
                      margin="dense"
                      placeholder={`Option n°${id + 1}`}
                      value={
                        questions[editIndex]?.answers[`${id}`]?.content || ""
                      }
                      onChange={(e) => this.handleChangeQuestionAnswers(e, id)}
                      type="text"
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
            {questions[editIndex]?.type === "body" && (
              <>
                <FormControl
                  required
                  variant="outlined"
                  className={classes.formControl}
                  margin="dense"
                  size="small"
                  style={{
                    marginLeft: "0.5em",
                  }}
                >
                  <Select
                    variant="outlined"
                    value={sex || ""}
                    onChange={(e) => {
                      let value = e.target.value;
                      this.setState({
                        sex: value,
                      });
                    }}
                  >
                    <MenuItem value={"male"}>Homme</MenuItem>
                    <MenuItem value={"female"}>Femme</MenuItem>
                  </Select>
                </FormControl>
                {sex === "male" &&
                  questions[editIndex]?.answers?.male.map((el, key, array) => (
                    <TableRow key={"answers_male" + key}>
                      <TableCell
                        style={{
                          minWidth: 300,
                        }}
                      >
                        {el?.answers?.map((ele, id) => (
                          <div
                            key={`set_XY_male${editIndex}${key}${id}`}
                            style={{
                              marginRight: "1em",
                            }}
                          >
                            <TextField
                              id={`setPart_male${editIndex}${key}${id}`}
                              key={`setPart_male${editIndex}${key}${id}`}
                              variant="outlined"
                              size="small"
                              placeholder={"Partie"}
                              value={ele?.content || ""}
                              onChange={(e) => {
                                this.handleChangePart(
                                  e,
                                  editIndex,
                                  key,
                                  id,
                                  "edit",
                                  "male"
                                );
                              }}
                            />
                            {id > 0 && (
                              <IconButton
                                variant="contained"
                                onClick={() =>
                                  this.deletePart(editIndex, key, id, "male")
                                }
                                aria-label="delete"
                                className={classes.deleteBtn}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                            <form
                              id={`setXY${editIndex}${key}${id}`}
                              noValidate
                              variant="outlined"
                              autoComplete="off"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                margin: "0.5em 0 1.5em",
                              }}
                            >
                              <TextField
                                id={`setX${editIndex}${key}${id}`}
                                key={`setX${editIndex}${key}${id}`}
                                size="small"
                                variant="outlined"
                                placeholder={"X"}
                                style={{
                                  width: 75,
                                }}
                                type={"number"}
                                onChange={(e) => {
                                  this.handleChangeX(
                                    e,
                                    editIndex,
                                    key,
                                    id,
                                    "edit",
                                    "male"
                                  );
                                }}
                                value={ele?.x || ""}
                              />
                              <TextField
                                id={`setY${editIndex}${key}${id}`}
                                key={`setY${editIndex}${key}${id}`}
                                size="small"
                                variant="outlined"
                                placeholder={"Y"}
                                style={{
                                  marginLeft: "0.5em",
                                  width: 75,
                                }}
                                type={"number"}
                                onChange={(e) => {
                                  this.handleChangeY(
                                    e,
                                    editIndex,
                                    key,
                                    id,
                                    "edit",
                                    "male"
                                  );
                                }}
                                value={ele?.y || ""}
                              />
                            </form>
                          </div>
                        ))}
                        <Button
                          className={classes.button}
                          variant="contained"
                          size="small"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            this.addNewPart(key, editIndex, "male");
                          }}
                        >
                          Ajouter une partie
                        </Button>
                      </TableCell>
                      <TableCell>
                        {el?.image && (
                          <div
                            style={{ position: "relative" }}
                            className={"body"}
                          >
                            {el?.answers?.map((ele, id) => (
                              <div
                                key={`bodySelect_male${id}`}
                                className={`bodySelect`}
                                id={`bodySelect_male${id}`}
                                style={{
                                  left: `${ele?.x}px`,
                                  top: `${ele?.y}px`,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  name="bodySelect"
                                  value={ele?.content}
                                  id={`part_male${key}${id}`}
                                />
                                <label htmlFor={`part_male${key}${id}`}>
                                  {ele?.content}
                                </label>
                              </div>
                            ))}
                            <img
                              src={el?.image}
                              width="100%"
                              height="100%"
                              alt=""
                            />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                {sex === "female" &&
                  questions[editIndex]?.answers?.female.map(
                    (el, key, array) => (
                      <TableRow key={"answers_" + key}>
                        <TableCell
                          style={{
                            minWidth: 300,
                          }}
                        >
                          {el?.answers?.map((ele, id) => (
                            <div
                              key={`set_XY_female${editIndex}${key}${id}`}
                              style={{
                                marginRight: "1em",
                              }}
                            >
                              <TextField
                                id={`setPart_female${editIndex}${key}${id}`}
                                key={`setPart_female${editIndex}${key}${id}`}
                                variant="outlined"
                                size="small"
                                placeholder={"Partie"}
                                value={ele?.content || ""}
                                onChange={(e) => {
                                  this.handleChangePart(
                                    e,
                                    editIndex,
                                    key,
                                    id,
                                    "edit",
                                    "female"
                                  );
                                }}
                              />
                              {id > 0 && (
                                <IconButton
                                  variant="contained"
                                  onClick={() =>
                                    this.deletePart(
                                      editIndex,
                                      key,
                                      id,
                                      "female"
                                    )
                                  }
                                  aria-label="delete"
                                  className={classes.deleteBtn}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                              <form
                                id={`setXY_female${editIndex}${key}${id}`}
                                noValidate
                                variant="outlined"
                                autoComplete="off"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  margin: "0.5em 0 1.5em",
                                }}
                              >
                                <TextField
                                  id={`setX${editIndex}${key}${id}`}
                                  key={`setX${editIndex}${key}${id}`}
                                  size="small"
                                  variant="outlined"
                                  placeholder={"X"}
                                  style={{
                                    width: 75,
                                  }}
                                  type={"number"}
                                  onChange={(e) => {
                                    this.handleChangeX(
                                      e,
                                      editIndex,
                                      key,
                                      id,
                                      "edit",
                                      "female"
                                    );
                                  }}
                                  value={ele?.x || ""}
                                />
                                <TextField
                                  id={`setY${editIndex}${key}${id}`}
                                  key={`setY${editIndex}${key}${id}`}
                                  size="small"
                                  variant="outlined"
                                  placeholder={"Y"}
                                  style={{
                                    marginLeft: "0.5em",
                                    width: 75,
                                  }}
                                  type={"number"}
                                  onChange={(e) => {
                                    this.handleChangeY(
                                      e,
                                      editIndex,
                                      key,
                                      id,
                                      "edit",
                                      "female"
                                    );
                                  }}
                                  value={ele?.y || ""}
                                />
                              </form>
                            </div>
                          ))}
                          <Button
                            className={classes.button}
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => {
                              this.addNewPart(key, editIndex, "female");
                            }}
                          >
                            Ajouter une partie
                          </Button>
                        </TableCell>
                        <TableCell>
                          {el?.image && (
                            <div
                              style={{ position: "relative" }}
                              className={"body"}
                            >
                              {el?.answers?.map((ele, id) => (
                                <div
                                  key={`bodySelect_female${id}`}
                                  className={`bodySelect`}
                                  id={`bodySelect_female${id}`}
                                  style={{
                                    left: `${ele?.x}px`,
                                    top: `${ele?.y}px`,
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    name="bodySelect"
                                    value={ele?.content}
                                    id={`part_female${key}${id}`}
                                  />
                                  <label htmlFor={`part_female${key}${id}`}>
                                    {ele?.content}
                                  </label>
                                </div>
                              ))}
                              <img
                                src={el?.image}
                                width="100%"
                                height="100%"
                                alt=""
                              />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )}
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
                !questions[editIndex]?.answers ||
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
        <Dialog
          open={openNewVariableDialog || false}
          onClose={() => {
            this.setState({
              openNewVariableDialog: false,
            });
          }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle>Nouvelle variable</DialogTitle>
          <DialogContent>
            <TextField
              required
              autoFocus
              placeholder="Nom de la variable"
              variant="outlined"
              value={newVariable.name || ""}
              onChange={(e) => {
                let value = e.target.value;
                let newVariable = update(this.state.newVariable, {
                  name: { $set: value },
                });
                this.setState({
                  newVariable,
                });
              }}
            />
            <p>Constantes (ex.: x,y,z)</p>
            {Object.keys(newVariable?.constants).map((el, id) => (
              <div
                key={`constante${id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.5em",
                }}
              >
                <TextField
                  required
                  style={{
                    width: 100,
                  }}
                  placeholder="Nom"
                  size="small"
                  variant="outlined"
                  value={newVariable.constants[id].name || ""}
                  onChange={(e) => {
                    let value = e.target.value;
                    let newVariable = update(this.state.newVariable, {
                      constants: { [id]: { name: { $set: value } } },
                    });
                    this.setState({
                      newVariable,
                    });
                  }}
                />
                <span
                  style={{
                    margin: "0 0.5em",
                  }}
                >
                  =
                </span>
                <Select
                  style={{
                    height: 40,
                  }}
                  value={newVariable.constants[id].question || ""}
                  required
                  variant="outlined"
                  inputProps={{ "aria-label": "Without label" }}
                  displayEmpty
                  onChange={(e) => {
                    let value = e.target.value;
                    let newVariable = update(this.state.newVariable, {
                      constants: { [id]: { question: { $set: value } } },
                    });
                    this.setState({
                      newVariable,
                    });
                  }}
                >
                  <MenuItem value="" disabled>
                    Question
                  </MenuItem>
                  {items.map((item, id) => (
                    <MenuItem value={item?.question} key={"item" + id}>
                      {item?.question}
                    </MenuItem>
                  ))}
                </Select>
                {id > 0 && (
                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      let j = 0;
                      let cp = JSON.parse(JSON.stringify(newVariable));
                      let filtered = Object.keys(newVariable.constants)
                        .filter((key) => Number(id) !== Number(key))
                        .reduce((obj, key) => {
                          obj[j] = newVariable.constants[key];
                          j++;
                          return obj;
                        }, []);
                      cp.constants = filtered;
                      this.setState({
                        newVariable: cp,
                      });
                    }}
                    className={classes.deleteBtn}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            ))}
            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{
                marginTop: "0.5em",
                textTransform: "none",
              }}
              onClick={() => {
                let length = Object.keys(this.state.newVariable.constants)
                  .length;
                let newVariable = update(this.state.newVariable, {
                  constants: { [length]: { $set: { question: "", name: "" } } },
                });
                this.setState({
                  newVariable,
                });
              }}
            >
              Ajouter
            </Button>
            <p>Calcul</p>
            <TextField
              required
              placeholder="Calcul"
              variant="outlined"
              value={newVariable.calc || ""}
              onChange={(e) => {
                let value = e.target.value;
                let newVariable = update(this.state.newVariable, {
                  calc: { $set: value },
                });
                this.setState({
                  newVariable,
                });
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({
                  openNewVariableDialog: false,
                });
                this.resetNewVariable();
              }}
              color="primary"
            >
              Annuler
            </Button>
            <Button
              disabled={!newVariable?.name || !newVariable?.calc}
              onClick={() => this.addNewVariable()}
              color="primary"
              variant="contained"
            >
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openEditVariableDialog || false}
          onClose={() => {
            this.setState({
              openEditVariableDialog: false,
            });
          }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle>Modifier une variable</DialogTitle>
          <DialogContent>
            <TextField
              required
              autoFocus
              placeholder="Nom de la variable"
              variant="outlined"
              value={variables[editVariableIndex]?.name || ""}
              onChange={(e) => {
                let value = e.target.value;
                let variables = update(this.state.variables, {
                  [editVariableIndex]: { name: { $set: value } },
                });
                this.setState({
                  variables,
                });
              }}
            />
            <p>Constantes (ex.: x,y,z)</p>
            {Object.keys(variables[editVariableIndex]?.constants ?? []).map(
              (el, id) => (
                <div
                  key={"const_name_" + id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.5em",
                  }}
                >
                  <TextField
                    required
                    style={{
                      width: 100,
                    }}
                    placeholder="Nom"
                    size="small"
                    variant="outlined"
                    value={
                      variables[editVariableIndex]?.constants[id].name || ""
                    }
                    onChange={(e) => {
                      let value = e.target.value;
                      let variables = update(this.state.variables, {
                        [editVariableIndex]: {
                          constants: { [id]: { name: { $set: value } } },
                        },
                      });
                      this.setState({
                        variables,
                      });
                    }}
                  />
                  <span
                    style={{
                      margin: "0 0.5em",
                    }}
                  >
                    =
                  </span>
                  <Select
                    style={{
                      height: 40,
                    }}
                    inputProps={{ "aria-label": "Without label" }}
                    displayEmpty
                    value={
                      variables[editVariableIndex]?.constants[id].question || ""
                    }
                    required
                    variant="outlined"
                    onChange={(e) => {
                      let value = e.target.value;
                      let variables = update(this.state.variables, {
                        [editVariableIndex]: {
                          constants: { [id]: { question: { $set: value } } },
                        },
                      });
                      this.setState({
                        variables,
                      });
                    }}
                  >
                    <MenuItem value="" disabled>
                      Question
                    </MenuItem>
                    {items.map(
                      (item, id) =>
                        item?.type === "number" && (
                          <MenuItem
                            value={item?.question}
                            key={"item_question_" + id}
                          >
                            {item?.question}
                          </MenuItem>
                        )
                    )}
                  </Select>
                  {id > 0 && (
                    <IconButton
                      aria-label="delete"
                      onClick={() => {
                        this.deleteConstance(editVariableIndex, id);
                      }}
                      className={classes.deleteBtn}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </div>
              )
            )}
            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{
                marginTop: "0.5em",
                textTransform: "none",
              }}
              onClick={() => {
                let length = Object.keys(
                  this.state.variables[editVariableIndex]?.constants
                ).length;
                let variables = update(this.state.variables, {
                  [editVariableIndex]: {
                    constants: {
                      [length]: { $set: { question: "", name: "" } },
                    },
                  },
                });
                this.setState({
                  variables,
                });
              }}
            >
              Ajouter
            </Button>
            <p>Calcul</p>
            <TextField
              required
              placeholder="Calcul"
              variant="outlined"
              value={variables[editVariableIndex]?.calc || ""}
              onChange={(e) => {
                let value = e.target.value;
                let variables = update(this.state.variables, {
                  [editVariableIndex]: { calc: { $set: value } },
                });
                this.setState({
                  variables,
                });
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({
                  openEditVariableDialog: false,
                });
              }}
              color="primary"
            >
              Annuler
            </Button>
            <Button
              disabled={
                !variables[editVariableIndex]?.name ||
                !variables[editVariableIndex]?.calc
              }
              onClick={() => this.editVariable()}
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
