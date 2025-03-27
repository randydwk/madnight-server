import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const CocktailModal = ({ isOpen, onRequestClose, cocktail }) => {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    if (cocktail) {
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

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {setIngredients([]); onRequestClose()}}
      contentLabel="Cocktail Details"
      className="modal text-center"
      overlayClassName="modal-overlay"
    >
        <h2 className='text-center' style={{marginBlockStart:'0'}}>{cocktail.name}</h2>

        {cocktail.maxMake>0?'':<p style={{color:'var(--danger)'}}>Rupture de stock</p>}

        {ingredients.length === 0 ? (
            <i>Chargement...</i>
          ) : (
          ingredients.sort((a,b) => a.step-b.step).map((ingredient, index) => (
              ingredient.showclient?<p className='text-center' style={{margin:'5px'}} key={index}>{ingredient.name}</p>:''
          ))
        )}

        <h3 onClick={() => {setIngredients([]); onRequestClose()}} className='modal-button btn-info'>Retour</h3>
    </Modal>
  );
};

export default CocktailModal;
