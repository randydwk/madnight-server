import React from 'react';

const BoCocktail = ({ cocktail }) => {
  return (
    <div className='stock-container' style={{opacity:(!cocktail.maxMake>0?'0.5':'1')}}>
      <div className='cocktail-image-wrapper'>
        <img 
          src={`images/cocktail${cocktail.type==='BEER'?'/beer':(cocktail.type==='SHOOTER'?'/shooter':'')}/${cocktail.img}`} 
          alt={cocktail.name} 
          className='stock-image'
        />
        {cocktail.spirit&&<p className='cocktail-spirit'>{cocktail.spirit}</p>}
        {cocktail.maxMake>0?<p className='stock-tag' style={{top:'37px'}}>{cocktail.maxMake}</p>:''}
        {cocktail.nbmade!=null?<p className='stock-tag' style={{top:'72px'}}>{cocktail.nbmade}</p>:''}
      </div>
      <h3 className='stock-name'>{cocktail.name}</h3>
    </div>
  );
};

export default BoCocktail;
