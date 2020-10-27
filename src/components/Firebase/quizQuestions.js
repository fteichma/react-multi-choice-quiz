var quizQuestions = [
  {
    question: "Quel est votre prénom ?",
    answers: [
      {
        type: "text",
        content: "Prénom",
      },
    ],
  },
  {
    question: "Quel est votre nom ?",
    answers: [
      {
        type: "text",
        content: "Nom",
      },
    ],
  },
  {
    question: "Quel est votre adresse email ?",
    answers: [
      {
        type: "email",
        content: "Email",
      },
    ],
  },
  {
    question: "Vous êtes une femme ou un homme ?",
    answers: [
      {
        type: "radio",
        image: "https://image.flaticon.com/icons/svg/1864/1864609.svg",
        content: "Femme",
      },
      {
        type: "radio",
        image: "https://image.flaticon.com/icons/svg/1864/1864593.svg",
        content: "Homme",
      },
    ],
  },
  {
    question: "Quel est votre âge ?",
    answers: [
      {
        type: "radio",
        content: "18-25 ans",
      },
      {
        type: "radio",
        content: "26-39 ans",
      },
      {
        type: "radio",
        content: "40-59 ans",
      },
      {
        type: "radio",
        content: "60-74 ans",
      },
      {
        type: "radio",
        content: "+74 ans",
      },
    ],
  },
  {
    question: "Quel est votre poids ?",
    answers: [
      {
        type: "number",
        content: "Poids en kg",
      },
    ],
  },
  {
    question: "Quel est votre taille ?",
    answers: [
      {
        type: "number",
        content: "Taille en cm",
      },
    ],
  },
  {
    question: "Qu'aimeriez-vous traiter ?",
    answers: [
      {
        type: "radio",
        content: "Affiner ma silhouette",
      },
      {
        type: "radio",
        content: "Tonifier mes muscles",
      },
      {
        type: "radio",
        content: "Lisser ma peau",
      },
    ],
  },
  {
    question: "Sur quelle(s) partie(s) du corps ?",
    answers: [
      {
        type: "body",
        content: "",
      },
    ],
  },
];

export default quizQuestions;
