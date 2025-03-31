import React, { useEffect, useState } from 'react';
import Cocktail from './Cocktail';
import CocktailModal from './CocktailModal';
import '../styles.css';
import { Beer, GlassWater, Martini, X } from 'lucide-react';

const Home = () => {

  /* VARIABLES */

  const [activePage, setActivePage] = useState("Cocktails");

  const pages = [
    { name: "Cocktails", icon: <Martini size={24} /> },
    { name: "Shooters", icon: <GlassWater size={24} /> },
    { name: "Bières", icon: <Beer size={24} /> }
  ];

  const [filters, setFilters] = useState([
    { name: "Cachaça", active: true },
    { name: "Rhum", active: true },
    { name: "Tequila", active: true },
    { name: "Vodka", active: true },
    { name: "Sans alcool", active: true }
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
            {activePage === "Cocktails" && <>
              <h2 className='text-hr'><span>Cocktails</span></h2>
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
              <div className='article-row-container fo'>
                {cocktails.filter(a =>
                  a.type==='COCKTAIL' &&
                  filters.filter(b => b.active).map(b => b.name).includes(a.spirit))
                .sort((a,b) => a.menu_order-b.menu_order).map((cocktail) => (
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
            </>}
            {activePage === "Shooters" && <>
              <h2 className='text-hr'><span>Shooters</span></h2>
              <div className='article-row-container fo'>
                {cocktails.filter(a => a.type==='SHOOTER').sort((a,b) => a.menu_order-b.menu_order).map((cocktail) => (
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
            </>}
            {activePage === "Bières" && <>
              <h2 className='text-hr'><span>Bières</span></h2>
              <div className='article-row-container fo'>
                {cocktails.filter(a => a.type==='BEER').sort((a,b) => a.menu_order-b.menu_order).map((cocktail) => (
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
            </>}
          </>
        )}
      </div>
      <p className='text-center' style={{color:'var(--text-soft)!important',textDecoration:'none'}}>
        <a href="/gestion" style={{color:'var(--text-soft)!important',textDecoration:'none'}}>©</a>
        &nbsp;MAD•NIGHT by Maddy 2025
      </p>
      <div className='toolbar-space'></div>

      <div className="bottom-toolbar">
        {pages.map((page) => (
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
