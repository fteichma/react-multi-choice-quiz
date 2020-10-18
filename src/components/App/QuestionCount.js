import React from 'react';

function QuestionCount(props) {
  return (
    <div className="questionCount" style={{
      backgroundColor : props.btn?.primary ? props.btn?.primary : "#ffffff"
    }}>
    {[...Array(props.total)].map((x, i) => {
      if(i+1 < props.counter) {
        return(
          <span key={i} className={"questionDot active"} style={{
            backgroundColor : props.btn?.secondary ?  props.btn?.secondary : "#333333"
          }}/>
        )
      }
      else if(i+1 === props.counter)
      {
        return(
          <span key={i} className={"questionDot current"} style={{
            backgroundColor : props.btn?.secondary ?  props.btn?.secondary : "#333333"
          }}/>
        )
      }
        return(
          <span key={i} className={"questionDot"} style={{
            backgroundColor : props.btn?.secondary ?  props.btn?.secondary : "#333333"
          }}/>
      )})}
    </div>
  ); 
}

export default QuestionCount;
