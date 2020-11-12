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
    };
    this.handleAnswerSelected = this.handleAnswerSelected.bind(this);
    this.handleKeyPressed = this.handleKeyPressed.bind(this);
  }

  componentDidMount() {
    this.getQuestions();
    this.getCustom();
  }

  getQuestions() {
    let url = this.props.location.search;
    let params = queryString.parse(url);
    this.getQuestionsByRef(params?.id);
  }

  getCustom() {
    let db = this.props.firebase.db;
    let questionsRef = db.ref(`custom`);
    questionsRef.on("value", (snap) => {
      let data = snap.val();
      if (data) {
        this.setState({
          custom: data,
        });
      }
    });
  }

  getQuestionsByRef(id) {
    let db = this.props.firebase.db;
    let questionsRef = db.ref(`questions/${id}`);
    questionsRef.on("value", (snap) => {
      let data = snap.val();
      if (data) {
        let questions = data?.questions;
        let conditions = data?.conditions;
        let variables = data?.variables;
        if (questions) {
          this.setState({
            questions,
            conditions,
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
    const { answers } = this.state;
    let db = this.props.firebase.db;
    let responsesRef = db.ref("responses");
    let newResponseRef = responsesRef.push();
    let date = new Date();
    let _var_answers = this.getVar();
    let _answers = answers;
    for (let i of _var_answers) {
      _answers.push(i);
    }
    newResponseRef.set({
      answers: _answers,
      date: date.toLocaleString(),
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    });
    let email = Object.keys(answers).filter((el, key) => {
      return answers[key].type === "email";
    });
    let listAnswers =
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
    listAnswers += "</tbody></table>";
    this.sendEmail(
      answers[email.toString()]?.value,
      "DELEO - Quiz complété avec succès !",
      JSON.stringify(answers),
      listAnswers.toString(),
      "Manon"
    );
  };

  handleKeyPressed(event) {
    this.setState({
      error: false,
    });
    this.handleAnswerSelected(event);
  }

  getVar() {
    const { variables, answers } = this.state;
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
    this.setState(
      (state, props) => ({
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
      }),
      () => {}
    );
  }

  setBackQuestion = () => {
    const counter = this.state.counter - 1;
    const questionId = this.state.questionId - 1;
    const questions = this.state.questions;
    const answers = this.state.answers;
    answers.pop();
    this.setState((state, props) => ({
      counter: counter,
      questionId: questionId,
      question: questions[counter].question,
      description: questions[counter].description,
      answerOptions: questions[counter].answers,
      mainImage: questions[counter].mainImage,
      type: questions[counter].type,
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
    const counter = this.state.counter + 1;
    const questionId = this.state.questionId + 1;
    const questions = this.state.questions;
    this.setState({
      counter: counter,
      questionId: questionId,
      question: questions[counter].question,
      description: questions[counter].description,
      type: questions[counter].type,
      answerOptions: questions[counter].answers,
      mainImage: questions[counter].mainImage,
      answer: "",
    });
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
            <Summary answer={answer} custom={custom} />
          )}
        </div>
      </div>
    );
  }
}

export default withFirebase(App);
