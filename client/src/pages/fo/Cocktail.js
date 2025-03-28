import React from 'react';

const Cocktail = ({ cocktail }) => {
  return (
    <div className='cocktail-container' style={{opacity:(!cocktail.maxMake>0?'0.5':'1')}}>
      <div className="cocktail-image-wrapper">
        <img 
          src={`images/cocktail${cocktail.type === 'BEER' ? '/beer' : (cocktail.type === 'SHOOTER' ? '/shooter' : '')}/${cocktail.img}`} 
          alt={cocktail.name} 
          className='cocktail-image' 
        />
        {cocktail.spirit&&<p className='cocktail-spirit'>{cocktail.spirit}</p>}
      </div>
      <h3 className='cocktail-name'>{cocktail.name}</h3>
    </div>
  );
};

export default Cocktail;
