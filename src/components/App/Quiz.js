import React from 'react';
import QuestionCount from './QuestionCount';
import { ChevronLeft, ChevronRight } from 'react-feather';
import {ReactComponent as BodyFront} from '../../svg/body_front.svg';
import {ReactComponent as BodyBack} from '../../svg/body_back.svg';

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
    if(!this.props.notFound){
        return(
        <>
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
      {this.props.mainImage && (
        <div style={{margin:"auto",display:"flex",justifyContent:"center",alignItems:"center"}}>
        <img width='65' src={this.props.mainImage} alt=""/>
        </div>
      )}
      <h2 className="question">{this.props.question}</h2>
        <ul className="answerOptions">
            {this.props.answerOptions?.map((el, key, array) => { 
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
                   else if(array[key].type === "radio") {
            return (
              <li className="answerOption radioOption">
                <input
                  type={array[key].type}
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
            else if (array[key].type === "checkbox") {
              return (
                    <li key={key} className="answerOption checkboxOption">
                      <input type={array[key].type} id={array[key].content} name="select" value={array[key].content}
                                        onChange={(e) => this.onMultiCheck(e)} 
                                          />
                      <label htmlFor="select">{array[key].content}</label>
                    </li>
              )
            }
            })}
            {/* BODY */}
            {(this.props?.answerOptions[(this.props?.questionId-1)]?.type === "body") &&
            (
              <ul className="answerOptions">
                <div className="body" id="bodyBack">
                {this.props.answerOptions.map((el,key,array) => 
              (key < 6) && (<li key={key} className="bodySelect" id={el.content.replace(/\s/g, '').replace(/'/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}>
                  <input type="checkbox" name="bodySelect" value={el.content} onChange={(e) => this.onMultiCheck(e)} id={`body${key}`}/>
                  <label htmlFor={`body${key}`}>{el.content}</label>
                </li>))}
                <BodyBack/>
                </div>
                <div className="body" id="bodyFront">
              {this.props.answerOptions.map((el,key,array) => 
              (key >= 6) && (<li key={key} className="bodySelect" id={el.content.replace(/\s/g, '').replace(/'/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}>
                  <input type="checkbox" name="bodySelect" value={el.content} onChange={(e) => this.onMultiCheck(e)} id={`body${key}`}/>
                  <label htmlFor={`body${key}`}>{el.content}</label>
                </li>))}
                <BodyFront/>
                </div>
              </ul>
            )
            }
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
      </>
        )} else {
      return(
        <div className="container">
        <span className="info-not-found">
          Aucun quiz à cette adresse
          </span>
          </div>)
    }
  }
}

export default Quiz;
