import React, { Component } from "react";

import EditorJs from "react-editor-js";

import {
  Button as Btn,
  IconButton,
  FormControl,
  Select,
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
import ImageTool from "@editorjs/image";
import Raw from "@editorjs/raw";
import Header from "@editorjs/header";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import SimpleImage from "@editorjs/simple-image";
import edjsParser from "editorjs-parser";

import Notify from "../../notify";

const default_design = {
  time: new Date().getTime(),
  blocks: [
    {
      type: "paragraph",
      data: {
        text: "",
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
}))(Btn);

const SummaryPage = (props) => (
  <div>
    <Summary {...props} />
  </div>
);

class SummaryBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idList: [],
      id: localStorage.getItem("id-summary")
        ? localStorage.getItem("id-summary")
        : undefined,
      summary: {},
      loading: true,
      anchorMoreSummary: undefined,
      showSave: false,
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
  async onSave() {
    let design = await this.instanceRef.current.save();
    const parser = new edjsParser();
    let html = parser.parse(design);
    design = JSON.stringify(design);
    html = JSON.stringify(html);
    let summary = { design, html };
    await this.saveDb(summary);
  }

  saveDb = (summary) => {
    const { id } = this.state;
    let db = this.props.firebase.db;
    let summaryRef = db.ref(`summary/${id}/summary`);
    summaryRef.set(summary, (error) => {
      if (error) {
        Notify("Problème lors de la sauvegarde : " + error, "error");
      } else {
        this.setState({
          showSave: false,
        });
        Notify("Sauvegardé !", "success");
      }
    });
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

  async onDelete() {
    let db = this.props.firebase.db;
    const { id } = this.state;
    if (id) {
      await db.ref(`summary/${id}`).remove();
    }
  }

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
    await summaryRef.on("child_removed", (snap, prevKey) => {
      const { idList } = this.state;
      let lg = idList.length;
      this.setState({
        id: idList[lg]?.value,
      });
    });
  }

  async newSummary() {
    let db = this.props.firebase.db;
    let summaryRef = db.ref("summary");
    let newSummaryRef = summaryRef.push();
    let newKey = newSummaryRef.key;
    const parser = new edjsParser();
    let html = parser.parse(default_design);
    html = JSON.stringify(html);
    let design = JSON.stringify(default_design);
    let summary = { design, html };
    await newSummaryRef
      .set({
        summary,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        id: newKey,
      })
      .then(() => {
        this.setState({
          id: newKey,
        });
      });
  }

  htmlDecode(input) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  }

  /*   onLoad = (design) => {
    let editor = this.summaryEditorRef?.current?.editor;
    if (editor && design) {
      editor.loadDesign(JSON.parse(design));
    }
  }; */

  render() {
    const { classes } = this.props;
    const { storage } = this.props.firebase;
    const { id, idList, anchorMoreSummary, loading, summary } = this.state;
    let data = null;
    if (summary[id]?.summary?.design) {
      data = JSON.parse(this.htmlDecode(summary[id]?.summary?.design));
    }
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
                <Select
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
                </Select>
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
              <Btn
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
              </Btn>
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
                  header: Header,
                  table: Table,
                  marker: Marker,
                  list: List,
                  image: {
                    class: ImageTool,
                    config: {
                      uploader: {
                        async uploadByFile(file) {
                          const imageRef = storage.ref(`images/${file.name}`);
                          await imageRef.put(file);
                          return imageRef.getDownloadURL().then((url) => {
                            let _url = encodeURIComponent(url);
                            return {
                              success: 1,
                              file: {
                                _url,
                              },
                            };
                          });
                        },
                        uploadByUrl(url) {
                          let _url = encodeURIComponent(url);
                          return {
                            success: 1,
                            file: {
                              _url,
                            },
                          };
                        },
                      },
                    },
                  },
                  raw: Raw,
                  inlineCode: InlineCode,
                  simpleImage: SimpleImage,
                }}
                data={data}
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
