import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const BoCustomModal = ({ isOpen, onRequestClose }) => {
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState(0);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal text-center"
      overlayClassName="modal-overlay"
    >
        <h2 style={{marginBlockStart:'0'}}>Produit personnalisé</h2>
        <input type="text" placeholder="Nom du produit" value={customName} className='text-input'
          onChange={(e) => setCustomName(e.target.value)}
        ></input><br/>
        <input type="number" placeholder="Prix" value={customPrice} className='text-input'
          onChange={(e) => setCustomPrice(e.target.value)}
        ></input><br/>
        <br/>
        <h3 onClick={() => onRequestClose(customName,customPrice)} className='modal-button btn-success'>Valider le produit</h3>
        <h3 onClick={onRequestClose} className='modal-button btn-info'>Retour</h3>
    </Modal>
  );
};

export default BoCustomModal;
