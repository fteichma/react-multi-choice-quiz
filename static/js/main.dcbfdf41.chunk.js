(this["webpackJsonpreact-quiz"]=this["webpackJsonpreact-quiz"]||[]).push([[0],[,,,,function(e,t,n){e.exports=n(12)},,,,,function(e,t,n){},function(e,t,n){},,function(e,t,n){"use strict";n.r(t);var s=n(0),a=n.n(s),o=n(3),r=n.n(o),i=(n(9),n(1)),c=[{question:"Premier petit exemple : Quel type de protection utilisez-vous ?",answers:[{image:"https://image.flaticon.com/icons/svg/3165/3165197.svg",content:"Masque non-r\xe9utilisable"},{image:"https://image.flaticon.com/icons/svg/3165/3165307.svg",content:"Masque r\xe9utilisable"},{image:"https://image.flaticon.com/icons/svg/3165/3165201.svg",content:"Visi\xe8re de protection"}]},{question:"Quelle solution utilisez-vous pour gardez vos mains propres ?",answers:[{image:"https://image.flaticon.com/icons/svg/3165/3165257.svg",content:"Savon traditionnelle"},{image:"https://image.flaticon.com/icons/svg/3165/3165219.svg",content:"Gel hydroalcoolique"}]},{question:"Je suis un exemple.",answers:[{image:"https://image.flaticon.com/icons/svg/3165/3165245.svg",content:"Je suis un test"}]}];var u=function(e){return a.a.createElement("h2",{className:"question"},e.content)};var l=function(e){return a.a.createElement("div",{className:"questionCount"},[...Array(e.total)].map((t,n)=>a.a.createElement("span",{className:"questionDot ".concat(n+1<=e.counter?"active":"")})))};var m=function(e){return a.a.createElement("li",{className:"answerOption"},a.a.createElement("input",{type:"radio",className:"radioCustomButton",name:"radioGroup",checked:e.answerContent===e.answer,id:e.answerContent,value:e.answerContent,disabled:e.answer,onChange:e.onAnswerSelected}),a.a.createElement("img",{src:e.answerImage,className:"answerImage",alt:"Answer",width:"50%"}),a.a.createElement("label",{className:"radioCustomLabel",htmlFor:e.answerContent},e.answerContent))};var d=function(e){return a.a.createElement("div",{className:"container"},a.a.createElement("div",{key:e.questionId,className:"questionContainer animate__animated animate__fadeInRight"},a.a.createElement(u,{content:e.question}),a.a.createElement("ul",{className:"answerOptions"},e.answerOptions.map((function(t){return a.a.createElement(m,{key:t.content,answerContent:t.content,answerImage:t.image,answer:e.answer,questionId:e.questionId,onAnswerSelected:e.onAnswerSelected})})))),a.a.createElement(l,{counter:e.questionId,total:e.questionTotal}))};var w=function(){return a.a.createElement("div",{className:"thankYou"},a.a.createElement("h2",null,"Merci pour votre participation !"),a.a.createElement("p",null,"N'h\xe9sitez pas \xe0 me recontacter sur ",a.a.createElement("a",{href:"https://www.codeur.com/-fteichma"},"Codeur.com")))};n(10),n(11);class h extends s.Component{constructor(e){super(e),this.state={counter:0,questionId:1,question:"",answerOptions:[],answer:"",answersCount:{},end:!1},this.handleAnswerSelected=this.handleAnswerSelected.bind(this)}componentDidMount(){this.setState({question:c[0].question,answerOptions:c[0].answers})}handleAnswerSelected(e){this.setUserAnswer(e.currentTarget.value),this.state.questionId<c.length?setTimeout(()=>this.setNextQuestion(),300):setTimeout(()=>this.setState({end:!0}),300)}setUserAnswer(e){this.setState((t,n)=>({answersCount:Object(i.a)(Object(i.a)({},t.answersCount),{},{[e]:(t.answersCount[e]||0)+1}),answer:e}))}setNextQuestion(){const e=this.state.counter+1,t=this.state.questionId+1;this.setState({counter:e,questionId:t,question:c[e].question,answerOptions:c[e].answers,answer:""})}renderQuiz(){return a.a.createElement(d,{answer:this.state.answer,answerOptions:this.state.answerOptions,questionId:this.state.questionId,question:this.state.question,questionTotal:c.length,onAnswerSelected:this.handleAnswerSelected})}renderThankYou(){return a.a.createElement(w,null)}render(){return a.a.createElement("div",{className:"App"},this.state.end?this.renderThankYou():this.renderQuiz())}}var p=h;Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(a.a.createElement(p,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(e=>{e.unregister()})}],[[4,1,2]]]);
//# sourceMappingURL=main.dcbfdf41.chunk.js.map