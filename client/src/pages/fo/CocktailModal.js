import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const CocktailModal = ({ isOpen, onRequestClose, cocktail }) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Cocktail Details"
      className="modal text-center"
      overlayClassName="modal-overlay"
    >
        <h2 className='text-center' style={{marginBlockStart:'0'}}>{cocktail.name}</h2>

        {cocktail.maxMake>0?'':<p style={{color:'var(--danger)'}}>Rupture de stock</p>}

        {cocktail.recipe && cocktail.recipe.sort((a,b) => a.step-b.step).map((ingredient, index) => (
          ingredient.showclient && <p className='text-center' style={{margin:'5px'}} key={index}>{ingredient.name}</p>
        ))}
        <br/>
        <h3 onClick={onRequestClose} className='modal-button btn-info'>Retour</h3>
    </Modal>
  );
};

export default CocktailModal;
