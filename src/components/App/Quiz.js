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
      checkedList : [],
      back:false,
      error : false,
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
    const {custom} = this.props;
    const {back, error} = this.state;
    if(!this.props.notFound){
        return(
        <>
            {this.props.questionId>1 && 
      (<button onClick={()=>{
        this.setState({
          checkedList : [],
          back:true,
          error:false,
        });
        this.props.onBack();
        setTimeout(()=> {
          this.setState({
            target : undefined
          })
        }, 300);
      }}
      className="btn-nav btn-prev">
        <ChevronLeft/>
      </button>)}
    <div className="container" style={{backgroundColor: custom?.bgColor}}>
      <div key={this.props.questionId} className={`questionContainer animate__animated ${back ? `animate__fadeInLeft` : `animate__fadeInRight`}`}>
      {this.props.mainImage && (
        <div style={{margin:"auto",display:"flex",justifyContent:"center",alignItems:"center"}}>
        <img width='65' src={this.props.mainImage} alt=""/>
        </div>
      )}
      <h2 className="question" style={{
        color : custom?.textColor?.title
      }}>{this.props.question}</h2>
      {this.props.description &&
      (<p className="question-description" style={{
        color : custom?.textColor?.p
      }}>{this.props.description}</p>)}
        <ul className="answerOptions">
            {this.props?.answerOptions.map((el, key, array) => { 
              if(this.props.type === "text" || this.props.type === "email" || this.props.type === "number") {
                  return (
                    <li className="answerOption" key={`answerOption${key}`}>
                      <input
                      className={error ? `animate__animated animate__shakeX` : ``} 
                      type={this.props.type} 
                      placeholder={array[key].content} 
                      onKeyPress={(e) => {
                        let keyCode = e.keyCode || e.charCode;
                        if(keyCode === 13) {
                          if(e.target.value) {
                          this.props.onKeyPressed(e.target);
                          this.setState({
                            error : false,
                            back:false
                          })
                          setTimeout(()=> {
                            this.setState({
                              target : undefined,
                            })
                          }, 300);
                        } else {
                          this.setState({error:true});
                        }
                          
                      }}}
                      name={array[key].content}
                      onChange={(e) => {
                        let target = e.target;
                        this.setState({
                          target,
                          error:false,
                      })
                    }}
                      value={this.state.target?.value || ''}
                      autoFocus
                      />
                    </li>
                  ) }
                   else if(this.props.type === "radio") {
            return (
              <li className="answerOption radioOption" key={`radioOption${key}`}>
                <input
                  type={this.props.type}
                  className="radioCustomButton"
                  name={array[key].content}
                  checked={array[key].content === array[key].answer}
                  id={array[key].content}
                  value={array[key].content}
                  disabled={array[key].answer}
                  onChange={(e) => {
                    this.props.onAnswerSelected(e.target)
                    this.setState({
                      target : undefined,
                      back:false,
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
            else if (this.props.type === "checkbox") {
              return (
                    <li className="answerOption checkboxOption" key={`checkboxOption${key}`}>
                      <input type={this.props.type} id={array[key].content} name="select" value={array[key].content}
                                        onChange={(e) => this.onMultiCheck(e)} 
                                          />
                      <label htmlFor="select">{array[key].content}</label>
                    </li>
              )
            }
            })}
            {/* BODY */}
            {(this.props?.type === "body") &&
            (
              <ul className="answerOptions">
                <div className="body" id="bodyBack">
                {this.props.answerOptions.map((el,key,array) => 
              (key < 6) && (<li key={`bodySelect${key}`} className="bodySelect" id={el.content.replace(/\s/g, '').replace(/'/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}>
                  <input type="checkbox" name="bodySelect" value={el.content} onChange={(e) => this.onMultiCheck(e)} id={`body${key}`}/>
                  <label htmlFor={`body${key}`}>{el.content}</label>
                </li>))}
                <BodyBack/>
                </div>
                <div className="body" id="bodyFront">
              {this.props.answerOptions.map((el,key,array) => 
              (key >= 6) && (<li key={`bodySelect${key}`} className="bodySelect" id={el.content.replace(/\s/g, '').replace(/'/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}>
                  <input type="checkbox" name="bodySelect" value={el.content} onChange={(e) => this.onMultiCheck(e)} id={`body${key}`}/>
                  <label htmlFor={`body${key}`}>{el.content}</label>
                </li>))}
                <BodyFront/>
                </div>
              </ul>
            )
            }
        </ul>
        {error && <span className="info-error">Veuillez compléter le champ</span>}
      </div>
      <QuestionCount counter={this.props.questionId} total={this.props.questionTotal} />
    </div>
    <button className="btn-nav btn-next"
    onClick={() => {
      const {target} = this.state;
      if(target.value) {
      this.setState({
        checkedList : [],
        back : false
      })
      setTimeout(()=> {
        this.setState({
          target : undefined
        })
      }, 300);
        this.props.onAnswerSelected(this.state.target, this.state.checkedList);
        } else {
          this.setState({
            error:true,
            target : undefined
          })
        }
        }}>
          <ChevronRight/>
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
