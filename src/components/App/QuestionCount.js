import React from 'react';

function QuestionCount(props) {
  return (
    <div className="questionCount">
    {[...Array(props.total)].map((x, i) => {
    return(
      <span key={i} className={`questionDot ${i+1 < props.counter ? `active` : i+1 === props.counter ? `current` : ``}`}/>
      )})}
    </div>
  ); 
}

export default QuestionCount;
