import React, { Component } from 'react';
import Quiz from './Quiz';
import Summary from './Summary';
import axios from 'axios';
import '../../App.css';
import "animate.css";

import { withFirebase } from '../Firebase';
import firebase from "firebase/app";

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
      questionId: 1,
    };
    this.handleAnswerSelected = this.handleAnswerSelected.bind(this);
    this.handleKeyPressed = this.handleKeyPressed.bind(this);
  }

  componentDidMount() {
    this.getQuestions();
  }

  async getQuestions() {
    let { db } = this.props.firebase;
    let { match } = this.props;
    let responsesRef = db.ref("questions");
    await responsesRef.on('value',(snap)=>{
      let data = snap.val();
      if(data) {
        let allQuestions = Object.keys(data).map(i => data[i]);
        let questions = allQuestions[match?.params?.id ? match?.params?.id : 0]?.questions;
        // DEFAULT
        if(!questions) {
          questions = allQuestions[0]?.questions;
        }
        this.setState({
          questions,
          question: questions[0]?.question,
          answerOptions: questions[0]?.answers,
          loading : false,
        });
      }
    });
  }
   /* async getQuestions(index) {
    await db.collection("questions").get().then((querySnapshot) => {
      let data = querySnapshot.docs.map(doc => doc.data());
      console.log("Document keys:", Object.keys(data));
        Object.keys(data).forEach((name) => {
          console.log(name, data[name]);
        });
      let questions = data[index];
      this.setState({
        questions : Object.keys(questions).map(i => questions[i]),
        question: questions[index].question,
        answerOptions: questions[0].answers,
        loading: false,
      })
      console.log(this.state.questions)
    });
  } */
  sendEmail = (email, name, message, html, name_sender) => {
    /* var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', () => {
      console.log(xhr.responseText)
    });
    xhr.open('GET', 'https://pascalecoulon.com/sendemail/index.php?sendto=' + email +
            '&name=' + name +
            '&message=' + message +
            '&html=' + html +
            '&name_sender=' + name_sender);
    xhr.send(); */
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
          console.log("ok");
        } else {
          console.log(result.data)
        }
      })
      .catch(error => console.log(error));
  }

  handleAnswerSelected(event) {
    this.setState({error: false});
    if(event.target.value) {
      this.setUserAnswer(event.target);
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
      return answers[el]?.type === "email"
    });
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
    this.sendEmail(answers[email]?.value, "DELEO - Quiz complété avec succès !", JSON.stringify(answers), listAnswers.toString(), "Manon");
  }

  handleKeyPressed(event) {
    this.setState({
      error:false
    })
    let keyCode = event.keyCode || event.charCode;
    if(keyCode === 13) {
      this.handleAnswerSelected(event)
    }
  }

  setUserAnswer(answer){
    this.setState((state, props) => ({
      answersCount: {
        ...state.answersCount,
        [answer.value]: (state.answersCount[answer.value] || 0) + 1
      },
      answer: answer,
      answers : [...state.answers, 
        {question : state.question, value : answer.value, type : answer.type, name: answer.name}
      ],
    }), () => {
      console.log(this.state.answers)
    });
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
      answerOptions: questions[counter].answers,
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
            questionTotal={this.state.questions.length}
            onAnswerSelected={this.handleAnswerSelected}
            onKeyPressed={this.handleKeyPressed}
            onBack={this.setBackQuestion}
            error={this.state.error}
            />
          ) : (
            <Summary />
          )}
      </div>)
  }
}

export default withFirebase(App);
