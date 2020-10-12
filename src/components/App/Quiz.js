import React from 'react';
import Question from './Question';
import QuestionCount from './QuestionCount';
import AnswerOption from './AnswerOption';
import { ChevronLeft, ChevronRight } from 'react-feather';

function Quiz(props) {
  function renderAnswerOptions(key) {
    return (
      <AnswerOption
        key={key.content}
        answerContent={key.content}
        answerType={key.type}
        answerImage={key.image}
        answer={props.answer}
        questionId={props.questionId}
        onAnswerSelected={props.onAnswerSelected}
        onKeyPressed={props.onKeyPressed}
        error={props.error}
      />
    );
  }

  return (
    <div className="container">
      {props.questionId>1 && 
      (<button onClick={props.onBack} 
      className="btn-nav btn-prev">
        <ChevronLeft/>
      </button>)}
      <div key={props.questionId} className="questionContainer animate__animated animate__fadeInRight">
        <Question content={props.question} />
        <ul className="answerOptions">
          {props.answerOptions.map(renderAnswerOptions)}
        </ul>
      </div>
      <button className="btn-nav btn-next" onClick={props.onAnswerSelected}><ChevronRight /></button>
      <QuestionCount counter={props.questionId} total={props.questionTotal} />
    </div>
  );
}

export default Quiz;
