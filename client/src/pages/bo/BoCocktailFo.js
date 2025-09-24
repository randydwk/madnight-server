import React from 'react';

const BoCocktailFo = ({ cocktail, ingredients }) => {
  const productionPrice = () => {
    let price = 0;
    for (const r of cocktail.recipe) {
      const ing = ingredients.find(i => i.id===r.ingredient_id);
      const ing_price = ing.unit==='cl'?ing.price/100:(ing.unit==='g'?ing.price/1000:ing.price);
      price += r.quantity * ing_price;
    }
    return Math.floor(price*100)/100;
  }

  return (
    <div className='cocktail-container' style={{width:'150px'}}>
      <div className="cocktail-image-wrapper">
        <img 
          src={`${cocktail.img}`} 
          alt={cocktail.name} 
          className='cocktail-image' 
        />
        {cocktail.type==='COCKTAIL'&&cocktail.spirit&&<p className='cocktail-spirit'>{cocktail.spirit}</p>}
        {<p className='stock-tag' style={{left:'5px'}}>{cocktail.menu_order}</p>}
      </div>
      <h3 className='cocktail-name'>{cocktail.name}</h3>
      <p className='cocktail-name'>
        <span></span>
        <span>{cocktail.price.toLocaleString(undefined,{minimumFractionDigits:2})} € </span>
        <span style={{color:'var(--text-soft)'}}> / {productionPrice().toLocaleString(undefined,{minimumFractionDigits:2})} €</span>
        <span> ({cocktail.volume} cl)</span>
      </p>
    </div>
  );
};

export default BoCocktailFo;
