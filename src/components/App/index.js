import React, { Component } from 'react';
import Quiz from './Quiz';
import Summary from './Summary';
import axios from 'axios';
import '../../App.css';
import "animate.css";

import { withFirebase } from '../Firebase';
import firebase from "firebase/app";
import queryString from 'query-string';

import Loading from '../Loading';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      counter: 0,
      answerOptions: [],
      answer: '',
      answersCount: {},
      end: false,
      error:false,
      answers: [],
      question: '',
      questions : {},
      type: '',
      questionId: 1,
      notFound : true,
      mainImage : undefined
    };
    this.handleAnswerSelected = this.handleAnswerSelected.bind(this);
    this.handleKeyPressed = this.handleKeyPressed.bind(this);
  }

  componentDidMount() {
    this.getQuestions();
  }

  getQuestions() {
    let url = this.props.location.search;
    let params = queryString.parse(url);
    this.getQuestionsByRef(params?.id);
}

getQuestionsByRef(id) {
  let db = this.props.firebase.db;
    let questionsRef = db.ref(`questions/${id}`);
    questionsRef.on('value',(snap)=>{ 
      let data = snap.val();
      if(data) {
        let questions = data?.questions;
        if(questions) {
      this.setState({
        loading : false,
        questions,
        mainImage : questions[0]?.mainImage,
        question : questions[0]?.question,
        answerOptions : questions[0]?.answers,
        type: questions[0]?.type,
        notFound : false,
      });
      }
      }
      else {
        this.setState({
          loading : false,
        })
      }
    });
}
  sendEmail = (email, name, message, html, name_sender) => {
    axios({
      method: "post",
      url: `https://pascalecoulon.com/sendemail/index.php`,
      headers: { "content-type": "application/json" },
      data: JSON.stringify({
        email : email,
        name : name,
        message : message,
        html: html,
        name_sender: name_sender
      })
    })
      .then(result => {
        if (result.data.sent) {
          console.log("send");
        } else {
          console.log(result.data)
        }
      })
      .catch(error => console.log(error));
  }

  handleAnswerSelected = (target, checkedList) => {
    this.setState({error: false});
    if(target?.value) {
      this.setUserAnswer(target, checkedList);
      if (this.state.questionId < this.state.questions.length) {
        setTimeout(() => this.setNextQuestion(), 300);
      } else {
        setTimeout(() => {
          this.setState({ end: true });
          this.setAnswersDb();
        }, 300);
      }
    }
    else {
      this.setState({error: true})
    }
  }

  setAnswersDb = () => {
    const {answers} = this.state;
    let db = this.props.firebase.db;
    let responsesRef = db.ref("responses");
    let newResponseRef = responsesRef.push();
    let date = new Date();
    newResponseRef.set({
      answers,
      date : date.toLocaleString(),
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    });
    let email = Object.keys(answers).filter((el, key) => {
      return answers[key].type === "email"
    });
    console.log(email);
    let listAnswers = "<table>" +
    "<thead>" +
    "<tr>" +
    "<th>Question</th>" +
    "<th>Réponse(s)</th>" +
    "</tr>" +
    "</thead>" +
    "<tbody>";
    listAnswers += Object.keys(answers).map((el) => {
      return "<tr>" +
          "<td>" + answers[el]?.question + "</td>"+
          "<td>" + answers[el]?.value + "</td>" +
        "</tr>";
    }).join('');
    listAnswers += "</tbody>" +
    "</table>";
    this.sendEmail(answers[email.toString()]?.value, "DELEO - Quiz complété avec succès !", JSON.stringify(answers), listAnswers.toString(), "Manon");
  }

  handleKeyPressed(event) {
    this.setState({
      error:false
    })
      this.handleAnswerSelected(event);
  }

  setUserAnswer(target, checkedList){
    this.setState((state, props) => ({
      answersCount: {
        ...state.answersCount,
        [target.value]: (state.answersCount[target.value] || 0) + 1
      },
      answer: target,
      answers : [...state.answers, 
        {question : state.question, value : checkedList?.length ? JSON.stringify(checkedList) : target.value, type: target.type, name: target.name}
      ],
    }));
  }

  setBackQuestion = () => {
    const counter = this.state.counter - 1;
    const questionId = this.state.questionId - 1;
    const questions = this.state.questions;
    const answers = this.state.answers;
    answers.pop();
    console.log(answers);
    this.setState((state, props) => ({
      counter: counter,
      questionId: questionId,
      question: questions[counter].question,
      answerOptions: questions[counter].answers,
      mainImage : questions[counter].mainImage,
      type: questions[counter].type,
      answers,
      answer: '',
      error: false,
      answersCount : {
        ...state.answersCount,
      [state.answer.value]: (state.answersCount[state.answer.value] || 0) - 1
    },
    }),() => {
      console.log(this.state.answers)
    });
  }

  setNextQuestion() {
    const counter = this.state.counter + 1;
    const questionId = this.state.questionId + 1;
    const questions = this.state.questions;
    this.setState({
      counter: counter,
      questionId: questionId,
      question: questions[counter].question,
      type: questions[counter].type,
      answerOptions: questions[counter].answers,
      mainImage : questions[counter].mainImage,
      answer: ''
    });
  }

  render() {
    return this.state.loading ?
      (<Loading />): 
      (<div className="App">
        <div className="brand-logo">
          <a href="https://deleo.fr/">
            <img width="100%" src="https://firebasestorage.googleapis.com/v0/b/deleo-93c9d.appspot.com/o/logo-deleo.png?alt=media&token=7cc62f10-1778-411a-a550-de91e372faf1" alt="Logo" />
          </a>
        </div>
        {!this.state.end ? (
            <Quiz
            answer={this.state.answer}
            answerOptions={this.state.answerOptions}
            questionId={this.state.questionId}
            question={this.state.question}
            type={this.state.type}
            questionTotal={this.state.questions.length}
            mainImage={this.state.mainImage}
            onAnswerSelected={this.handleAnswerSelected}
            onKeyPressed={this.handleKeyPressed}
            onBack={this.setBackQuestion}
            error={this.state.error}
            notFound={this.state.notFound}
            />
          ) : (
            <Summary />
          )}
      </div>)
  }
}

export default withFirebase(App);
