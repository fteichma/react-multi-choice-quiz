import React from 'react';
import {ReactComponent as BodyFront} from '../../svg/body_front.svg';
import {ReactComponent as BodyBack} from '../../svg/body_back.svg';
import 'animate.css';

function AnswerOption(props) {
    switch(props.answerType) {
      case 'text' :
      case 'email' :
      case 'number' :
        return (
          <>
          <li className="answerOption">
            <input
            className={props.error ? `animate__animated animate__shakeX` : ``} 
            type={props.answerType} 
            placeholder={props.answerContent} 
            onKeyPress={props.onKeyPressed}
            name={props.answerContent}
            autoFocus
            />
          </li>
          {props.error && <span className="info-error">Veuillez compléter le champ</span>}
          </>
        )
          case 'body' :
            return(
            <>
              {/* <BodyFront className="bodySelect" onClick={props.onAnswerSelected}/>
              <BodyBack className="bodySelect" onClick={props.onAnswerSelected}/> */}
              <li>
                <input type="checkbox" id={props.answerContent} name="bodySelect" value={props.answerContent}
                onChange={props.onAnswerSelected}/>
                <label htmlFor="bodySelect">{props.answerContent}</label>
              </li>
            </>
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

export default AnswerOption;
