import React from 'react';
import Question from './Question';
import QuestionCount from './QuestionCount';
import AnswerOption from './AnswerOption';

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
      <div key={props.questionId} className="questionContainer animate__animated animate__fadeInRight">
        <Question content={props.question} />
        <ul className="answerOptions">
          {props.answerOptions.map(renderAnswerOptions)}
        </ul>
      </div>
      <QuestionCount counter={props.questionId} total={props.questionTotal} />
    </div>
  );
}

export default Quiz;
