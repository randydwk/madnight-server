import { Beaker, Martini } from 'lucide-react';
import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const BoCocktailModal = ({ isOpen, onRequestClose, cocktail, onMake }) => {
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

        {cocktail.instructions && <p className='text-center'>{cocktail.instructions}</p>}
          
        <ul style={{lineHeight:'30px',paddingLeft:'20px',listStyleType:'none'}}>
          {cocktail.recipe && cocktail.recipe.sort((a,b) => a.step-b.step).map((ingredient, index) => (
              <li key={index} style={{color:(ingredient.stock<ingredient.quantity?'var(--text-soft)':'var(--text)')}}>
                {ingredient.shaker?<Beaker size={14}/>:<Martini size={14}/>}&nbsp;
                {!ingredient.showclient?'+ ':''}{ingredient.name}
                <b style={{color:'var(--success)'}}> {ingredient.quantity>0 && `${ingredient.quantity}${ingredient.unit?ingredient.unit:''}`} </b>
                {ingredient.proportion && <>({ingredient.proportion})</>}
                {ingredient.stock<ingredient.quantity?<span style={{color:'var(--danger)'}}> [reste {Math.round(ingredient.stock*100)/100+(ingredient.unit?' '+ingredient.unit:'')}]</span>:''}
              </li>
          ))}
        </ul>

        <h3 onClick={() => handleMake(true)} className='modal-button btn-success'>Préparer</h3>
        <h3 onClick={() => handleMake(false)} className='modal-button btn-danger'>Remettre en Stock</h3>
        <h3 onClick={onRequestClose} className='modal-button btn-info'>Retour</h3>
    </Modal>
  );
};

export default BoCocktailModal;
