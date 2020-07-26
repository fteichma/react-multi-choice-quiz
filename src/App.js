import React, { Component } from 'react';
import quizQuestions from './api/quizQuestions';
import Quiz from './components/Quiz';
import ThankYou from './components/ThankYou';
import './App.css';
import "animate.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      counter: 0,
      questionId: 1,
      question: '',
      answerOptions: [],
      answer: '',
      answersCount: {},
      end: false
    };
    this.handleAnswerSelected = this.handleAnswerSelected.bind(this);
    this.handleKeyPressed = this.handleKeyPressed.bind(this);
  }

  componentDidMount() {
    this.setState({
      question: quizQuestions[0].question,
      answerOptions: quizQuestions[0].answers,
    });
  }

  handleAnswerSelected(event) {
    this.setUserAnswer(event.currentTarget.value);

    if (this.state.questionId < quizQuestions.length) {
      setTimeout(() => this.setNextQuestion(), 300);
    } else {
      setTimeout(() => this.setState({ end: true }), 300);
    }
  }

  handleKeyPressed(event) {
    let keyCode = event.keyCode || event.charCode;
    if(keyCode === 13) {
      this.handleAnswerSelected(event)
    }
  }

  setUserAnswer(answer){
    console.log(answer);
    this.setState((state, props) => ({
      answersCount: {
        ...state.answersCount,
        [answer]: (state.answersCount[answer] || 0) + 1
      },
      answer: answer
    }));
  }

  setNextQuestion() {
    const counter = this.state.counter + 1;
    const questionId = this.state.questionId + 1;

    this.setState({
      counter: counter,
      questionId: questionId,
      question: quizQuestions[counter].question,
      answerOptions: quizQuestions[counter].answers,
      answer: ''
    });
  }

  renderQuiz() {
    return (
      <Quiz
        answer={this.state.answer}
        answerOptions={this.state.answerOptions}
        questionId={this.state.questionId}
        question={this.state.question}
        questionTotal={quizQuestions.length}
        onAnswerSelected={this.handleAnswerSelected}
        onKeyPressed={this.handleKeyPressed}
        />
    );
  }

  renderThankYou() {
    return <ThankYou />;
  }

  render() {
    return (
      <div className="App">
        {this.state.end ? this.renderThankYou() : this.renderQuiz()}
      </div>
    );
  }
}

export default App;
