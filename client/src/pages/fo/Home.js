import React, { useEffect, useState } from 'react';
import Cocktail from './Cocktail';
import CocktailModal from './CocktailModal';
import '../styles.css';
import { Beer, GlassWater, Martini, X } from 'lucide-react';

const Home = () => {

  /* VARIABLES */

  const [activePage, setActivePage] = useState("Cocktails");

  const pages = [
    { name: "Cocktails", keyword: 'COCKTAIL', icon: <Martini size={24} /> },
    { name: "Shooters", keyword: 'SHOOTER', icon: <GlassWater size={24} /> },
    { name: "Bières", keyword: 'BEER', icon: <Beer size={24} /> }
  ];

  const [filters, setFilters] = useState([
    { name: "Vodka", spirits: ["Vodka"], active: true },
    { name: "Rhum", spirits: ["Rhum","Cachaça"], active: true },
    { name: "Tequila", spirits: ["Tequila"], active: true },
    { name: "Gin", spirits: ["Gin"], active: true },
    { name: "Whisky", spirits: ["Whisky"], active: true },
    { name: "Brandy", spirits: ["Brandy"], active: true },
    { name: "Sans alcool", spirits: ["Sans alcool"], active: true }
  ]);

  const [cocktails, setCocktails] = useState([]);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  /* DATABASE */

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
      <div className='text-center' style={{paddingTop:'10px',backgroundColor:'black'}}>
        <img src={`images/madnight_logo.png`} alt="Logo" style={{width:'200px'}}/>
      </div>
      <div className='article-column-container'>
        {cocktails.length === 0 ? (
          <i>Chargement...</i>
        ) : (
          <>
            {pages.map((page) => activePage === page.name && <>
                <h2 className='text-hr'><span>{page.name}</span></h2>

                {page.keyword === "COCKTAIL" &&
                  <div className='filter-container fo'>
                    {filters.map((filter,index) => (
                      <div className={`filter-element ${filter.active ? 'active' : ''}`}
                        onClick={() => setFilters(filters.map((filter,i) =>
                          i === index ? { ...filter, active: !filter.active } : filter
                        ))}
                      >{filter.name}</div>
                    ))}
                    <div className='filter-cross'
                      onClick={() => setFilters(filters.map((filter) => ({...filter, active: false})))}
                    ><X/></div>
                  </div>
                }

                <div className='article-row-container fo'>
                  {cocktails.filter(a => a.type===page.keyword && a.active
                  && (a.type!=='COCKTAIL' || filters.filter(b => b.active).map(b => b.spirits).flat().includes(a.spirit))
                  ).sort((a,b) => a.menu_order-b.menu_order).map((cocktail) => (
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
        <a href="/gestion" style={{color:'var(--text-soft)!important',textDecoration:'none'}}>©</a>
        &nbsp;MAD•NIGHT by Maddy 2025
      </p>
      <div className='toolbar-space'></div>

      <div className="bottom-toolbar">
        {pages.map((page) => (cocktails.filter((a) => a.active&&a.type===page.keyword).length>0 &&
          <button
            key={page.name}
            onClick={() => setActivePage(page.name)}
            className={`toolbar-button ${activePage === page.name ? "active" : ""}`}
          >
            {page.icon}
            <span style={{paddingTop:"5px"}}>{page.name}</span>
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
