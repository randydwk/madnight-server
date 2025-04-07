import React from 'react';

const BoCocktailFo = ({ cocktail }) => {
  return (
    <div className='cocktail-container'>
      <div className="cocktail-image-wrapper">
        <img 
          src={`images/cocktail/${cocktail.img}`} 
          alt={cocktail.name} 
          className='cocktail-image' 
        />
        {cocktail.spirit&&<p className='cocktail-spirit'>{cocktail.spirit}</p>}
      </div>
      <h3 className='cocktail-name'>{cocktail.name}</h3>
      <p className='cocktail-name'>{(cocktail.price).toLocaleString(undefined,{minimumFractionDigits:2})} €</p>
    </div>
  );
};

export default BoCocktailFo;
