import React, { useCallback, useEffect, useState } from 'react';
import BoCocktail from './BoCocktail';
import BoIngredient from './BoIngredient';
import BoGlass from './BoGlass';
import BoUser from './BoUser';
import BoCocktailModal from './BoCocktailModal';
import BoIngredientModal from './BoIngredientModal';
import BoGlassModal from './BoGlassModal';
import { Martini, Box, Users, SquareMenu, Trash2, ArrowLeftCircle, Check, Loader } from 'lucide-react';
import '../styles.css';

const Gestion = () => {
  /* VARIABLES */

  const [activePage, setActivePage] = useState("Préparation");

  const pages = [
    { name: "Préparation", icon: <Martini size={24} /> },
    { name: "Stocks", icon: <Box size={24} /> },
    { name: "Utilisateurs", icon: <Users size={24} /> },
    { name: "Carte", icon: <SquareMenu size={24} /> },
  ];

  const [cocktails, setCocktails] = useState([]);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [cocktailModalIsOpen, setCocktailModalIsOpen] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientModalIsOpen, setIngredientModalIsOpen] = useState(false);

  const [glasses, setGlasses] = useState([]);
  const [selectedGlass, setSelectedGlass] = useState(null);
  const [glassModalIsOpen, setGlassModalIsOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [selectUser, setSelectUser] = useState(false);

  /* DATABASE */

  const fetchUsers = useCallback(() => {
    fetch("/user")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const fetchAll = useCallback(() => {
    fetch("/cocktail")
      .then((res) => res.json())
      .then((data) => setCocktails(data.sort((a, b) => a.id - b.id)))
      .catch((error) => console.error("Error fetching cocktails:", error));

    fetch("/ingredient")
      .then((res) => res.json())
      .then((data) => setIngredients(data.sort((a, b) => a.name.localeCompare(b.name))))
      .catch((error) => console.error("Error fetching ingredients:", error));

    fetch("/glass")
      .then((res) => res.json())
      .then((data) => setGlasses(data.sort((a, b) => a.name.localeCompare(b.name))))
      .catch((error) => console.error("Error fetching glasses:", error));

    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const validatePreparation = async () => {
    if (!prepareLoading) {
      setPrepareLoading(true);
      for (let i = 0; i < prepareList.length; i++) {
        try {
          const response = await fetch(`/cocktailmake`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({cocktailId:prepareList[i].cocktail.id,cocktailNb:-1}),
          });
          if (!response.ok) alert('Failed to validate preparation (cocktailmake).');

          const response2 = await fetch(`/newpurchase`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId:prepareList[i].user.id,
              cocktailName:prepareList[i].cocktail.name,
              price:prepareList[i].cocktail.price}),
          });
          if (!response2.ok) alert('Failed to validate preparation (newpurchase).');
        } catch (error) {
          console.error('Error validating preparation:', error);
          alert('Error validating preparation.');
        }
      }
      fetchAll();
      setPrepareList([]);
      setPrepareLoading(false);
    }
  }

  const userToggle = async (user) => {
    try {
      const response = await fetch(`/useractive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId:user.id,active:!user.active}),
      });
      if (!response.ok) alert('Failed to toggle user.');
    } catch (error) {
      console.error('Error toggling user :', error);
      alert('Error toggling user.');
    }
    fetchUsers();
  }

  /* PREPARE LIST */

  const [prepareList, setPrepareList] = useState([]);
  const [prepareLoading, setPrepareLoading] = useState(false);

  const addPrepareCocktail = (cocktail_user) => {
    setPrepareList((prevList) => [...prevList, cocktail_user]);
  }

  const removePrepareCocktail = (cocktail_user_id) => {
    setPrepareList((prevList) => prevList.filter((cocktail_user) => cocktail_user.id!==cocktail_user_id));
  }

  /* MODALES */

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
      {activePage === "Préparation" && <>
        <div className='section-container'>
          <div className='article-column-container' style={{width:"200%"}}>
            {!selectUser ? (
              <>
                {cocktails.length === 0 ? (
                  <i style={{marginTop:'10px'}}>Chargement...</i>
                ) : (
                  <>
                    <h2 className='text-hr'><span>Cocktails</span></h2>
                    <div className='article-row-container'>
                      {cocktails.filter(a => a.type==='COCKTAIL').map((cocktail) => (
                        <div 
                          key={cocktail.id}
                          onClick={() => {
                            setSelectedCocktail(cocktail);
                            setSelectUser(true);
                          }}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            const timer = setTimeout(() => openModal(cocktail),300);
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
                          onClick={() => {
                            setSelectedCocktail(cocktail);
                            setSelectUser(true);
                          }}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            const timer = setTimeout(() => openModal(cocktail),300);
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
                          onClick={() => {
                            setSelectedCocktail(cocktail);
                            setSelectUser(true);
                          }}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            const timer = setTimeout(() => openModal(cocktail),300);
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
              </>
            ) : (
              <>
                <h2 className='text-hr'><span>Pour qui ?</span></h2>
                <div className='article-row-container'>
                <div className='user-container' onClick={() => setSelectUser(false)}>
                  <h3 className='user-name'><ArrowLeftCircle size={40} style={{paddingTop:'8px'}}/></h3>
                </div>
                {users.filter((a) => a.active).map((user) => (
                  <div 
                    key={user.id}
                    onClick={() => {
                      addPrepareCocktail({cocktail:selectedCocktail,user:user,id:selectedCocktail.id.toLocaleString()+Math.floor(Math.random()*100000)});
                      setSelectUser(false);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <BoUser
                      user={user}
                    />
                  </div>
                ))}
              </div>
              </>
            )}
            <div className='toolbar-space'></div>
          </div>
          <div className='article-list-container'>
            <h1>Commande</h1>
            <table>
              <tbody>
                {prepareList.map((cocktail_user) => (
                  <tr>
                    <td style={{textAlign:'left',width:'40%'}}>• {cocktail_user.cocktail.name}</td>
                    <td style={{textAlign:'left',width:'35%'}}>{cocktail_user.user.name}</td>
                    <td style={{textAlign:'right',width:'15%'}}>{(cocktail_user.cocktail.price).toLocaleString(undefined,{minimumFractionDigits:2})} €</td>
                    <td style={{textAlign:'right',width:'10%'}}>
                      <Trash2
                        key={cocktail_user.id}
                        onClick={() => {
                          removePrepareCocktail(cocktail_user.id);
                        }}
                        style={{ cursor: 'pointer', paddingTop:'3px' }}
                        size={20}
                      /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {prepareList.length>0 && <>
              <button className='btn-big-white' disabled={prepareLoading}
                onClick={() => validatePreparation()}
              >
                {prepareLoading?(
                  <><Loader size={20}/> Valider la préparation</>
                ):(
                  <><Check size={20}/> Valider la préparation</>
                )}
              </button>
            </>}
            <div className='toolbar-space'></div>
          </div>
        </div>
      </>}
        
      {activePage === "Stocks" && <>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {ingredients.length === 0 || glasses.length === 0 ? (
            <i style={{marginTop:'10px'}}>Chargement...</i>
          ) : (
            <>
              <h2 className='text-hr'><span>Ingrédients</span></h2>
              {['ALCOOL','SOFT','SOLID','BIERE'].map((type) => (
                <div className='article-row-container'>
                  {ingredients.filter(a => a.type===type).map((ingredient) => (
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
              ))}
              <h2 className='text-hr'><span>Vaisselle</span></h2>
              <div className='article-row-container'>
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
            </>
          )}
        </div>
        <div className='toolbar-space'></div>
      </>}

      {activePage === "Utilisateurs" && <>
        <h1>Utilisateurs</h1>
        {users.sort((a,b) => {
          if (b.active !== a.active) return b.active - a.active;
          return a.name.localeCompare(b.name);
        }).map((user) => (
          <>
            <div className='user-list'>
              <input type='checkbox' checked={user.active} className='toggleswitch'
                onClick={() =>userToggle(user)}
              
              ></input>
              <span>{user.name}</span>
            </div>
          </>
        ))}
        <div className='toolbar-space'></div>
      </>}

      {activePage === "Carte" && <>
        <h1>Carte</h1>
      </>}
      
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
