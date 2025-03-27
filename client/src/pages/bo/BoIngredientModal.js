import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const BoIngredientModal = ({ isOpen, onRequestClose, ingredient }) => {
  const [quantity, setQuantity] = useState('');

  const handleReload = async (add) => {
    try {
      const response = await fetch(`/ingredientreload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredientId:ingredient.id, quantity: parseFloat(quantity*(add?1:-1)) }),
      });

      if (response.ok) {
        onRequestClose();
      } else {
        alert('Failed to reload stock.');
      }
    } catch (error) {
      console.error('Error reloading stock:', error);
      alert('Error reloading stock.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal text-center"
      overlayClassName="modal-overlay"
    >
        <h2 style={{marginBlockStart:'0'}}>{ingredient.name}</h2>
        <p>En stock : {Math.floor(ingredient.stock*100)/100}{ingredient.unit?' '+ingredient.unit:''}</p>

        <input
          type="number"
          value={quantity}
          onChange={(e) => {e.target.value=Math.max(Math.min(e.target.value,100000),0);setQuantity(e.target.value)}}
          placeholder="Quantité"
          className='modal-input'
          min="0"
        />

        <h3 onClick={()=>handleReload(true)} className='modal-button btn-success'>Ajouter</h3>
        <h3 onClick={()=>handleReload(false)} className='modal-button btn-danger'>Retirer</h3>
        <h3 onClick={onRequestClose} className='modal-button btn-info'>Retour</h3>
    </Modal>
  );
};

export default BoIngredientModal;
