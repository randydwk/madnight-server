import React, { useCallback, useEffect, useState } from 'react';
import BoCocktail from './BoCocktail';
import BoIngredient from './BoIngredient';
import BoUser from './BoUser';
import BoCocktailModal from './BoCocktailModal';
import BoIngredientModal from './BoIngredientModal';
import BoUserModal from './BoUserModal';
import { Martini, Box, Users, SquareMenu, Trash2, ArrowLeftCircle, Check, Loader, PlusCircle } from 'lucide-react';
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

  const [userModalIsOpen, setUserModalIsOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [selectUser, setSelectUser] = useState(false);
  const [openedUser, setOpenedUser] = useState(-1);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

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

  const purchaseRefundToggle = async (purchase) => {
    try {
      const response = await fetch(`/purchaserefund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({purchaseId:purchase.id,refunded:!purchase.refunded}),
      });
      if (!response.ok) alert('Failed to refund purchase.');
    } catch (error) {
      console.error('Error refunding purchase :', error);
      alert('Error refunding purchase.');
    }
    fetchUsers();
  }

  const handleDeleteUser = async (user) => {
    try {
      const response = await fetch(`/deleteuser`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId:user.id}),
      });
      if (!response.ok) alert('Impossible de supprimer l\'utilisateur.');
    } catch (error) {
      console.error('Error deleting user :', error);
      alert('Error deleting user.');
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

  const openCocktailModal = (cocktail) => {
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

  const openUserModal = () => {
    document.body.classList.add('no-scroll');
    setUserModalIsOpen(true);
  };

  const closeUserModal = () => {
    document.body.classList.remove('no-scroll');
    setUserModalIsOpen(false);
    fetchUsers();
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
                            const timer = setTimeout(() => openCocktailModal(cocktail),300);
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
                            const timer = setTimeout(() => openCocktailModal(cocktail),300);
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
                            const timer = setTimeout(() => openCocktailModal(cocktail),300);
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
              <button className='btn-big' disabled={prepareLoading}
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
          {ingredients.length === 0 ? (
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
            </>
          )}
        </div>
        <div className='toolbar-space'></div>
      </>}

      {activePage === "Utilisateurs" && <>
        <div className='article-column-container'>
          <h2 className='text-hr'><span>Utilisateurs</span></h2>
        </div>
        <button className='btn-success'
          onClick={() => openUserModal()}
        ><PlusCircle size={20}/> Créer un utilisateur</button>
        {users.sort((a,b) => {
          if (b.active !== a.active) return b.active - a.active;
          return a.name.localeCompare(b.name);
        }).map((user) => {
          const reste = user.purchases.reduce((acc, item) => {
            return !item.refunded ? acc + item.price : acc;
          }, 0);
          
          return (
          <>
            <div className='user-list'>
              <div style={{marginBottom:'-4px'}}>
                <input type='checkbox' checked={user.active} className='toggleswitch'
                  onClick={() => userToggle(user)}
                ></input>
              </div>
              <div
                onClick={() => {
                  if (openedUser === user.id) setOpenedUser(-1);
                  else setOpenedUser(user.id);
                }}
                style={{cursor:'pointer',marginLeft:'10px',width:'100%'}}
              >
                {user.name}
                {reste>0 && <span style={{color:'var(--danger)'}}>&nbsp;&nbsp;({reste.toLocaleString(undefined,{minimumFractionDigits:2})} €)</span>}
              </div>
            </div>
            <div className={'user-list-infos'+(openedUser===user.id?' opened':'')}>
              {user.purchases.length > 0 && <>
                <div style={{margin:'10px 0 5px 12px'}}>
                  Reste à payer :&nbsp;
                  {reste.toLocaleString(undefined,{minimumFractionDigits:2})} €
                </div>
                <div style={{margin:'5px 0 0 12px'}}>
                  Total :&nbsp;
                  {user.purchases.reduce((acc,purchase) => acc + purchase.price,0).toLocaleString(undefined,{minimumFractionDigits:2})} €
                </div>
                <table style={{margin:'10px',width:'530px'}}>
                  <tbody>
                    {user.purchases.sort((a,b) => new Date(b.date) - new Date(a.date)).map((purchase) => (
                      <tr className={purchase.refunded?'user-purchase-refunded':''}>
                        <td style={{paddingBottom:'6px',textAlign:'left',width:'140px'}}>{formatDateTime(purchase.date)}</td>
                        <td style={{paddingBottom:'6px',textAlign:'left',width:'250px'}}>• {purchase.cocktail_name}</td>
                        <td style={{paddingBottom:'6px',textAlign:'right',width:'60px'}}>{(purchase.price).toLocaleString(undefined,{minimumFractionDigits:2})} €</td>
                        <td style={{textAlign:'right',width:'80px'}}>
                          <input type='checkbox' checked={purchase.refunded} className='toggleswitch'
                            onClick={() => purchaseRefundToggle(purchase)}
                          ></input>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>}
              <button className='btn-danger'
                onClick={() => {
                  if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
                    handleDeleteUser(user);
                  }
                }}
              ><Trash2 size={20}/> Supprimer l'utilisateur</button>
            </div>
          </>
        )})}
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

      <BoUserModal
        isOpen={userModalIsOpen}
        onRequestClose={closeUserModal}
      />

    </div>
  );
};

export default Gestion;
