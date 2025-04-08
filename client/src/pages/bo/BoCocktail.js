import React from 'react';

const BoCocktail = ({ cocktail }) => {
  return (
    <div className='stock-container' style={{opacity:(cocktail.maxMake<=0&&cocktail.type!=='CUSTOM'?'0.5':'1')}}>
      <div className='cocktail-image-wrapper'>
        <img 
          src={`images/cocktail/${cocktail.img}`} 
          alt={cocktail.name} 
          className='stock-image'
        />
        {cocktail.type==='COCKTAIL'&&cocktail.spirit&&<p className='stock-spirit'>{cocktail.spirit}</p>}
        {cocktail.maxMake>0?<p className='stock-tag' style={{top:'52px'}}>{cocktail.maxMake}</p>:''}
      </div>
      <h3 className='stock-name'>{cocktail.name}</h3>
      <p className='stock-name'>{cocktail.volume}cl - {(cocktail.price).toLocaleString(undefined,{minimumFractionDigits:2})} €</p>
    </div>
  );
};

export default BoCocktail;
