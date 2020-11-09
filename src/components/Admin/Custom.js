import React, { Component } from "react";
import { Button, IconButton, Slider, TextField } from "@material-ui/core";

import {
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
} from "@material-ui/icons";

import { ChevronRight } from "react-feather";

import { withStyles } from "@material-ui/core/styles";

import { ChromePicker } from "react-color";

import { withFirebase } from "../Firebase";
import { compose } from "recompose";

import OutsideClickHandler from "react-outside-click-handler";

import { green } from "@material-ui/core/colors";

import Notify from "../../notify";

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

const CustomPage = () => (
  <div>
    <Custom />
  </div>
);

class CustomBase extends Component {
  constructor(props) {
    super();
    this.state = {
      custom: undefined,
      showPickerBg: [],
      showSave: false,
    };
  }
  componentDidMount() {
    this.getCustom();
  }
  getCustom = () => {
    let db = this.props.firebase.db;
    let questionsRef = db.ref("custom");
    questionsRef.on("value", (snap) => {
      let data = snap.val();
      this.setState({
        custom: data,
      });
    });
  };

  handleUpload = (e, path) => {
    const { storage } = this.props.firebase;
    let image = e?.target?.files[0];
    if (image) {
      const uploadTask = storage.ref(`images/${image.name}`).put(image);
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
            .child(image.name)
            .getDownloadURL()
            .then((url) => {
              this.setUpload(url, path);
            });
        }
      );
    } else {
      this.setUpload("", path);
    }
  };

  setUpload = (url, path) => {
    const { db } = this.props.firebase;
    let mainImage = db.ref(`custom/${path}`);
    mainImage.set(url);
  };

  onSave = () => {
    const { custom } = this.state;
    let db = this.props.firebase.db;
    let questionsRef = db.ref(`custom`);
    questionsRef.set(custom, (error) => {
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

  render() {
    const { classes } = this.props;
    const { custom, showPickerBg, showSave } = this.state;
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <h2>Personnalisation</h2>
          {showSave && (
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
          )}
        </div>
        <p>Logo</p>
        {custom?.logo?.url ? (
          <p
            style={{
              backgroundColor: custom?.bgColor,
              padding: 10,
              width: custom?.logo?.width + 20,
              borderRadius: 6,
            }}
          >
            <img
              src={custom?.logo?.url}
              alt="logo"
              width={custom?.logo?.width}
            />
          </p>
        ) : (
          <p>Aucun logo.</p>
        )}
        <Button
          variant="contained"
          color="default"
          size="small"
          className={classes.button}
          startIcon={<CloudUploadIcon />}
          component="label"
          onChange={(e) => {
            this.handleUpload(e, "logo/url");
          }}
        >
          {custom?.logo?.url ? "Remplacer" : "Téléverser"}
          <input accept="image/*" className={classes.input} type="file" />
        </Button>
        {custom?.logo && (
          <IconButton
            variant="contained"
            onClick={() => {
              this.handleUpload(undefined, "logo/url");
            }}
            aria-label="delete"
            className={classes.deleteBtn}
          >
            <DeleteIcon color={"default"} fontSize="small" />
          </IconButton>
        )}
        <div className="categories-settings">
          <p
            style={{
              marginRight: "1em",
            }}
          >
            Taille (en px.)
          </p>
          <span>{custom?.logo?.width}px</span>

          <Slider
            style={{
              width: 250,
              marginLeft: "2em",
            }}
            value={custom?.logo?.width}
            min={30}
            step={1}
            max={200}
            valueLabelFormat={`${custom?.logo?.width}px`}
            onChange={(e, newValue) => {
              if (newValue) {
                this.setState((state) => ({
                  showSave: true,
                  custom: {
                    ...state.custom,
                    logo: {
                      ...state.custom.logo,
                      width: newValue,
                    },
                  },
                }));
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
                custom: {
                  ...state.custom,
                  logo: {
                    ...state.custom.logo,
                    link: link,
                  },
                },
                showSave: true,
              }));
            }}
            value={custom?.logo?.link || ""}
            label="Lien associé au logo"
            type="text"
          />
        </div>

        <p>Couleurs de la marque</p>
        <div className="categories-settings">
          <span>Arrière-plan</span>
          <p style={{ position: "relative" }}>
            <button
              className="color-select"
              style={{
                backgroundColor: custom?.bgColor,
              }}
              onClick={() => {
                const { showPickerBg } = this.state;
                let cp = showPickerBg;
                showPickerBg[0] = true;
                this.setState({
                  showPickerBg: cp,
                });
              }}
            />
            {showPickerBg[0] && (
              <OutsideClickHandler
                onOutsideClick={() => {
                  const { showPickerBg } = this.state;
                  let cp = showPickerBg;
                  showPickerBg[0] = false;
                  this.setState({
                    showPickerBg: cp,
                  });
                }}
              >
                <ChromePicker
                  className="color-picker"
                  color={custom?.bgColor}
                  onChangeComplete={() => {
                    this.setState({
                      showSave: true,
                    });
                  }}
                  onChange={(color) => {
                    this.setState((state) => ({
                      custom: {
                        ...state.custom,
                        bgColor: color.hex,
                      },
                    }));
                  }}
                />
              </OutsideClickHandler>
            )}
          </p>
        </div>
        <div className="categories-settings">
          <span>Couleur des titres</span>
          <div style={{ position: "relative" }}>
            <button
              className="color-select"
              style={{
                backgroundColor: custom?.textColor?.title,
              }}
              onClick={() => {
                const { showPickerBg } = this.state;
                let cp = showPickerBg;
                showPickerBg[1] = true;
                this.setState({
                  showPickerBg: cp,
                });
              }}
            />
            {showPickerBg[1] && (
              <OutsideClickHandler
                onOutsideClick={() => {
                  const { showPickerBg } = this.state;
                  let cp = showPickerBg;
                  showPickerBg[1] = false;
                  this.setState({
                    showPickerBg: cp,
                  });
                }}
              >
                <ChromePicker
                  className="color-picker"
                  color={custom?.textColor?.title}
                  onChangeComplete={() => {
                    this.setState({
                      showSave: true,
                    });
                  }}
                  onChange={(color) => {
                    this.setState((state) => ({
                      custom: {
                        ...state.custom,
                        textColor: {
                          ...state.custom.textColor,
                          title: color.hex,
                        },
                      },
                    }));
                  }}
                />
              </OutsideClickHandler>
            )}
          </div>
        </div>
        <div className="categories-settings">
          <span>Couleur des descriptions</span>
          <p style={{ position: "relative" }}>
            <button
              className="color-select"
              style={{
                backgroundColor: custom?.textColor?.p,
              }}
              onClick={() => {
                const { showPickerBg } = this.state;
                let cp = showPickerBg;
                showPickerBg[2] = true;
                this.setState({
                  showPickerBg: cp,
                });
              }}
            />
            {showPickerBg[2] && (
              <OutsideClickHandler
                onOutsideClick={() => {
                  const { showPickerBg } = this.state;
                  let cp = showPickerBg;
                  showPickerBg[2] = false;
                  this.setState({
                    showPickerBg: cp,
                  });
                }}
              >
                <ChromePicker
                  className="color-picker"
                  color={custom?.textColor?.p}
                  onChangeComplete={() => {
                    this.setState({
                      showSave: true,
                    });
                  }}
                  onChange={(color) => {
                    this.setState((state) => ({
                      custom: {
                        ...state.custom,
                        textColor: {
                          ...state.custom.textColor,
                          p: color.hex,
                        },
                      },
                    }));
                  }}
                />
              </OutsideClickHandler>
            )}
          </p>
        </div>
        <div className="categories-settings">
          <span>Couleurs des boutons/étapes</span>
          <button
            className="btn-nav btn-next btn-nav-demo"
            style={{
              backgroundColor: custom?.btn?.primary,
            }}
          >
            <ChevronRight
              style={{
                color: custom?.btn?.secondary,
              }}
            />
          </button>
          <table>
            <thead>
              <tr>
                <td>Principale</td>
                <td>Secondaire</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ position: "relative" }}>
                    <button
                      className="color-select"
                      style={{
                        backgroundColor: custom?.btn?.primary,
                      }}
                      onClick={() => {
                        const { showPickerBg } = this.state;
                        let cp = showPickerBg;
                        showPickerBg[3] = true;
                        this.setState({
                          showPickerBg: cp,
                        });
                      }}
                    />
                    {showPickerBg[3] && (
                      <OutsideClickHandler
                        onOutsideClick={() => {
                          const { showPickerBg } = this.state;
                          let cp = showPickerBg;
                          showPickerBg[3] = false;
                          this.setState({
                            showPickerBg: cp,
                          });
                        }}
                      >
                        <ChromePicker
                          className="color-picker"
                          color={custom?.btn?.primary}
                          onChangeComplete={() => {
                            this.setState({
                              showSave: true,
                            });
                          }}
                          onChange={(color) => {
                            this.setState((state) => ({
                              custom: {
                                ...state.custom,
                                btn: {
                                  ...state.custom.btn,
                                  primary: color.hex,
                                },
                              },
                            }));
                          }}
                        />
                      </OutsideClickHandler>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ position: "relative" }}>
                    <button
                      className="color-select"
                      style={{
                        backgroundColor: custom?.btn?.secondary,
                      }}
                      onClick={() => {
                        const { showPickerBg } = this.state;
                        let cp = showPickerBg;
                        showPickerBg[4] = true;
                        this.setState({
                          showPickerBg: cp,
                        });
                      }}
                    />
                    {showPickerBg[4] && (
                      <OutsideClickHandler
                        onOutsideClick={() => {
                          const { showPickerBg } = this.state;
                          let cp = showPickerBg;
                          showPickerBg[4] = false;
                          this.setState({
                            showPickerBg: cp,
                          });
                        }}
                      >
                        <ChromePicker
                          className="color-picker"
                          color={custom?.btn?.secondary}
                          onChangeComplete={() => {
                            this.setState({
                              showSave: true,
                            });
                          }}
                          onChange={(color) => {
                            this.setState((state) => ({
                              custom: {
                                ...state.custom,
                                btn: {
                                  ...state.custom.btn,
                                  secondary: color.hex,
                                },
                              },
                            }));
                          }}
                        />
                      </OutsideClickHandler>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="categories-settings">
          <span>Couleur de sélection</span>
          {/* <button className="btn-nav btn-next btn-nav-demo" 
                style={{
                    backgroundColor: custom?.select?.primary
                }}>
                    <ChevronRight style={{
                        color:custom?.select?.secondary
                    }}/>
                </button> */}
          <table>
            <thead>
              <tr>
                <td>Sélection</td>
                <td>Sélectionné (Validé)</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ position: "relative" }}>
                    <button
                      className="color-select"
                      style={{
                        backgroundColor: custom?.select?.primary,
                      }}
                      onClick={() => {
                        const { showPickerBg } = this.state;
                        let cp = showPickerBg;
                        showPickerBg[5] = true;
                        this.setState({
                          showPickerBg: cp,
                        });
                      }}
                    />
                    {showPickerBg[5] && (
                      <OutsideClickHandler
                        onOutsideClick={() => {
                          const { showPickerBg } = this.state;
                          let cp = showPickerBg;
                          showPickerBg[5] = false;
                          this.setState({
                            showPickerBg: cp,
                          });
                        }}
                      >
                        <ChromePicker
                          className="color-picker"
                          color={custom?.select?.primary}
                          onChangeComplete={() => {
                            this.setState({
                              showSave: true,
                            });
                          }}
                          onChange={(color) => {
                            this.setState((state) => ({
                              custom: {
                                ...state.custom,
                                select: {
                                  ...state.custom.select,
                                  primary: color.hex,
                                },
                              },
                            }));
                          }}
                        />
                      </OutsideClickHandler>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ position: "relative" }}>
                    <button
                      className="color-select"
                      style={{
                        backgroundColor: custom?.select?.secondary,
                      }}
                      onClick={() => {
                        const { showPickerBg } = this.state;
                        let cp = showPickerBg;
                        showPickerBg[6] = true;
                        this.setState({
                          showPickerBg: cp,
                        });
                      }}
                    />
                    {showPickerBg[6] && (
                      <OutsideClickHandler
                        onOutsideClick={() => {
                          const { showPickerBg } = this.state;
                          let cp = showPickerBg;
                          showPickerBg[6] = false;
                          this.setState({
                            showPickerBg: cp,
                          });
                        }}
                      >
                        <ChromePicker
                          className="color-picker"
                          color={custom?.select?.secondary}
                          onChangeComplete={() => {
                            this.setState({
                              showSave: true,
                            });
                          }}
                          onChange={(color) => {
                            this.setState((state) => ({
                              custom: {
                                ...state.custom,
                                select: {
                                  ...state.custom.select,
                                  secondary: color.hex,
                                },
                              },
                            }));
                          }}
                        />
                      </OutsideClickHandler>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    );
  }
}

const Custom = compose(withFirebase, withStyles(styles))(CustomBase);

export default CustomPage;

export { Custom };
