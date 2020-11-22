import React, { Component } from "react";
import EmailEditor from "react-email-editor";

import {
  Button,
  IconButton,
  FormControl,
  Select,
  Menu,
  MenuItem,
} from "@material-ui/core";

import {
  Save as SaveIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from "@material-ui/icons";

import firebase from "firebase/app";

import { withStyles } from "@material-ui/core/styles";

import { withFirebase } from "../../Firebase";
import { compose } from "recompose";

import { green } from "@material-ui/core/colors";

import Notify from "../../../notify";

const default_html =
  '<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">\n<head>\n<!--[if gte mso 9]>\n<xml>\n  <o:OfficeDocumentSettings>\n    <o:AllowPNG/>\n    <o:PixelsPerInch>96</o:PixelsPerInch>\n  </o:OfficeDocumentSettings>\n</xml>\n<![endif]-->\n  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta name="x-apple-disable-message-reformatting">\n  <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->\n  <title></title>\n  \n    <style type="text/css">\n      a { color: #0000ee; text-decoration: underline; }\n[owa] .u-row .u-col {\n  display: table-cell;\n  float: none !important;\n  vertical-align: top;\n}\n\n.ie-container .u-row,\n[owa] .u-row {\n  width: 500px !important;\n}\n\n.ie-container .u-col-100,\n[owa] .u-col-100 {\n  width: 500px !important;\n}\n\n\n@media only screen and (min-width: 520px) {\n  .u-row {\n    width: 500px !important;\n  }\n  .u-row .u-col {\n    vertical-align: top;\n  }\n\n  .u-row .u-col-100 {\n    width: 500px !important;\n  }\n\n}\n\n@media (max-width: 520px) {\n  .u-row-container {\n    max-width: 100% !important;\n    padding-left: 0px !important;\n    padding-right: 0px !important;\n  }\n  .u-row .u-col {\n    min-width: 320px !important;\n    max-width: 100% !important;\n    display: block !important;\n  }\n  .u-row {\n    width: calc(100% - 40px) !important;\n  }\n  .u-col {\n    width: 100% !important;\n  }\n  .u-col > div {\n    margin: 0 auto;\n  }\n  .no-stack .u-col {\n    min-width: 0 !important;\n    display: table-cell !important;\n  }\n\n  .no-stack .u-col-100 {\n    width: 100% !important;\n  }\n\n}\nbody {\n  margin: 0;\n  padding: 0;\n}\n\ntable,\ntr,\ntd {\n  vertical-align: top;\n  border-collapse: collapse;\n}\n\np {\n  margin: 0;\n}\n\n.ie-container table,\n.mso-container table {\n  table-layout: fixed;\n}\n\n* {\n  line-height: inherit;\n}\n\na[x-apple-data-detectors=\'true\'] {\n  color: inherit !important;\n  text-decoration: none !important;\n}\n\n.ExternalClass,\n.ExternalClass p,\n.ExternalClass span,\n.ExternalClass font,\n.ExternalClass td,\n.ExternalClass div {\n  line-height: 100%;\n}\n\n@media (max-width: 480px) {\n  .hide-mobile {\n    display: none !important;\n    max-height: 0px;\n    overflow: hidden;\n  }\n}\n\n@media (min-width: 481px) {\n  .hide-desktop {\n    display: none !important;\n    max-height: none !important;\n  }\n}\n    </style>\n  \n  \n\n</head>\n\n<body class="clean-body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #e7e7e7">\n  <!--[if IE]><div class="ie-container"><![endif]-->\n  <!--[if mso]><div class="mso-container"><![endif]-->\n  <table class="nl-container" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #e7e7e7;width:100%" cellpadding="0" cellspacing="0">\n  <tbody>\n  <tr style="vertical-align: top">\n    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">\n    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e7e7e7;"><![endif]-->\n    \n\n<div class="u-row-container" style="padding: 0px;background-color: transparent">\n  <div style="Margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;" class="u-row">\n    <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">\n      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]-->\n      \n<!--[if (mso)|(IE)]><td align="center" width="500" style="width: 500px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->\n<div class="u-col u-col-100" style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">\n  <div style="width: 100% !important;">\n  <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->\n  \n<table id="u_content_text_1" class="u_content_text" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">\n  <tbody>\n    <tr>\n      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">\n        \n  <div class="v-text-align" style="color: #000000; line-height: 140%; text-align: left; word-wrap: break-word;">\n    <p style="text-align: center; font-size: 14px; line-height: 140%;"><span style="font-size: 14px; line-height: 19.6px;">This is a new Text block. Change the text.</span></p>\n  </div>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->\n  </div>\n</div>\n<!--[if (mso)|(IE)]></td><![endif]-->\n      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->\n    </div>\n  </div>\n</div>\n\n\n    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->\n    </td>\n  </tr>\n  </tbody>\n  </table>\n  <!--[if (mso)|(IE)]></div><![endif]-->\n</body>\n\n</html>\n';

const default_design =
  '{"counters":{"u_column":1,"u_row":1},"body":{"rows":[{"cells":[1],"columns":[{"contents":[],"values":{"backgroundColor":"","padding":"0px","border":{},"_meta":{"htmlID":"u_column_1","htmlClassNames":"u_column"}}}],"values":{"displayCondition":null,"columns":false,"backgroundColor":"","columnsBackgroundColor":"","backgroundImage":{"url":"","fullWidth":true,"repeat":false,"center":true,"cover":false},"padding":"0px","hideDesktop":false,"hideMobile":false,"noStackMobile":false,"_meta":{"htmlID":"u_row_1","htmlClassNames":"u_row"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true}}],"values":{"backgroundColor":"#e7e7e7","backgroundImage":{"url":"","fullWidth":true,"repeat":false,"center":true,"cover":false},"contentWidth":"500px","fontFamily":{"label":"Arial","value":"arial,helvetica,sans-serif"},"linkStyle":{"body":true,"linkColor":"#0000ee","linkHoverColor":"#0000ee","linkUnderline":true,"linkHoverUnderline":true},"_meta":{"htmlID":"u_body","htmlClassNames":"u_body"}}},"schemaVersion":5}';

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

const EmailingPage = (props) => (
  <div>
    <Emailing {...props} />
  </div>
);

class EmailingBase extends Component {
  constructor(props) {
    super();
    this.state = {
      idList: [],
      id: localStorage.getItem("id-email")
        ? localStorage.getItem("id-email")
        : undefined,
      email: undefined,
      loading: true,
      anchorMoreEmailing: undefined,
    };
    this.getEmailing = this.getEmailing.bind(this);
    this.isEditorLoaded = false;
    this.isComponentMounted = false;
    this.editor = React.createRef();
  }
  componentDidMount() {
    this.isComponentMounted = true;
    this.getEmailing();
  }

  onSave = () => {
    this.editor.current.editor.exportHtml((data) => {
      const { html, design } = data;
      let _design = JSON.stringify(design);
      let email = {
        design: _design,
        html: html,
      };
      /* this.setState({
        email,
      }); */
      this.saveDb(email);
    });
  };

  saveDb = (email) => {
    const { id } = this.state;
    let db = this.props.firebase.db;
    let emailRef = db.ref(`email/${id}`);
    emailRef.set(
      {
        email,
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
    const { email, id } = this.state;
    let db = this.props.firebase.db;
    let questionsRef = db.ref("email");
    let newQuestionsRef = questionsRef.push();
    let newKey = newQuestionsRef.key;
    let current = email[id]?.email;
    newQuestionsRef.set({
      email: current,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      id: newKey,
    });
    setTimeout(() => {
      this.setState({
        id: newKey,
      });
      this.getEmailByRef(newKey);
    }, 1000);
  };

  onDelete = () => {
    let db = this.props.firebase.db;
    const { id } = this.state;
    if (id) {
      let questionsRef = db.ref(`email/${id}`);
      questionsRef.remove();
    }
  };

  getEmailByRef = (key) => {
    this.setState({
      id: key,
    });
    localStorage.setItem("id-email", key);
  };

  async getEmailing() {
    let db = this.props.firebase.db;
    let emailRef = db.ref("email");
    await emailRef.on("value", (snap) => {
      let data = snap.val();
      if (data) {
        let email = Object.keys(data).map((i) => data[i]);
        let idList = Object.keys(email).map((i) => {
          return { value: email[i]?.id, label: email[i]?.id };
        });
        let id = localStorage.getItem("id-email")
          ? localStorage.getItem("id-email")
          : email[0]?.id;
        this.setState({
          idList,
          id,
          email: data,
        });
      }
    });
    this.setState({
      loading: false,
    });
  }

  async newEmail() {
    let db = this.props.firebase.db;
    let emailRef = db.ref("email");
    let newEmailRef = emailRef.push();
    let newKey = newEmailRef.key;
    this.setState({
      refresh: true,
    });
    await newEmailRef.set({
      email: {
        design: default_design,
        html: default_html,
      },
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      id: newKey,
    });
  }

  onLoad = (design) => {
    this.isEditorLoaded = true;
    this.loadTemplate(design);
  };

  loadTemplate = (design) => {
    if (
      !this.isEditorLoaded ||
      !this.isComponentMounted ||
      !design ||
      !this.editor
    )
      return;
    this.editor.current.loadDesign(design ?? null);
  };

  render() {
    const { classes } = this.props;
    const { id, idList, anchorMoreEmailing, email } = this.state;
    let design = null;
    if (email) {
      design = email[id]?.email?.design;
      design = JSON.parse(design);
    }
    return (
      <>
        <>
          <h2>Emailing</h2>
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
                value={id}
                variant="outlined"
                style={{
                  background: "white",
                }}
                onChange={(e) => {
                  let id = e.target.value;
                  this.setState({
                    id,
                  });
                  localStorage.setItem("id-email", id);
                }}
              >
                {idList.map((el, id) => (
                  <MenuItem key={id} value={el.value}>{`Email nº${
                    id + 1
                  }`}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              aria-controls="menu-emailing"
              aria-haspopup="true"
              onClick={(e) => {
                let currentTarget = e.currentTarget;
                this.setState({
                  anchorMoreEmailing: currentTarget,
                });
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              id="menu-emailing"
              anchorEl={anchorMoreEmailing}
              open={anchorMoreEmailing}
              onClose={() => {
                this.setState({
                  anchorMoreEmailing: undefined,
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
                this.newEmail();
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
          <EmailEditor
            ref={this.editor}
            onLoad={email && this.onLoad(design)}
          />
        </>
      </>
    );
  }
}

const Emailing = compose(withFirebase, withStyles(styles))(EmailingBase);

export default EmailingPage;

export { Emailing };
