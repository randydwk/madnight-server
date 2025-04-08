import { MinusCircle, PlusCircle, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const BoStockModal = ({ isOpen, onRequestClose, ingredient }) => {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(ingredient?ingredient.price:0);

  useEffect(() => {setPrice(ingredient?ingredient.price:0)},[ingredient]);

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

  const handlePrice = async() => {
    try {
      const response = await fetch(`/ingredientprice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredientId:ingredient.id, price: parseFloat(price) }),
      });

      if (response.ok) {
        onRequestClose();
      } else {
        alert('Failed to save price.');
      }
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Error saving price.');
    }
  }

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
          className='text-input'
          min="0"
        />
        <h3 onClick={()=>handleReload(true)} style={{marginTop:0}} className='modal-button btn-success'><PlusCircle/> Ajouter</h3>
        <h3 onClick={()=>handleReload(false)} className='modal-button btn-danger'><MinusCircle/> Retirer</h3>
        <br/>
        <input
          type="number"
          value={price  }
          step='0.01'
          onChange={(e) => {e.target.value=Math.max(Math.min(e.target.value,100000),0);setPrice(e.target.value)}}
          placeholder="Prix"
          className='text-input'
          min="0"
        />
        <h3 onClick={()=>handlePrice()} style={{marginTop:0}} className='modal-button btn-success'><Save/> Enregistrer</h3>
        <br/>
        <h3 onClick={onRequestClose} className='modal-button btn-info'>Retour</h3>
    </Modal>
  );
};

export default BoStockModal;
