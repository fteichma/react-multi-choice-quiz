import React, { Component } from "react";
import Quiz from "./Quiz";
import Summary from "./Summary";
import axios from "axios";
import "../../App.css";
import "animate.css";

import { withFirebase } from "../Firebase";
import firebase from "firebase/app";
import queryString from "query-string";

import Loading from "../Loading";

import Notify from "../../notify";

import stringMath from "string-math";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      counter: 0,
      answerOptions: [],
      answer: "",
      answersCount: {},
      end: false,
      error: false,
      answers: [],
      question: "",
      description: "",
      questions: {},
      type: "",
      questionId: 1,
      notFound: true,
      mainImage: undefined,
      sex: "male",
      var_answers: {},
      email: undefined,
      custom: undefined,
      summary: undefined,
      summaryHtml: "",
    };
    this.handleAnswerSelected = this.handleAnswerSelected.bind(this);
    this.handleKeyPressed = this.handleKeyPressed.bind(this);
  }

  componentDidMount() {
    this.getQuestions();
    this.getEmail();
    this.getSummary();
    this.getCustom();
  }

  getQuestions() {
    let url = this.props.location.search;
    let params = queryString.parse(url);
    this.getQuestionsByRef(params?.id);
  }

  async getCustom() {
    let db = this.props.firebase.db;
    let customRef = db.ref(`custom`);
    await customRef.on("value", (snap) => {
      let data = snap.val();
      if (data) {
        this.setState({
          custom: data,
        });
      }
    });
  }

  async getSummary() {
    let db = this.props.firebase.db;
    let summaryRef = db.ref(`summary`);
    await summaryRef.on("value", (snap) => {
      let data = snap.val();
      if (data) {
        this.setState({
          summary: data,
        });
      }
    });
  }

  async getEmail() {
    let db = this.props.firebase.db;
    let emailRef = db.ref(`email`);
    await emailRef.on("value", (snap) => {
      let data = snap.val();
      if (data) {
        this.setState({
          email: data,
        });
      }
    });
  }

  async getQuestionsByRef(id) {
    let db = this.props.firebase.db;
    let questionsRef = db.ref(`questions/${id}`);
    await questionsRef.on("value", (snap) => {
      let data = snap.val();
      if (data) {
        let questions = data?.questions;
        let conditions = data?.conditions;
        let byDefault = data?.byDefault;
        let variables = data?.variables;
        if (questions) {
          this.setState({
            questions,
            conditions,
            byDefault,
            variables,
            mainImage: questions[0]?.mainImage,
            question: questions[0]?.question,
            answerOptions: questions[0]?.answers,
            type: questions[0]?.type,
            notFound: false,
            description: questions[0]?.description,
            loading: false,
          });
          // Caching
          for (let i in questions) {
            let answers = questions[i].answers;
            new Image().src = questions[i].mainImage;
            for (let j in answers) {
              new Image().src = answers[j].image;
            }
          }
        }
      } else {
        this.setState({
          loading: false,
        });
      }
    });
  }

  sendEmail = (email, name, message, html, name_sender) => {
    axios({
      method: "post",
      url: `https://pascalecoulon.com/sendemail/index.php`,
      headers: { "content-type": "application/json" },
      data: JSON.stringify({
        email: email,
        name: name,
        message: message,
        html: html,
        name_sender: name_sender,
      }),
    }).catch((error) => {
      Notify("Problème lors de l'envoi de l'email : " + error, "error");
    });
  };

  handleAnswerSelected = (target, checkedList) => {
    this.setState({ error: false });
    if (target?.value) {
      this.setUserAnswer(target, checkedList);
      if (this.state.questionId < this.state.questions.length) {
        setTimeout(() => this.setNextQuestion(), 300);
      } else {
        setTimeout(() => {
          this.setState({ end: true });
          this.setAnswersDb();
        }, 300);
      }
    } else {
      this.setState({ error: true });
    }
  };

  setAnswersDb = () => {
    const {
      answers,
      email,
      variables,
      conditions,
      summary,
      byDefault,
    } = this.state;
    let db = this.props.firebase.db;
    let responsesRef = db.ref("responses");
    let newResponseRef = responsesRef.push();
    let date = new Date();
    // GET CUSTOMS VARIABLES AND ADD TO ANSWERS
    let _answers = answers;
    if (variables) {
      let _var_answers = this.getVar(variables);
      for (let i of _var_answers) {
        _answers.push(i);
      }
    }
    newResponseRef.set({
      answers: _answers,
      date: date.toLocaleString(),
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    });
    let receiver_email = Object.keys(answers)
      .filter((el, key) => {
        return answers[key].type === "email";
      })
      .toString();
    /* let listAnswers =
      "<table>" +
      "<thead>" +
      "<tr>" +
      "<th>Question</th>" +
      "<th>Réponse(s)</th>" +
      "</tr>" +
      "</thead>" +
      "<tbody>";
    listAnswers += Object.keys(answers)
      .map((el) => {
        return (
          "<tr>" +
          "<td>" +
          answers[el]?.question +
          "</td>" +
          "<td>" +
          answers[el]?.value +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    listAnswers += "</tbody></table>"; */
    let _id = this.getConditionIndex(_answers);
    let id_email =
      _id !== -1 ? conditions[_id]?.sendEmail : byDefault?.sendEmail;
    let id_summary =
      _id !== -1 ? conditions[_id]?.showSummary : byDefault?.showSummary;
    let emailHtml = email[id_email]?.email?.html;
    let summaryHtml = summary[id_summary]?.summary?.html;
    this.sendEmail(
      answers[receiver_email]?.value,
      "DELEO - Quiz complété avec succès !",
      JSON.stringify(answers),
      emailHtml ? emailHtml.toString() : "",
      "Manon"
    );
    this.setState({
      summaryHtml: summaryHtml ?? "",
    });
  };

  getConditionIndex = (answers) => {
    const { conditions } = this.state;
    let bool = false;
    for (let i = 0; i < conditions.length; i++) {
      let _conditions = conditions[i]?.conditions;
      for (let j = 0; j < _conditions.length; j++) {
        bool = false;
        let operator = _conditions[j]?.operator;
        let index = answers.findIndex(
          (answer) => answer?.question === _conditions[j]?.question
        );
        let value1 = _conditions[j]?.value;
        let value2 = answers[index]?.value;
        let question1 = _conditions[j]?.question;
        let question2 = answers[index]?.question;
        if (operator === "===") {
          if (question1 === question2) {
            if (
              value1.toString().toLowerCase() ===
                value2.toString().toLowerCase() ||
              JSON.stringify(value1.sort()) === JSON.stringify(value2.sort())
            ) {
              console.log("yeah");
              bool = true;
            } else {
              bool = false;
              break;
            }
          }
        } else if (operator === ">=") {
          if (question1 === question2) {
            if (value1 >= value2) {
              bool = true;
            } else {
              bool = false;
              break;
            }
          }
        } else if (operator === "<=") {
          if (question1 === question2) {
            if (value1 <= value2) {
              bool = true;
            } else {
              bool = false;
              break;
            }
          }
        } else if (operator === "<") {
          if (question1 === question2) {
            if (value1 < value2) {
              bool = true;
            } else {
              bool = false;
              break;
            }
          }
        } else if (operator === ">") {
          if (question1 === question2) {
            if (value1 > value2) {
              bool = true;
            } else {
              bool = false;
              break;
            }
          }
        }
      }
      if (bool) {
        console.log("boool!" + i);
        return i;
      }
    }
    return -1;
  };

  handleKeyPressed(event) {
    this.setState({
      error: false,
    });
    this.handleAnswerSelected(event);
  }

  getVar(variables) {
    const { answers } = this.state;
    let _var_answers = [];
    for (let i = 0; i < answers.length; i++) {
      for (let j = 0; j < variables.length; j++) {
        if (variables[j]?.constants && answers[i]?.question) {
          for (let k = 0; k < variables[j].constants.length; k++) {
            if (variables[j].constants[k]?.question === answers[i].question) {
              let _calc = _var_answers[j]?.value
                ? _var_answers[j].value.toString()
                : variables[j].calc.toString();
              let _name_var = variables[j].constants[k].name.toString();
              let _name = variables[j].name.toString();
              let _value = answers[i].value.toString();
              _calc = _calc.split(_name_var).join(_value);
              _calc = stringMath(_calc.toString())
                ? stringMath(_calc.toString()).toString()
                : _calc.toString();
              _var_answers[j] = {
                value: _calc,
                question: _name,
                name: _name,
                type: stringMath(_calc.toString()) ? "number" : "text",
              };
            }
          }
        }
      }
    }
    return _var_answers;
  }

  setUserAnswer(target, checkedList) {
    if (target.value === "Homme") {
      this.setState({
        sex: "male",
      });
    } else if (target.value === "Femme") {
      this.setState({
        sex: "female",
      });
    }
    this.setState((state) => ({
      answersCount: {
        ...state.answersCount,
        [target.value]: (state.answersCount[target.value] || 0) + 1,
      },
      answer: target,
      answers: [
        ...state.answers,
        {
          question: state.question,
          value: checkedList?.length ? checkedList : target.value,
          type: target.type,
          name: target.name,
        },
      ],
    }));
  }

  setBackQuestion = () => {
    const { answers } = this.state;
    answers.pop();
    this.setState((state) => ({
      counter: state.counter - 1,
      questionId: state.questionId - 1,
      question: state.questions[state.counter - 1].question,
      description: state.questions[state.counter - 1].description,
      answerOptions: state.questions[state.counter - 1].answers,
      mainImage: state.questions[state.counter - 1].mainImage,
      type: state.questions[state.counter - 1].type,
      answers,
      answer: "",
      error: false,
      answersCount: {
        ...state.answersCount,
        [state.answer.value]: (state.answersCount[state.answer.value] || 0) - 1,
      },
    }));
  };

  setNextQuestion() {
    this.setState((state) => ({
      counter: state.counter + 1,
      questionId: state.questionId + 1,
      question: state.questions[state.counter + 1].question,
      description: state.questions[state.counter + 1].description,
      type: state.questions[state.counter + 1].type,
      answerOptions: state.questions[state.counter + 1].answers,
      mainImage: state.questions[state.counter + 1].mainImage,
      answer: "",
    }));
  }

  render() {
    const {
      custom,
      loading,
      end,
      answer,
      type,
      question,
      description,
      questionId,
      answerOptions,
      mainImage,
      error,
      notFound,
      questions,
      sex,
      email,
      summaryHtml,
    } = this.state;
    return loading ? (
      <Loading />
    ) : (
      <div
        className="App"
        style={{
          backgroundColor: custom?.bgColor,
        }}
      >
        <div className="Quiz">
          {!end ? (
            <Quiz
              answer={answer}
              sex={sex}
              custom={custom}
              answerOptions={answerOptions}
              questionId={questionId}
              question={question}
              description={description}
              type={type}
              questionTotal={questions.length}
              mainImage={mainImage}
              onAnswerSelected={this.handleAnswerSelected}
              onKeyPressed={this.handleKeyPressed}
              onBack={this.setBackQuestion}
              error={error}
              notFound={notFound}
            />
          ) : (
            <Summary
              answer={answer}
              custom={custom}
              email={email}
              summaryHtml={summaryHtml}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withFirebase(App);
