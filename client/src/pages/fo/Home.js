import React, { useEffect, useState } from 'react';
import { drinks, spiritueux } from '../data/data';
import Cocktail from './Cocktail';
import CocktailModal from './CocktailModal';
import '../styles.css';
import { X } from 'lucide-react';

const Home = () => {

  /* VARIABLES */

  const [activePage, setActivePage] = useState("Cocktails");
  const [filters, setFilters] = useState(spiritueux);
  const [cocktails, setCocktails] = useState([]);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  /* DATABASE */

  useEffect(() => {
    fetch('/cocktail')
      .then((res) => res.json())
      .then((data) => {
        setCocktails(data.sort((a,b) => a.menu_order-b.menu_order));
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  /* MODALES */

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
      <div className='text-center' style={{paddingTop:'10px',backgroundColor:'black'}}
        onPointerDown={(e) => {
          e.preventDefault();
          const timer = setTimeout(() => <Redirect to="/gestion"/>,10000);
          const cancelPress = () => {
            clearTimeout(timer);
            document.removeEventListener("pointerup", cancelPress);
            document.removeEventListener("pointerleave", cancelPress);
            document.removeEventListener("touchend", cancelPress);
          };
          document.addEventListener("pointerup", cancelPress);
          document.addEventListener("pointerleave", cancelPress);
          document.addEventListener("touchend", cancelPress);
        }}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      >
        <img src={`images/madnight_logo.png`} alt="Logo" style={{width:'200px'}}/>
      </div>
      <div className='article-column-container'>
        {cocktails.length === 0 ? (
          <i>Chargement...</i>
        ) : (
          <>
            {drinks.map((drink) => activePage === drink.title && <>
                <h2 className='text-hr'><span>{drink.title}</span></h2>

                {drink.type === "COCKTAIL" &&
                  <div className='filter-container fo'>
                    {filters.map((filter,index) => (
                      cocktails.filter(c => c.active&&filter.spirits.includes(c.spirit)).length>0&&
                      <div className={`filter-element ${filter.active ? 'active' : ''}`}
                        onClick={() => setFilters(filters.map((filter,i) =>
                          i === index ? { ...filter, active: !filter.active } : filter
                        ))}
                      >{filter.title}</div>
                    ))}
                    <div className='filter-cross'
                      onClick={() => setFilters(filters.map((filter) => ({...filter, active: false})))}
                    ><X/></div>
                  </div>
                }

                <div className='article-row-container fo'>
                  {cocktails.filter(a => a.type===drink.type && a.active
                  && (a.type!=='COCKTAIL' || filters.filter(b => b.active).map(b => b.spirits).flat().includes(a.spirit))
                  ).sort((a,b) => {
                    if (a.maxMake === 0 && b.maxMake !== 0) return 1;
                    if (a.maxMake !== 0 && b.maxMake === 0) return -1;
                    return a.menu_order-b.menu_order;
                  }).map((cocktail) => (
                    <div 
                      key={cocktail.id}
                      onClick={() => openModal(cocktail)}
                    >
                      <Cocktail 
                        cocktail={cocktail}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <p className='text-center' style={{color:'var(--text-soft)!important',textDecoration:'none'}}>
        ©&nbsp;MAD•NIGHT by Maddy 2025
      </p>
      <div className='toolbar-space'></div>

      <div className="bottom-toolbar">
        {drinks.map((drink) => (drink.type!=='CUSTOM' && cocktails.filter((a) => a.active&&a.maxMake>0&&a.type===drink.type).length>0 &&
          <button
            key={drink.title}
            onClick={() => setActivePage(drink.title)}
            className={`toolbar-button ${activePage === drink.title ? "active" : ""}`}
          >
            {drink.icon}
            <span style={{paddingTop:"5px"}}>{drink.title}</span>
          </button>
        ))}
      </div>

      {/* Modals */}

      <CocktailModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        cocktail={selectedCocktail}
      />
    </div>
  );
};

export default Home;
