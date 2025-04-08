import React from 'react';

const Cocktail = ({ cocktail }) => {
  return (
    <div className='cocktail-container' style={{opacity:(!cocktail.maxMake>0&&cocktail.type!=='CUSTOM'?'0.5':'1')}}>
      <div className="cocktail-image-wrapper">
        <img 
          src={`images/cocktail/${cocktail.img}`} 
          alt={cocktail.name} 
          className='cocktail-image' 
        />
        {cocktail.spirit&&<p className='cocktail-spirit'>{cocktail.spirit}</p>}
      </div>
      <h3 className='cocktail-name'>{cocktail.name}</h3>
      <p className='cocktail-name'>
        {cocktail.maxMake>0?<>{(cocktail.price).toLocaleString(undefined,{minimumFractionDigits:2})} € ({cocktail.volume}cl)</>:
        <span style={{color:'var(--danger)'}}>Rupture de stock</span>}
      </p>
    </div>
  );
};

export default Cocktail;
