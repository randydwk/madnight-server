import React from 'react';

const BoCocktail = ({ cocktail }) => {
  return (
    <div className='stock-container' style={{opacity:(!cocktail.maxMake>0?'0.5':'1')}}>
      {cocktail.maxMake>0?<p className='stock-nb'>{cocktail.maxMake}</p>:''}
      {cocktail.nbmade!=null?<p className='stock-nb' style={{top:'75px'}}>{cocktail.nbmade}</p>:''}
      <img 
        src={`images/cocktail${cocktail.type==='BEER'?'/beer':(cocktail.type==='SHOOTER'?'/shooter':'')}/${cocktail.img}`} 
        alt={cocktail.name} 
        className='stock-image'
      />
      <h3 className='stock-name'>{cocktail.name}</h3>
      <p className='stock-name spirit'>{cocktail.spirit}</p>
    </div>
  );
};

export default BoCocktail;
