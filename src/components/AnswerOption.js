import React from 'react';
import PropTypes from 'prop-types';
import {ReactComponent as BodyFront} from '../svg/body_front.svg';
import {ReactComponent as BodyBack} from '../svg/body_back.svg';


function AnswerOption(props) {
    switch(props.answerType) {
      case 'text' :
        return (
          <li className="answerOption">
            <input 
            type="text" 
            placeholder={props.answerContent} 
            onKeyPress={props.onKeyPressed}
            />
          </li>
        )
        case 'email' :
          return (
            <li className="answerOption">
              <input 
              type="email" 
              placeholder={props.answerContent} 
              onKeyPress={props.onKeyPressed}
              />
            </li>
          )
          case 'body' :
            return(
              <>
              <BodyFront className="bodySelect" onClick={props.onAnswerSelected}/>
              <BodyBack className="bodySelect" onClick={props.onAnswerSelected}/>
              </>
            )
          case 'number' :
            return (
              <li className="answerOption">
                <input 
                type="number" 
                placeholder={props.answerContent} 
                onKeyPress={props.onKeyPressed}
                />
              </li>
            )
      default : 
  return (
    <li className="answerOption">
      <input
        type="radio"
        className="radioCustomButton"
        name="radioGroup"
        checked={props.answerContent === props.answer}
        id={props.answerContent}
        value={props.answerContent}
        disabled={props.answer}
        onChange={props.onAnswerSelected}
      />
      {props.answerImage &&
      <img src={props.answerImage} className="answerImage" alt="Answer" width="50%"/>
      }
      <label className="radioCustomLabel" htmlFor={props.answerContent}>
        {props.answerContent}
      </label>
    </li>
  );
  }
}

AnswerOption.propTypes = {
  answerType: PropTypes.string.isRequired,
  answerImage: PropTypes.string,
  answerContent: PropTypes.string,
  answer: PropTypes.string,
  onAnswerSelected: PropTypes.func.isRequired,
  onKeyPressed: PropTypes.func.isRequired,
};

export default AnswerOption;
