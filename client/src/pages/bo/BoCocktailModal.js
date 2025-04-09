import { Beaker, Inbox, Martini, Minus, Plus, TriangleAlert } from 'lucide-react';
import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const BoCocktailModal = ({ isOpen, onRequestClose, cocktail, onMake }) => {
  const [factor, setFactor] = useState(1);
  const [showStock, setShowStock] = useState(false);

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

        <div style={{margin:'0 20px',display:'flex',justifyContent:'space-between'}}>
          <div style={{display:'flex'}}>
            <button className="btn-info" style={{margin:'0',marginBottom:'0',height:'28px'}}
              onClick={() => {if (factor>1) setFactor(factor-1)}}>
            <Minus size={20} /></button>
            <div style={{margin:'0',background:'var(--info)',height:'28px',boxSizing:'border-box',fontSize:'0.8em',textAlign:'center',width:'30px',paddingTop:'3px',borderTop:'1px solid white',borderBottom:'1px solid white'}} >x{factor}</div>
            <button className="btn-info" style={{margin:'0',marginBottom:'0',height:'28px'}}
              onClick={() => {if (factor<10) setFactor(factor+1)}}>
            <Plus size={20} /></button>
          </div>

          <div style={{display:'flex',color:(cocktail.maxMake===0?'var(--danger)':'var(--text)')}}>
            <div style={{marginTop:'3px'}}>{cocktail.maxMake===0?'Rupture':cocktail.maxMake}</div>
            <Inbox size={20} style={{margin:'4px 5px 0 4px'}}/>
            <input type='checkbox' className='toggleswitch' checked={showStock} onChange={(e) => setShowStock(e.target.checked)} style={{margin:0}}/>
          </div>
        </div>

        {cocktail.instructions && <p className='text-center'>{cocktail.instructions}</p>}

        <ul style={{lineHeight:'30px',paddingLeft:'20px',listStyleType:'none'}}>
          {cocktail.recipe && cocktail.recipe.sort((a,b) => a.step-b.step).map((ingredient, index) => (
              <li key={index} style={{color:(ingredient.stock<ingredient.quantity?'var(--danger)':'var(--text)')}}>
                {ingredient.shaker?<Beaker size={16} style={{verticalAlign:'middle',position:'relative',top:'-2px'}}/>:
                                  <Martini size={16} style={{verticalAlign:'middle',position:'relative',top:'-2px'}}/>}&nbsp;
                {!ingredient.showclient?'+ ':''}{ingredient.name}
                <b style={{color:'var(--success)'}}> {ingredient.quantity>0 && `${ingredient.quantity*factor}${ingredient.unit?ingredient.unit:''}`} </b>
                {ingredient.proportion && <>({ingredient.proportion})</>}
                {(ingredient.stock<ingredient.quantity||showStock)&&<span style={{color:'var(--danger)'}}> ({Math.round(ingredient.stock*100)/100+(ingredient.unit?' '+ingredient.unit:'')})
                  {Math.floor(ingredient.stock/ingredient.quantity)===cocktail.maxMake&&<TriangleAlert size={20} style={{verticalAlign:'middle',position:'relative',top:'-1px',left:'5px'}}/>}
                </span>}
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
