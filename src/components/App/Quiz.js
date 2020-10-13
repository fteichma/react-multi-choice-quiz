import React from 'react';
import Question from './Question';
import QuestionCount from './QuestionCount';
import AnswerOption from './AnswerOption';
import { ChevronLeft, ChevronRight } from 'react-feather';

class Quiz extends React.Component {
  constructor(props) {
    super();
    this.state = {
      target : undefined,
      checkedList : []
    };
  }
  onMultiCheck = (e) => {
    const {checkedList} = this.state;
    this.setState({
      target : e.target,
    });
    if(e?.target?.checked) {
    let ary = [...checkedList, e.target.value];
    this.setState((state) => ({
      checkedList : ary
    }))
    } else if(!(e?.target?.checked)){
      let ary = checkedList;
      ary = ary.filter(el => el !== e.target.value);
      this.setState({
        checkedList : ary,
      })
    }
  }
  render() {
  return (
    <div>
            {this.props.questionId>1 && 
      (<button onClick={()=>{
        this.setState({
          target : undefined,
          checkedList : []
        });
        this.props.onBack();
      }} 
      className="btn-nav btn-prev">
        <ChevronLeft/>
      </button>)}
    <div className="container">
      <div key={this.props.questionId} className="questionContainer animate__animated animate__fadeInRight">
        <Question content={this.props.question} />
        <ul className="answerOptions">
            {this.props.answerOptions.map((el, key, array) => { 
              if(array[key].type === "text" || array[key].type === "email" || array[key].type === "number") {
                  return (
                    <li className="answerOption">
                      <input
                      className={this.props.error ? `animate__animated animate__shakeX` : ``} 
                      type={array[key].type} 
                      placeholder={array[key].content} 
                      onKeyPress={(e) => {
                        let keyCode = e.keyCode || e.charCode;
                        if(keyCode === 13) {
                          this.props.onKeyPressed(e.target);
                          this.setState({
                            target : undefined
                          })
                      }}}
                      name={array[key].content}
                      onChange={(e) => {
                        this.setState({
                          target : e.target
                      })}}
                      value={this.state.target?.value}
                      autoFocus
                      />
                    </li>
                  ) }
                  else if(array[key].type === "body")  {
                      return(
                        <li key={key}>
                                                  {/* <BodyFront className="bodySelect" onClick={this.props.onAnswerSelected}/>
                        <BodyBack className="bodySelect" onClick={this.props.onAnswerSelected}/> */}
                          <input type="checkbox" id={array[key].content} name="bodySelect" value={array[key].content}
                                            onChange={(e) => this.onMultiCheck(e)} 
                                              />
                          <label htmlFor="bodySelect">{array[key].content}</label>
                        </li>
                      )
                  } else {
            return (
              <li className="answerOption">
                <input
                  type="radio"
                  className="radioCustomButton"
                  name="radioGroup"
                  checked={array[key].content === array[key].answer}
                  id={array[key].content}
                  value={array[key].content}
                  disabled={array[key].answer}
                  onChange={(e) => {
                    this.props.onAnswerSelected(e.target)
                    this.setState({
                      target : e.target
                    })
                  }}
                />
                {array[key].image &&
                <img src={array[key].image} className="answerImage" alt="Answer" width="50%"/>
                }
                <label className="radioCustomLabel" htmlFor={array[key].content}>
                  {array[key].content}
                </label>
              </li>
            )}
            })}
        </ul>
        {this.props.error && <span className="info-error">Veuillez compléter le champ</span>}
      </div>
      <QuestionCount counter={this.props.questionId} total={this.props.questionTotal} />
    </div>
    <button className="btn-nav btn-next" onClick={() => {
        this.props.onAnswerSelected(this.state.target, this.state.checkedList);
        this.setState({
          target : undefined,
          checkedList : []
        })
        }}>
          <ChevronRight />
      </button>
    </div>
  )}
}

export default Quiz;
