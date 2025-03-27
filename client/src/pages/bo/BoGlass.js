import React from 'react';

const BoIngredient = ({ name, img, stock, unit }) => {
  return (
    <div className='stock-container' style={{opacity:(stock<=0?'0.5':'1')}}>
      <img 
        src={`images/glass/${img}`} 
        alt={name} 
        className='stock-image'
      />
      <h3 className='stock-name'>{name}</h3>
      <p className='stock-name'>{Math.round(stock*100)/100} {unit?unit:""}</p>
    </div>
  );
};

export default BoIngredient;
