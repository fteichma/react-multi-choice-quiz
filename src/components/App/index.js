import React, { Component } from 'react';
import Quiz from './Quiz';
import Summary from './Summary';
import '../../App.css';
import "animate.css";

import { withFirebase } from '../Firebase';
import firebase from "firebase/app";

import Loading from '../Loading';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
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
    /* let index = 0;
    this.getQuestions(index); */
/*     let db = this.props.firebase.db;
    let responsesRef = db.ref("responses");
    let newResponseRef = responsesRef.push();
    newResponseRef.set({
      test : "ok",
      createdAt: firebase.database.ServerValue.TIMESTAMP
    }); */
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

  handleAnswerSelected(event) {
    this.setUserAnswer(event.target);

    if (this.state.questionId < this.state.questions.length) {
      setTimeout(() => this.setNextQuestion(), 300);
    } else {
      setTimeout(() => this.setState({ end: true }), 300);
     const {answers} = this.state;
      let db = this.props.firebase.db;
      let responsesRef = db.ref("responses");
      let newResponseRef = responsesRef.push();
      newResponseRef.set({
        answers,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
    }
  }

  handleKeyPressed(event) {
    this.setState({
      error:false
    })
    let keyCode = event.keyCode || event.charCode;
    if(keyCode === 13) {
      if(event.target.value) {
        this.handleAnswerSelected(event)
      }
      else {
        this.setState({
          error:true,
        })
      }
    }
  }

  setUserAnswer(answer){
    this.setState((state, props) => ({
      answersCount: {
        ...state.answersCount,
        [answer.value]: (state.answersCount[answer.value] || 0) + 1
      },
      answer: answer,
      answers : {...state.answers, 
        [state.counter] : {question : state.question, value : answer.value, type : answer.type, name: answer.name}
      },
    }), () => {
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
    return this.state.loading && !this.state.questions ?
      (<Loading />): 
      (<div className="App">
        {!this.state.end ? (
            <Quiz
            answer={this.state.answer}
            answerOptions={this.state.answerOptions}
            questionId={this.state.questionId}
            question={this.state.question}
            questionTotal={this.state.questions.length}
            onAnswerSelected={this.handleAnswerSelected}
            onKeyPressed={this.handleKeyPressed}
            error={this.state.error}
            />
          ) : (
            <Summary />
          )}
      </div>)
  }
}

export default withFirebase(App);
