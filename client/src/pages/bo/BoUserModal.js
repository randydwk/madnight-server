import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const BoUserModal = ({ isOpen, onRequestClose }) => {
  const [username, setUsername] = useState("");

  const handleNewUser = async (username) => {
    console.log(username);
    try {
      const response = await fetch(`/newuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username:username }),
      });

      if (response.ok) {
        onRequestClose();
      } else {
        alert(`Impossible de créer un utilisateur. Ce nom est peut-être déjà utilisé.`);
      }
    } catch (error) {
      console.error('Error creating user :', error);
      alert('Error creating user.');
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
        <h2 style={{marginBlockStart:'0'}}>Créer un utilisateur</h2>
        <input type="text" placeholder="Nom d'utilisateur" className='modal-button'
          onChange={(e) => setUsername(e.target.value)}
        ></input><br/>
        <br/>
        <h3 onClick={() => handleNewUser(username)} className='modal-button btn-success'>Créer l'utilisateur</h3>
        <h3 onClick={onRequestClose} className='modal-button btn-info'>Retour</h3>
    </Modal>
  );
};

export default BoUserModal;
