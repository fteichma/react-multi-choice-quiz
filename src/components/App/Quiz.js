import React from 'react';
import QuestionCount from './QuestionCount';
import { ChevronLeft, ChevronRight } from 'react-feather';
import {ReactComponent as BodyFront} from '../../svg/body_front.svg';
import {ReactComponent as BodyBack} from '../../svg/body_back.svg';

import { ToastContainer } from 'react-toastify';
import Notify from "../../notify";

class Quiz extends React.Component {
  constructor(props) {
    super();
    this.state = {
      target : undefined,
      checkedList : [],
      disabledList : [],
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
    } else {
      let ary = checkedList;
      ary = ary.filter(el => el !== e.target.value);
      this.setState({
        checkedList : ary,
      })
    }
  }
  onBodyCheck = (e) => {
    const {checkedList} = this.state;
    this.setState({
      target : e.target,
    });
    if(e?.target?.checked) {
    let value = e.target.value;
    let _disabledList = [];
    if(value === "Ailes d'ange" || value === "Culotte de cheval") {
      _disabledList = ["Cou", "Pli du soutien-gorge", "Poignées d'amour", "Genoux", "Menton", "Décolleté", "Pseudogynécomastie", "Bras", "Ventre", "Cuisses", "Mollets"]
    }
    else if(value === "Pli du soutien-gorge" || value === "Ventre") {
      _disabledList = ["Cou", "Ailes d'ange", "Poignées d'amour", "Culotte de cheval", "Genoux", "Menton", "Décolleté", "Pseudogynécomastie", "Bras", "Cuisses", "Mollets"];
    } 
    else {
      _disabledList = ["Cou", "Pli du soutien-gorge", "Ailes d'ange", "Poignées d'amour", "Culotte de cheval", "Genoux", "Menton", "Décolleté", "Pseudogynécomastie", "Bras", "Ventre", "Cuisses", "Mollets"];
      _disabledList = _disabledList.filter(e => e !== value);
    }
    let ary = [...checkedList, value];
    this.setState((state) => ({
      checkedList : ary,
      disabledList : _disabledList
    }))
    } else {
      let ary = checkedList;
      ary = ary.filter(el => el !== e.target.value);
      this.setState({
        checkedList : ary,
      })
      console.log(ary);
      if(ary.length === 0) {
        this.setState({
          disabledList : []
        })
      }
    }
  }
  render() {
    const {custom} = this.props;
    const {back, error, disabledList} = this.state;
    if(!this.props.notFound){
        return(
        <>
    <div className="container" style={{backgroundColor: custom?.bgColor ? custom?.bgColor : "#ffffff"}}>
      <div key={this.props.questionId} className={`questionContainer animate__animated ${back ? `animate__fadeInLeft` : `animate__fadeInRight`}`}>
      {this.props.mainImage && (
        <div style={{margin:"auto",display:"flex",justifyContent:"center",alignItems:"center"}}>
        <img width='60' src={this.props.mainImage} alt=""/>
        </div>
      )}
      <h2 className="question" style={{
        color : custom?.textColor?.title ? custom?.textColor?.title : "#4b4b4b"
      }}>{this.props.question}</h2>
      {this.props.description &&
      (<p className="question-description" style={{
        color : custom?.textColor?.p ? custom?.textColor?.p : "#999999"
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
                          Notify("Veuillez compléter le champ", "error");
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
                    <li className="answerOption multiOption" key={`multiOption${key}`}>
                      <input className="multiCustomButton" type={this.props.type} id={`multiCustom${key}`} name={`multiCustom${key}`} value={array[key].content}
                                        onChange={(e) => {
                                          this.onMultiCheck(e);
                                        }} 
                                          />
                      {array[key].image &&
                <img src={array[key].image} className="answerImage" alt="Answer" width="50%"/>
                }
                      <label htmlFor={`multiCustom${key}`} className="multiCustomLabel">{array[key].content}</label>
                    </li>
              )
            }
            })}
              {(this.props.type === "text" || this.props.type === "email" || this.props.type === "number") && 
              (
                  <button className="btn-nav btn-next"
                  style={{
                    backgroundColor: `${custom?.btn?.primary}` ? `${custom?.btn?.primary}` : "#ffffff"
                  }}
                  onClick={() => {
                    const {target} = this.state;
                    if(target?.value) {
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
                        });
                        Notify("Veuillez compléter le champ", "error");
                      }
                      }}>
                        <ChevronRight size={20} color={custom?.btn?.secondary ? custom?.btn?.secondary : "#333333"}/>
                    </button>
            )}
            {/* BODY */}
            {(this.props?.type === "body") &&
            (
              <ul className="answerOptions">
                <div className="body" id="bodyBack">
                {this.props.answerOptions.map((el,key,array) => 
              (key < 6) && (<li key={`bodySelect${key}`} className={`bodySelect ${disabledList.includes(el.content)? `disabled` : ``}`} id={el.content.replace(/\s/g, '').replace(/'/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}>
                  <input disabled={disabledList.includes(el.content)} type="checkbox" name="bodySelect" value={el.content} onChange={(e) => this.onBodyCheck(e)} id={`body${key}`}/>
                  <label htmlFor={`body${key}`}>{el.content}</label>
                </li>))}
                <BodyBack/>
                </div>
                <div className="body" id="bodyFront">
              {this.props.answerOptions.map((el,key,array) => 
              (key >= 6) && (<li key={`bodySelect${key}`} className={`bodySelect ${disabledList.includes(el.content)? `disabled` : ``}`} id={el.content.replace(/\s/g, '').replace(/'/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}>
                  <input disabled={disabledList.includes(el.content)}  type="checkbox" name="bodySelect" value={el.content} onChange={(e) => this.onBodyCheck(e)} id={`body${key}`}/>
                  <label htmlFor={`body${key}`}>{el.content}</label>
                </li>))}
                <BodyFront/>
                </div>
                  <button className="btn-nav btn-checkbox-body"
                  style={{
                    backgroundColor: `${custom?.btn?.primary}` ? `${custom?.btn?.primary}` : "#ffffff"
                  }}
                  onClick={() => {
                    const {target} = this.state;
                    if(target?.value) {
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
                        });
                        Notify("Veuillez sélectionner au moins une réponse...", "error");
                      }
                      }}>
                        <span style={{
                          color:custom?.btn?.secondary ? custom?.btn?.secondary : "#333333"
                        }}>{this.props.questionId === this.props.questionId?.length ? ` Terminer ` : `Continuer `}</span>
                        <ChevronRight size={20} color={custom?.btn?.secondary ? custom?.btn?.secondary : "#333333"}/>
                    </button>
              </ul>
            )
            }
        </ul>
        {(this.props.type === "checkbox") && (
                <button className="btn-nav btn-checkbox"
                style={{
                  backgroundColor: `${custom?.btn?.primary}` ? `${custom?.btn?.primary}` : "#ffffff"
                }}
                onClick={() => {
                  const {target} = this.state;
                  if(target?.value) {
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
                      });
                      Notify("Veuillez sélectionner au moins une réponse...", "error");
                    }
                    }}>
                      <span style={{
                        color:custom?.btn?.secondary ? custom?.btn?.secondary : "#333333"
                      }}>{this.props.questionId === this.props.questionId?.length ? ` Terminer ` : ` Continuer `}</span>
                      <ChevronRight size={20} color={custom?.btn?.secondary ? custom?.btn?.secondary : "#333333"}/>
                  </button>
            )}
      </div>
      <ToastContainer />
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
      className="btn-nav btn-prev"
      style={{
        backgroundColor: `${custom?.btn?.primary}` ? `${custom?.btn?.primary}` : "#ffffff"
      }}
      >
        <ChevronLeft size={20} color={custom?.btn?.secondary ? custom?.btn?.secondary : "#333333"}/>
        <span style={{
          color: custom?.btn?.secondary ? custom?.btn?.secondary : "#333333"
        }}>{`Précédent `}</span>
      </button>)}
      <QuestionCount counter={this.props.questionId} total={this.props.questionTotal} btn={this.props.custom?.btn}/>
    </div>
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
