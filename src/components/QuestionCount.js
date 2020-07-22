import React from 'react';
import PropTypes from 'prop-types';

function QuestionCount(props) {
  return (
    <div className="questionCount">
    {[...Array(props.total)].map((x, i) => {
    return(
      <span className={`questionDot ${i+1 <= props.counter ? `active` : ``}`}/>
      )})}
    </div>
  ); 
}

QuestionCount.propTypes = {
  counter: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired
};

export default QuestionCount;
