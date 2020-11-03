/** @jsx jsx */

import React from "react";
import QuestionCount from "./QuestionCount";
import { ChevronLeft, ChevronRight } from "react-feather";

import { ToastContainer } from "react-toastify";
import Notify from "../../notify";

import { css, jsx } from "@emotion/core";

class Quiz extends React.Component {
  constructor(props) {
    super();
    this.state = {
      target: undefined,
      checkedList: [],
      disabledList: [],
      back: false,
      error: false,
    };
  }
  onMultiCheck = (e) => {
    const { checkedList } = this.state;
    this.setState({
      target: e.target,
    });
    if (e?.target?.checked) {
      let value = e.target.value;
      let ary = [...checkedList, value];
      this.setState((state) => ({
        checkedList: ary,
      }));
    } else {
      let ary = checkedList;
      ary = ary.filter((el) => el !== e.target.value);
      this.setState({
        checkedList: ary,
      });
    }
  };
  onBodyCheck = (e) => {
    const { checkedList } = this.state;
    this.setState({
      target: e.target,
    });
    if (e?.target?.checked) {
      let value = e.target.value;
      let _disabledList = [];
      if (value === "Ailes d'ange" || value === "Culotte de cheval") {
        _disabledList = [
          "Cou",
          "Pli du soutien-gorge",
          "Poignées d'amour",
          "Genoux",
          "Menton",
          "Décolleté",
          "Pseudogynécomastie",
          "Bras",
          "Ventre",
          "Cuisses",
          "Mollets",
        ];
      } else if (value === "Pli du soutien-gorge" || value === "Ventre") {
        _disabledList = [
          "Cou",
          "Ailes d'ange",
          "Poignées d'amour",
          "Culotte de cheval",
          "Genoux",
          "Menton",
          "Décolleté",
          "Pseudogynécomastie",
          "Bras",
          "Cuisses",
          "Mollets",
        ];
      } else {
        _disabledList = [
          "Cou",
          "Pli du soutien-gorge",
          "Ailes d'ange",
          "Poignées d'amour",
          "Culotte de cheval",
          "Genoux",
          "Menton",
          "Décolleté",
          "Pseudogynécomastie",
          "Bras",
          "Ventre",
          "Cuisses",
          "Mollets",
        ];
        _disabledList = _disabledList.filter((e) => e !== value);
      }
      let ary = [...checkedList, value];
      this.setState((state) => ({
        checkedList: ary,
        disabledList: _disabledList,
      }));
    } else {
      let ary = checkedList;
      ary = ary.filter((el) => el !== e.target.value);
      this.setState({
        checkedList: ary,
      });
      if (ary.length === 0) {
        this.setState({
          disabledList: [],
        });
      }
    }
  };
  render() {
    const { custom } = this.props;
    const { back, error, disabledList } = this.state;
    if (!this.props.notFound) {
      return (
        <div className="container">
          {custom?.logo?.url && (
            <div
              className="brand-logo"
              style={{
                width: custom?.logo?.width,
              }}
            >
              <a
                href={custom?.logo?.link || ""}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  style={{
                    width: custom?.logo?.width,
                  }}
                  width="100%"
                  src={custom?.logo?.url}
                  alt="Logo"
                />
              </a>
            </div>
          )}
          <div
            key={this.props.questionId}
            className={`questionContainer animate__animated ${
              back ? `animate__fadeInLeft` : `animate__fadeInRight`
            }`}
          >
            {this.props.mainImage && (
              <div
                style={{
                  margin: "auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img width="60" src={this.props.mainImage} alt="" />
              </div>
            )}
            <h2
              className="question"
              css={css`
                color: ${custom?.textColor?.title};
              `}
            >
              {this.props.question}
            </h2>
            {this.props.description && (
              <p
                className="question-description"
                css={css`
                  color: ${custom?.textColor?.p};
                `}
              >
                {this.props.description}
              </p>
            )}
            <ul
              className={`answerOptions ${
                this.props.type === "text" ||
                this.props.type === "email" ||
                this.props.type === "number"
                  ? `answerInput`
                  : ``
              }`}
            >
              {this.props?.type !== "body" &&
                this.props?.answerOptions.map((el, key, array) => {
                  return this.props.type === "text" ||
                    this.props.type === "email" ||
                    this.props.type === "number" ? (
                    <li className="answerOption" key={`answerOption${key}`}>
                      <input
                        className={
                          error ? `animate__animated animate__shakeX` : ``
                        }
                        type={this.props.type}
                        placeholder={array[key].content}
                        onKeyPress={(e) => {
                          let keyCode = e.keyCode || e.charCode;
                          if (keyCode === 13) {
                            if (e.target.value) {
                              this.props.onKeyPressed(e.target);
                              this.setState({
                                error: false,
                                back: false,
                              });
                              setTimeout(() => {
                                this.setState({
                                  target: undefined,
                                });
                              }, 300);
                            } else {
                              this.setState({ error: true });
                              Notify("Veuillez compléter le champ", "error");
                            }
                          }
                        }}
                        name={array[key].content}
                        onChange={(e) => {
                          let target = e.target;
                          this.setState({
                            target,
                            error: false,
                          });
                        }}
                        value={this.state.target?.value || ""}
                        autoFocus
                      />
                    </li>
                  ) : this.props.type === "radio" ? (
                    <li
                      className={"answerOption radioOption"}
                      css={css`
                        &::before {
                          background: ${custom?.select?.primary};
                        }
                        &::after {
                          border: 3px solid ${custom?.select?.primary};
                        }
                      `}
                      key={`radioOption${key}`}
                    >
                      <input
                        type={this.props.type}
                        className="radioCustomButton"
                        name={array[key].content}
                        checked={array[key].content === array[key].answer}
                        id={array[key].content}
                        value={array[key].content}
                        disabled={array[key].answer}
                        onChange={(e) => {
                          this.props.onAnswerSelected(e.target);
                          this.setState({
                            target: undefined,
                            back: false,
                          });
                        }}
                      />
                      {array[key].image && (
                        <img
                          src={array[key].image}
                          className="answerImage"
                          alt="Answer"
                          width="50%"
                        />
                      )}
                      <label
                        className="radioCustomLabel"
                        htmlFor={array[key].content}
                      >
                        {array[key].content}
                      </label>
                    </li>
                  ) : (
                    this.props.type === "checkbox" && (
                      <li
                        className="answerOption multiOption"
                        key={`multiOption${key}`}
                      >
                        <input
                          className="multiCustomButton"
                          type={this.props.type}
                          id={`multiCustom${key}`}
                          name={`multiCustom${key}`}
                          value={array[key].content}
                          onChange={(e) => {
                            this.onMultiCheck(e);
                          }}
                        />
                        {array[key].image && (
                          <img
                            src={array[key].image}
                            className="answerImage"
                            alt="Answer"
                            width="50%"
                          />
                        )}
                        <label
                          css={css`
                            &::before {
                              background: ${custom?.select?.primary};
                            }
                            &::after {
                              border: 3px solid ${custom?.select?.primary};
                            }
                            .multiOption input:checked ~ & {
                              opacity: 1;
                              &::before {
                                background: ${custom?.select?.secondary};
                                opacity: 0.3;
                              }
                              &::after {
                                border: 3px solid ${custom?.select?.secondary};
                              }
                            }
                            .multiOption input:disabled ~ & {
                              cursor: not-allowed;
                              opacity: 0.5;
                            }
                          `}
                          htmlFor={`multiCustom${key}`}
                          className="multiCustomLabel"
                        >
                          {array[key].content}
                        </label>
                      </li>
                    )
                  );
                })}
              {(this.props.type === "text" ||
                this.props.type === "email" ||
                this.props.type === "number") && (
                <button
                  className="btn-nav btn-next"
                  css={css`
                    background-color: ${custom?.btn?.primary};
                  `}
                  onClick={() => {
                    const { target } = this.state;
                    if (target?.value) {
                      this.setState({
                        checkedList: [],
                        target: undefined,
                        back: false,
                      });
                      this.props.onAnswerSelected(this.state.target);
                    } else {
                      this.setState({
                        error: true,
                        target: undefined,
                      });
                      Notify("Veuillez compléter le champ", "error");
                    }
                  }}
                >
                  <ChevronRight
                    size={20}
                    color={
                      custom?.btn?.secondary
                        ? custom?.btn?.secondary
                        : "#333333"
                    }
                  />
                </button>
              )}
              {/* BODY */}
              {this.props?.type === "body" && (
                <div className="answerOptions">
                  {this.props.answerOptions.map((el, id) => (
                    <React.Fragment>
                      <div id={`body${id}`} className="body">
                        {this.props.answerOptions[id]?.answers.map(
                          (value, index, arr) => (
                            <div
                              key={`bodySelect${index}`}
                              className={`bodySelect ${
                                disabledList.includes(el.content)
                                  ? `disabled`
                                  : ``
                              }`}
                              id={`bodySelect${index}`}
                              css={css`
                                left: ${value.x}px;
                                top: ${value.y}px;
                              `}
                            >
                              <input
                                disabled={disabledList.includes(value.content)}
                                type="checkbox"
                                name="bodySelect"
                                value={value.content}
                                onChange={(e) => this.onBodyCheck(e)}
                                id={`part${id}${index}`}
                              />
                              <label
                                css={css`
                                  &::before {
                                    background: ${custom?.select?.primary};
                                  }
                                  &::after {
                                    border: 2px solid ${custom?.select?.primary};
                                  }
                                  .body input:checked ~ & {
                                    opacity: 1;
                                    &::before {
                                      background: ${custom?.select?.secondary};
                                      opacity: 0.2;
                                    }
                                    &::after {
                                      border: 2px solid
                                        ${custom?.select?.secondary};
                                    }
                                  }
                                  .body input:disabled ~ & {
                                    cursor: not-allowed;
                                    opacity: 0.5;
                                  }
                                `}
                                htmlFor={`part${id}${index}`}
                              >
                                {value.content}
                              </label>
                            </div>
                          )
                        )}
                        <img
                          width="100%"
                          height="100%"
                          src={this.props.answerOptions[id]?.image}
                          alt=""
                        />
                      </div>
                    </React.Fragment>
                  ))}

                  <button
                    className="btn-nav btn-checkbox-body"
                    css={css`
                      background-color: ${custom?.btn?.primary};
                    `}
                    onClick={() => {
                      const { target, checkedList } = this.state;
                      if (target?.value && checkedList.length) {
                        this.props.onAnswerSelected(target, checkedList);
                        this.setState({
                          checkedList: [],
                          back: false,
                          target: undefined,
                        });
                      } else {
                        this.setState({
                          error: true,
                          target: undefined,
                        });
                        Notify(
                          "Veuillez sélectionner au moins une réponse...",
                          "error"
                        );
                      }
                    }}
                  >
                    <span
                      css={css`
                        color: ${custom?.btn?.secondary};
                        font-weight: 500;
                      `}
                    >
                      {this.props.questionId === this.props.questionTotal
                        ? ` Terminer `
                        : `Continuer `}
                    </span>
                    <ChevronRight
                      size={20}
                      color={
                        custom?.btn?.secondary
                          ? custom?.btn?.secondary
                          : "#333333"
                      }
                    />
                  </button>
                </div>
              )}
            </ul>
            {this.props.type === "checkbox" && (
              <button
                className="btn-nav btn-checkbox"
                css={css`
                  background-color: ${custom?.btn?.primary};
                `}
                onClick={() => {
                  const { target, checkedList } = this.state;
                  if (target?.value && checkedList.length) {
                    this.props.onAnswerSelected(target, checkedList);
                    this.setState({
                      checkedList: [],
                      back: false,
                      target: undefined,
                    });
                  } else {
                    this.setState({
                      error: true,
                      target: undefined,
                    });
                    Notify(
                      "Veuillez sélectionner au moins une réponse...",
                      "error"
                    );
                  }
                }}
              >
                <span
                  css={css`
                    color: ${custom?.btn?.secondary};
                    font-weight: 500;
                  `}
                >
                  {this.props.questionId === this.props.questionId?.length
                    ? ` Terminer `
                    : ` Continuer `}
                </span>
                <ChevronRight
                  size={20}
                  color={
                    custom?.btn?.secondary ? custom?.btn?.secondary : "#333333"
                  }
                />
              </button>
            )}
          </div>
          <ToastContainer />
          {this.props.questionId > 1 && (
            <button
              onClick={() => {
                this.props.onBack();
                this.setState({
                  checkedList: [],
                  back: true,
                  error: false,
                  target: undefined,
                });
              }}
              className="btn-nav btn-prev"
              css={css`
                border-color: ${custom?.btn?.primary};
                border-width: 3px;
                border-style: solid;
                background-color: transparent;
              `}
            >
              <ChevronLeft
                size={20}
                color={custom?.btn?.primary ? custom?.btn?.primary : "#333333"}
              />
              <span
                css={css`
                  color: ${custom?.btn?.primary};
                  font-weight: 600;
                `}
              >{`Précédent `}</span>
            </button>
          )}
          <QuestionCount
            counter={this.props.questionId}
            total={this.props.questionTotal}
            btn={this.props.custom?.btn}
          />
        </div>
      );
    } else {
      return (
        <div className="container">
          <span className="info-not-found">Aucun quiz à cette adresse</span>
        </div>
      );
    }
  }
}

export default Quiz;
