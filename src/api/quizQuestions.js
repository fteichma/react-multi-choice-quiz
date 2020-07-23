var quizQuestions = [
  {
      question: "Quel est votre prénom ?",
      answers: [
          {
              type : "text",
              content : "Prénom"
          }
      ]
  },
  {
      question: "Quelle solution utilisez-vous pour gardez vos mains propres ?",
      answers: [
          {
              type : "radio",
              image : "https://image.flaticon.com/icons/svg/3165/3165257.svg",
              content: "Savon traditionnelle"
          },
          {
            type : "radio",
            image: "https://image.flaticon.com/icons/svg/3165/3165219.svg",
              content: "Gel hydroalcoolique"
          }
      ]
  },
  {
      question: "Je suis un exemple.",
      answers: [
          {
            type : "radio",
              image : "https://image.flaticon.com/icons/svg/3165/3165245.svg",
              content: "Je suis un test"
          }
      ]
  }
];

export default quizQuestions;
