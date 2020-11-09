import React, { Component } from "react";

import EditorJs from "react-editor-js";

import {
  Button,
  IconButton,
  FormControl,
  Select as SelectMUI,
  Menu,
  MenuItem,
} from "@material-ui/core";

import Loading from "../Loading";

import {
  Save as SaveIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from "@material-ui/icons";

import firebase from "firebase/app";

import { withStyles } from "@material-ui/core/styles";

import { withFirebase } from "../Firebase";
import { compose } from "recompose";

import { green } from "@material-ui/core/colors";

import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import List from "@editorjs/list";
import Warning from "@editorjs/warning";
import Code from "@editorjs/code";
import LinkTool from "@editorjs/link";
import Image from "@editorjs/image";
import Raw from "@editorjs/raw";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import CheckList from "@editorjs/checklist";
import Delimiter from "@editorjs/delimiter";
import InlineCode from "@editorjs/inline-code";
import SimpleImage from "@editorjs/simple-image";

import Notify from "../../notify";

const default_html = `
`;

const default_design = {
  time: 1604656400842,
  blocks: [
    {
      type: "header",
      data: {
        text: "Titre principal",
        level: 1,
      },
    },
    {
      type: "paragraph",
      data: {
        text: "Paragraph",
      },
    },
    {
      type: "header",
      data: {
        text: "Sous-titre",
        level: 2,
      },
    },
  ],
  version: "2.19.0",
};

const styles = (theme) => ({
  root: {
    width: "100%",
  },
  formControl: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    minWidth: 120,
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
  container: {
    maxHeight: "90vh",
  },
  button: {
    margin: theme.spacing(1),
    textTransform: "none",
  },
});

const SaveButton = withStyles((theme) => ({
  root: {
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[700],
    },
  },
}))(Button);

const SummaryPage = (props) => (
  <div>
    <Summary {...props} />
  </div>
);

class SummaryBase extends Component {
  constructor(props) {
    super();
    this.state = {
      idList: [],
      id: localStorage.getItem("id-summary")
        ? localStorage.getItem("id-summary")
        : undefined,
      summary: {},
      loading: true,
      anchorMoreSummary: undefined,
    };
    this.instanceRef = React.createRef();
    this.getSummary = this.getSummary.bind(this);
  }
  componentDidMount() {
    this.getSummary().then(() => {
      this.setState({
        loading: false,
      });
    });
  }
  onSave = async () => {
    const savedData = await this.instanceRef.current.save();
    let design = savedData;
    let summary = {
      design,
      html: "",
    };
    this.setState({
      summary,
    });
    this.saveDb(summary);
  };

  saveDb = (summary) => {
    const { id } = this.state;
    let db = this.props.firebase.db;
    let summaryRef = db.ref(`summary/${id}`);
    summaryRef.set(
      {
        summary,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        id,
      },
      (error) => {
        if (error) {
          Notify("Problème lors de la sauvegarde : " + error, "error");
        } else {
          this.setState({
            showSave: false,
          });
          Notify("Sauvegardé !", "success");
        }
      }
    );
  };

  onDuplicate = () => {
    const { summary, id } = this.state;
    let db = this.props.firebase.db;
    let questionsRef = db.ref("summary");
    let newQuestionsRef = questionsRef.push();
    let newKey = newQuestionsRef.key;
    let current = summary[id]?.summary;
    newQuestionsRef.set({
      summary: current,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      id: newKey,
    });
    setTimeout(() => {
      this.setState({
        id: newKey,
      });
      this.getSummaryByRef(newKey);
    }, 1000);
  };

  onDelete = () => {
    let db = this.props.firebase.db;
    const { id } = this.state;
    if (id) {
      let questionsRef = db.ref(`summary/${id}`);
      questionsRef.remove();
    }
  };

  getSummaryByRef = (key) => {
    this.setState({
      id: key,
    });
    localStorage.setItem("id-summary", key);
  };

  async getSummary() {
    let db = this.props.firebase.db;
    let summaryRef = db.ref("summary");
    await summaryRef.on("value", (snap) => {
      let data = snap.val();
      if (data) {
        let summary = Object.keys(data).map((i) => data[i]);
        let idList = Object.keys(summary).map((i) => {
          return { value: summary[i]?.id, label: summary[i]?.id };
        });
        let id = localStorage.getItem("id-summary")
          ? localStorage.getItem("id-summary")
          : summary[0]?.id;
        this.setState({
          idList,
          id,
          summary: data,
        });
      }
    });
  }

  async newSummary() {
    let db = this.props.firebase.db;
    let summaryRef = db.ref("summary");
    let newSummaryRef = summaryRef.push();
    let newKey = newSummaryRef.key;
    this.setState({
      refresh: true,
    });
    await newSummaryRef.set({
      summary: {
        design: default_design,
        html: default_html,
      },
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      id: newKey,
    });
  }

  /*   onLoad = (design) => {
    let editor = this.summaryEditorRef?.current?.editor;
    if (editor && design) {
      editor.loadDesign(JSON.parse(design));
    }
  }; */

  render() {
    const { classes } = this.props;
    const { id, idList, anchorMoreSummary, loading, summary } = this.state;
    return (
      <>
        {loading ? (
          <Loading />
        ) : (
          <>
            <h2>Récapitulatifs</h2>
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "",
              }}
            >
              <FormControl required className={classes.formControl}>
                <SelectMUI
                  id="demo-simple-select"
                  variant="outlined"
                  style={{
                    background: "white",
                  }}
                  value={id}
                  onChange={(e) => {
                    let id = e.target.value;
                    this.setState({
                      id,
                    });
                    localStorage.setItem("id-summary", id);
                  }}
                >
                  {idList.map((el, id) => (
                    <MenuItem key={id} value={el.value}>{`Récapitulatif nº${
                      id + 1
                    }`}</MenuItem>
                  ))}
                </SelectMUI>
              </FormControl>
              <IconButton
                aria-controls="menu-summary"
                aria-haspopup="true"
                onClick={(e) => {
                  let currentTarget = e.currentTarget;
                  this.setState({
                    anchorMoreSummary: currentTarget,
                  });
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                id="menu-summary"
                anchorEl={anchorMoreSummary}
                open={anchorMoreSummary}
                onClose={() => {
                  this.setState({
                    anchorMoreSummary: undefined,
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
                size="small"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  this.newSummary();
                }}
              >
                Nouveau
              </Button>
              <SaveButton
                variant="contained"
                color="primary"
                size="small"
                className={classes.button}
                startIcon={<SaveIcon />}
                onClick={() => this.onSave()}
              >
                Sauvegarder
              </SaveButton>
            </div>
            {summary && (
              <EditorJs
                instanceRef={(instance) =>
                  (this.instanceRef.current = instance)
                }
                enableReInitialize
                tools={{
                  embed: Embed,
                  table: Table,
                  marker: Marker,
                  list: List,
                  warning: Warning,
                  code: Code,
                  linkTool: LinkTool,
                  image: Image,
                  raw: Raw,
                  header: Header,
                  quote: Quote,
                  checklist: CheckList,
                  delimiter: Delimiter,
                  inlineCode: InlineCode,
                  simpleImage: SimpleImage,
                }}
                data={summary[id]?.summary?.design}
              />
            )}
          </>
        )}
      </>
    );
  }
}

const Summary = compose(withFirebase, withStyles(styles))(SummaryBase);

export default SummaryPage;

export { Summary };
