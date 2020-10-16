import React from 'react';

function Summary(props) {
  return (
      <div className="thankYou" style={{backgroundColor: props?.custom?.bgColor}}>
        <h2>Merci pour votre participation !</h2>
        <p>Vous recevrez un email récapitulatif d'ici quelques instants !</p>
      </div>
  );
}

export default Summary;
