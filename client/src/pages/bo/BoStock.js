import React from 'react';

const BoStock = ({ingredient}) => {
  const { name, img, price, stock, unit } = ingredient;

  return (
    <div className='stock-container' style={{opacity:(stock<=0?'0.5':'1')}}>
      <div className='cocktail-image-wrapper'>
        <img 
          src={`images/ingredient/${img}`} 
          alt={name} 
          className='stock-image'
        />
        <p className='stock-price'>{price.toLocaleString(undefined,{minimumFractionDigits:2})} €</p>
      </div>
      <h3 className='stock-name'>{name}</h3>
      <p className='stock-name'>{Math.round(stock*100)/100}{unit?unit:""}</p>
    </div>
  );
};

export default BoStock;
