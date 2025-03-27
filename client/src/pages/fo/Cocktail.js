import React from 'react';

const Cocktail = ({ cocktail }) => {
  return (
    <div className='cocktail-container' style={{opacity:(!cocktail.maxMake>0?'0.5':'1')}}>
      <img 
        src={`images/cocktail${cocktail.type==='BEER'?'/beer':(cocktail.type==='SHOOTER'?'/shooter':'')}/${cocktail.img}`} 
        alt={cocktail.name} 
        className='cocktail-image' 
      />
      <h3 className='cocktail-name'>{cocktail.name}</h3>
      <p className='cocktail-name spirit'>{cocktail.spirit}</p>
    </div>
  );
};

export default Cocktail;
