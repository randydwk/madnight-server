import React, { useEffect, useState } from 'react';
import BoCocktail from './BoCocktail';
import BoIngredient from './BoIngredient';
import BoGlass from './BoGlass';
import BoCocktailModal from './BoCocktailModal';
import BoIngredientModal from './BoIngredientModal';
import BoGlassModal from './BoGlassModal';
import '../styles.css';

const Gestion = () => {
  const [cocktails, setCocktails] = useState([]);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [cocktailModalIsOpen, setCocktailModalIsOpen] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientModalIsOpen, setIngredientModalIsOpen] = useState(false);

  const [glasses, setGlasses] = useState([]);
  const [selectedGlass, setSelectedGlass] = useState(null);
  const [glassModalIsOpen, setGlassModalIsOpen] = useState(false);

  function fetchAll() {
    fetch('/cocktail')
      .then((res) => res.json())
      .then((data) => {
        setCocktails(data.sort((a,b) => a.id-b.id));
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });

    fetch('/ingredient')
      .then((res) => res.json())
      .then((data) => {
        setIngredients(data.sort((a,b) => a.name.localeCompare(b.name)));
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });

    fetch('/glass')
      .then((res) => res.json())
      .then((data) => {
        setGlasses(data.sort((a,b) => a.name.localeCompare(b.name)));
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  useEffect(() => {
      fetchAll();
  }, []);

  const openModal = (cocktail) => {
    document.body.classList.add('no-scroll');
    setSelectedCocktail(cocktail);
    setCocktailModalIsOpen(true);
  };

  const closeCocktailModal = () => {
    document.body.classList.remove('no-scroll');
    setCocktailModalIsOpen(false);
    setSelectedCocktail(null);
    fetchAll();
  };

  const openIngredientModal = (ingredient) => {
    document.body.classList.add('no-scroll');
    setSelectedIngredient(ingredient);
    setIngredientModalIsOpen(true);
  };

  const closeIngredientModal = () => {
    document.body.classList.remove('no-scroll');
    setIngredientModalIsOpen(false);
    setSelectedIngredient(null);
    fetchAll();
  };

  const openGlassModal = (glass) => {
    document.body.classList.add('no-scroll');
    setSelectedGlass(glass);
    setGlassModalIsOpen(true);
  };

  const closeGlassModal = () => {
    document.body.classList.remove('no-scroll');
    setGlassModalIsOpen(false);
    setSelectedGlass(null);
    fetchAll();
  };

  return (
    <div>
      <h1>Préparation</h1>
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
                  <BoCocktail
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
                  <BoCocktail 
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
                  <BoCocktail 
                    cocktail={cocktail}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <hr/>

      <h1>Stocks</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {ingredients.length === 0 || glasses.length === 0 ? (
          <i>Chargement...</i>
        ) : (
          <>
            <h2 className='text-hr'><span>Ingrédients</span></h2>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                {ingredients.filter(a => a.liquid).map((ingredient) => (
                  <div
                    key={ingredient.id}
                    onClick={() => openIngredientModal(ingredient)}
                    style={{ cursor: 'pointer' }}
                  >
                    <BoIngredient 
                      name={ingredient.name} 
                      img={ingredient.img} 
                      stock={ingredient.stock}
                      unit={ingredient.unit}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                {ingredients.filter(a => !a.liquid).map((ingredient) => (
                  <div
                    key={ingredient.id}
                    onClick={() => openIngredientModal(ingredient)}
                    style={{ cursor: 'pointer' }}
                  >
                    <BoIngredient 
                      name={ingredient.name} 
                      img={ingredient.img} 
                      stock={ingredient.stock}
                      unit={ingredient.unit}
                    />
                  </div>
                ))}
              </div>
            </div>
            <h2 className='text-hr'><span>Vaisselle</span></h2>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                {glasses.sort((a,b) => b.volume-a.volume).map((glass) => (
                  <div
                    key={glass.id}
                    onClick={() => openGlassModal(glass)}
                    style={{ cursor: 'pointer' }}
                  >
                    <BoGlass
                      name={glass.name} 
                      img={glass.img} 
                      stock={glass.stock}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Modals */}

      <BoCocktailModal
        isOpen={cocktailModalIsOpen}
        onRequestClose={closeCocktailModal}
        cocktail={selectedCocktail}
      />

      <BoIngredientModal
        isOpen={ingredientModalIsOpen}
        onRequestClose={closeIngredientModal}
        ingredient={selectedIngredient}
      />

      <BoGlassModal
        isOpen={glassModalIsOpen}
        onRequestClose={closeGlassModal}
        glass={selectedGlass}
      />

    </div>
  );
};

export default Gestion;
