import React, { useEffect, useState } from 'react';
import Cocktail from './Cocktail';
import CocktailModal from './CocktailModal';
import '../styles.css';

const Home = () => {
  const [cocktails, setCocktails] = useState([]);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetch('/cocktail')
      .then((res) => res.json())
      .then((data) => {
        setCocktails(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const openModal = (cocktail) => {
    document.body.classList.add('no-scroll');
    setSelectedCocktail(cocktail);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    document.body.classList.remove('no-scroll');
    setModalIsOpen(false);
    setSelectedCocktail(null);
  };

  return (
    <div>
      <div className='text-center' style={{padding:'10px',backgroundColor:'white',borderBottom:'solid 3px var(--resalib)'}}>
        <img src={`images/cocktalib.png`} alt="Cocktalib Logo" />
      </div>
      <h1>À la carte</h1>
      <div className='article-column-container'>
        {cocktails.length === 0 ? (
          <i>Chargement...</i>
        ) : (
          <>
            <h2 className='text-hr'><span>Cocktails</span></h2>
            <div className='article-row-container'>
              {cocktails.filter(a => a.type==='COCKTAIL').map((cocktail) => (
                <div 
                  key={cocktail.id}
                  onClick={() => openModal(cocktail)}
                  style={{ cursor: 'pointer' }}
                >
                  <Cocktail 
                    cocktail={cocktail}
                  />
                </div>
              ))}
            </div>
            <h2 className='text-hr'><span>Shooters</span></h2>
            <div className='article-row-container'>
              {cocktails.filter(a => a.type==='SHOOTER').map((cocktail) => (
                <div 
                  key={cocktail.id}
                  onClick={() => openModal(cocktail)}
                  style={{ cursor: 'pointer' }}
                >
                  <Cocktail 
                    cocktail={cocktail}
                  />
                </div>
              ))}
            </div>
            <h2 className='text-hr'><span>Bière</span></h2>
            <div className='article-row-container'>
              {cocktails.filter(a => a.type==='BEER').map((cocktail) => (
                <div 
                  key={cocktail.id}
                  onClick={() => openModal(cocktail)}
                  style={{ cursor: 'pointer' }}
                >
                  <Cocktail 
                    cocktail={cocktail}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <p className='text-center'><i>Cliquez sur une boisson pour voir sa composition</i></p>
      <p className='text-center' style={{color:'var(--text-soft)!important',textDecoration:'none'}}>
        <a href="/gestion" style={{color:'var(--text-soft)!important',textDecoration:'none'}}>©</a>
        &nbsp;Cocktalib 2024
      </p>

      <CocktailModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        cocktail={selectedCocktail}
      />
    </div>
  );
};

export default Home;
