import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const BoGlassModal = ({ isOpen, onRequestClose, glass }) => {
  const handleReload = async (add) => {
    try {
      const response = await fetch(`/glassreload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ glassId:glass.id, quantity: (add?1:-1) }),
      });

      if (response.ok) {
        onRequestClose();
      } else {
        alert(`Impossible ${add?`d'ajouter`:'de retirer'} un verre. ${glass.stock===0?'Le stock est déjà vide.':''}`);
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
        <h2 style={{marginBlockStart:'0'}}>Verre {glass.name} ({glass.volume}cl)</h2>
        <p>En stock : {glass.stock}</p>

        <h3 onClick={()=>handleReload(true)} className='modal-button btn-success'>Ajouter 1</h3>
        <h3 onClick={()=>handleReload(false)} className='modal-button btn-danger'>Retirer 1</h3>
        <h3 onClick={onRequestClose} className='modal-button btn-info'>Retour</h3>
    </Modal>
  );
};

export default BoGlassModal;
