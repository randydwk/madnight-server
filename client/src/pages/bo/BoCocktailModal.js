import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const BoCocktailModal = ({ isOpen, onRequestClose, cocktail, onMake }) => {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    if (cocktail) {
      console.log(cocktail.id);
      fetch(`/cocktail/${cocktail.id}`)
        .then((res) => res.json())
        .then((data) => {
          setIngredients(data.ingredients);
        })
        .catch((error) => {
          console.error('Error fetching cocktail details:', error);
        });
    }
  }, [cocktail]);

  const handleMake = async (make) => {
    try {
      const response = await fetch(`/cocktailmake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cocktailId:cocktail.id, cocktailNb: (make?-1:1) }),
      });

      if (response.ok) {
        onRequestClose();
      } else {
        alert('Failed to make cocktail.');
      }
    } catch (error) {
      console.error('Error making cocktail:', error);
      alert('Error making cocktail.');
    }
  };

  if (!cocktail) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
        <h2 className='text-center' style={{marginBlockStart:'0'}}>{cocktail.name}</h2>

        {cocktail.maxMake>0?<p className='text-center'>{cocktail.maxMake} restant{cocktail.maxMake>1?'s':''}</p>:
        <p className='text-center' style={{color:'var(--danger)'}}>Rupture de stock</p>}

        <ul style={{lineHeight:'22px'}}>
          <li>Verre {cocktail.glass}</li>
          {cocktail.instructions ? <li>{cocktail.instructions}</li>:''}
          <br/>
          
          {ingredients?ingredients.sort((a,b) => a.step-b.step).map((ingredient, index) => (
              <li key={index} style={{color:(ingredient.stock<ingredient.quantity?'var(--text-soft)':'var(--text)')}}>
                <b>{!ingredient.showclient?'+ ':''}{ingredient.name}</b> : {ingredient.proportion}
                {ingredient.stock<ingredient.quantity?<span style={{color:'var(--danger)'}}> [reste {Math.round(ingredient.stock*100)/100+(ingredient.unit?' '+ingredient.unit:'')}]</span>:''}
              </li>
          )):''}
        </ul>

        <h3 onClick={() => handleMake(true)} className='modal-button btn-success'>Préparer</h3>
        <h3 onClick={() => handleMake(false)} className='modal-button btn-danger'>Remettre en Stock</h3>
        <h3 onClick={onRequestClose} className='modal-button btn-info'>Retour</h3>
    </Modal>
  );
};

export default BoCocktailModal;
