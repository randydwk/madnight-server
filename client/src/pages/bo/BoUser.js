import React from 'react';

const BoUser = ({ user }) => {
  return (
    <div className='user-container'>
      <h3 className='user-name'>{user.name}</h3>
    </div>
  );
};

export default BoUser;
