import React, { useCallback, useEffect, useState } from 'react';
import { drinks, stock_types, spiritueux } from '../data/data';
import BoCocktail from './BoCocktail';
import BoStock from './BoStock';
import BoUser from './BoUser';
import BoCocktailModal from './BoCocktailModal';
import BoStockModal from './BoStockModal';
import BoCustomModal from './BoCustomModal';
import BoUserModal from './BoUserModal';
import { Trash2, ArrowLeftCircle, Check, Loader, PlusCircle, X, Martini, Box, Users, ScrollText, ReceiptText, ChartNoAxesCombined, ArrowBigLeft, ArrowBigRight } from 'lucide-react';
import '../styles.css';
import CocktailEditor from './CocktailEditor';
import BoCocktailFo from './BoCocktailFo';

const Gestion = () => {

  /* VARIABLES */

  const [activePage, setActivePage] = useState("Préparation");

  const pages = [
    { name: "Préparation", icon: <Martini size={24} /> },
    { name: "Stocks", icon: <Box size={24} /> },
    { name: "Carte", icon: <ScrollText size={24} /> },
    { name: "Utilisateurs", icon: <Users size={24} /> },
    { name: "Commandes", icon: <ReceiptText size={24} /> }
  ];

  const [filters, setFilters] = useState(spiritueux);

  const [cocktails, setCocktails] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [selectUser, setSelectUser] = useState(false);
  const [openedUser, setOpenedUser] = useState(-1);
  const [editedCocktail, setEditedCocktail] = useState(null);
  
  const [cocktailModalIsOpen, setCocktailModalIsOpen] = useState(false);
  const [stockModalIsOpen, setStockModalIsOpen] = useState(false);
  const [userModalIsOpen, setUserModalIsOpen] = useState(false);
  const [customModalIsOpen, setCustomModalIsOpen] = useState(false);
  
  useEffect(() => {window.scrollTo(0,0);}, [activePage]);
  useEffect(() => {if (selectUser) window.scrollTo(0,0);}, [selectUser]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatPrice = (price) => {
    return price.toLocaleString(undefined,{minimumFractionDigits:2})+' €';
  }

  /* DATABASE */

  const fetchCocktails = useCallback(() => {
    fetch("/cocktail")
      .then((res) => res.json())
      .then((data) => setCocktails(data.sort((a, b) => a.menu_order - b.menu_order)))
      .catch((error) => console.error("Error fetching cocktails:", error));
  }, []);

  const fetchIngredients = useCallback(() => {
    fetch("/ingredient")
      .then((res) => res.json())
      .then((data) => setIngredients(data.sort((a, b) => a.name.localeCompare(b.name))))
      .catch((error) => console.error("Error fetching ingredients:", error));
  }, []);

  const fetchUsers = useCallback(() => {
    fetch("/user")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const fetchPurchases = useCallback(() => {
    fetch("/purchase")
      .then((res) => res.json())
      .then((data) => {
        setPurchases(data.sort((a,b) => new Date(b.date) - new Date(a.date)));
      })
      .catch((error) => console.error("Error fetching purchases:", error));
  }, []);

  const fetchAll = useCallback(() => {
    fetchCocktails();
    fetchIngredients();
    fetchUsers();
    fetchPurchases();
  }, [fetchCocktails,fetchIngredients,fetchUsers,fetchPurchases]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const validatePreparation = async () => {
    if (!prepareLoading) {
      setPrepareLoading(true);
      for (let i = 0; i < prepareList.length; i++) {
        try {
          if (prepareList[i].cocktailId !== -1) {
            const response = await fetch(`/cocktailmake`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({cocktailId:prepareList[i].cocktail_id,cocktailNb:-1}),
            });
            if (!response.ok) alert('Failed to validate preparation (cocktailmake).');
          }

          const response2 = await fetch(`/newpurchase`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId:prepareList[i].user.id,
              cocktailName:prepareList[i].cocktail,
              price:prepareList[i].price}),
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
    fetchPurchases();
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
    fetchPurchases();
  }

  const moveCocktail = async (cocktail,direction) => {
    try {
      const response = await fetch(`/cocktailmove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({cocktailId:cocktail.id,direction:direction}),
      });
      if (!response.ok) alert('Failed to move cocktail.');
    } catch (error) {
      console.error('Error moving cocktail :', error);
      alert('Error moving cocktail.');
    }
    fetchCocktails();
  }

  const cocktailToggle = async (cocktail) => {
    try {
      const response = await fetch(`/cocktailactive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({cocktailId:cocktail.id,active:!cocktail.active}),
      });
      if (!response.ok) alert('Failed to toggle cocktail.');
    } catch (error) {
      console.error('Error toggling cocktail :', error);
      alert('Error toggling cocktail.');
    }
    fetchCocktails();
  }

  /* PREPARE LIST */

  const [prepareList, setPrepareList] = useState([]);
  const [prepareLoading, setPrepareLoading] = useState(false);

  const addPrepareCocktail = (cocktail_user) => {
    setPrepareList((prevList) => [...prevList, {
      id : cocktail_user.id,
      cocktail : cocktail_user.cocktail.name,
      user : cocktail_user.user,
      price : cocktail_user.cocktail.price,
      cocktail_id : cocktail_user.cocktail.id?cocktail_user.cocktail.id:-1
    }]);
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

  const openStockModal = (ingredient) => {
    document.body.classList.add('no-scroll');
    setSelectedIngredient(ingredient);
    setStockModalIsOpen(true);
  };

  const closeStockModal = () => {
    document.body.classList.remove('no-scroll');
    setStockModalIsOpen(false);
    setSelectedIngredient(null);
    fetchAll();
  };

  const openCustomModal = () => {
    document.body.classList.add('no-scroll');
    setCustomModalIsOpen(true);
  };

  const closeCustomModal = (name='',price='') => {
    document.body.classList.remove('no-scroll');
    setCustomModalIsOpen(false);
    if (name !== '' && price !== '') {
      setSelectedCocktail({name:name,price:Number(price)});
      setSelectUser(true);
    }
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
      {/* PREPARATION */}

      {activePage === "Préparation" && <>
        <div className='section-container'>
          <div className='article-column-container'>
            {!selectUser ? (
              <>
                {cocktails.length === 0 ? (
                  <i style={{marginTop:'10px'}}>Chargement...</i>
                ) : (
                  <>
                    {drinks.map((drink) => ((drink.type==='CUSTOM'||(cocktails.filter((a) => a.active&&a.type===drink.type).length>0))&&<>
                      <h2 className='text-hr'><span>{drink.title}</span></h2>
                      {drink.type==='COCKTAIL' &&
                        <div className='filter-container'>
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
                        </div>}
                      <div className='article-row-container'>
                        {drink.type==='CUSTOM' && 
                        <div onClick={() => openCustomModal()} onContextMenu={(e) => e.preventDefault()} onTouchStart={(e) => e.preventDefault()}>
                          <div className='stock-container'>
                            <div className='cocktail-image-wrapper'>
                              <img src={`images/cocktail/noimage.jpg`} alt='Personnalisé' className='stock-image'/>
                            </div>
                            <h3 className='stock-name'>Personnalisé</h3>
                            <p className='stock-name'>Prix variable</p>
                          </div>
                        </div>}

                        {cocktails.filter(a =>
                          a.type===drink.type && a.active
                          && (a.type!=='COCKTAIL' || filters.filter(b => b.active).map(b => b.spirits).flat().includes(a.spirit))
                        ).map((cocktail) => (
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
                    </>))}
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
                      addPrepareCocktail({
                        id:(selectedCocktail.id?selectedCocktail.id.toLocaleString():'C')+Math.floor(Math.random()*100000),
                        cocktail:selectedCocktail,
                        user:user});
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
          </div>
          <div className='article-list-container'>
            <h1>Commande</h1>
            <table>
              <tbody>
                {prepareList.map((cocktail_user) => (
                  <tr>
                    <td style={{textAlign:'left',width:'40%'}}>• {cocktail_user.cocktail}</td>
                    <td style={{textAlign:'left',width:'35%'}}>{cocktail_user.user.name}</td>
                    <td style={{textAlign:'right',width:'15%'}}>{formatPrice(cocktail_user.price)}</td>
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
          </div>
        </div>
      </>}
      
      {/* STOCKS */}

      {activePage === "Stocks" && <>
        {ingredients.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <i style={{marginTop:'10px'}}>Chargement...</i>
          </div>
        ) : (
          <>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className='text-hr'><span>Stocks</span></h2>
          </div>
            {stock_types.map((stock_type) => (
              <>
                <p style={{marginLeft:'1.5%',height:'10px'}}>• {stock_type.title}</p>
                <div className='article-row-container'>
                  {ingredients.filter(a => a.type===stock_type.type).map((ingredient) => (
                    <div
                    key={ingredient.id}
                    onClick={() => openStockModal(ingredient)}
                    >
                      <BoStock ingredient={ingredient} />
                    </div>
                  ))}
                </div>
              </>
            ))}
          </>
        )}
      </>}

      {/* UTILISATEURS */}

      {activePage === "Utilisateurs" && <>
        <div className='article-column-container'>
          <h2 className='text-hr'><span>Utilisateurs</span></h2>
        </div>
        <div style={{display:'flex'}}>
          <button className='btn-success'
            onClick={() => openUserModal()}
          ><PlusCircle size={20}/> Créer un utilisateur</button>
          <p style={{margin:'15px 0 0 0'}}>{users.filter(u => u.active).length}/{users.length} personnes présentes</p>
        </div>
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
                {reste>0 && <span style={{color:'var(--danger)'}}>&nbsp;&nbsp;({formatPrice(reste)})</span>}
              </div>
            </div>
            <div className={'user-list-infos'+(openedUser===user.id?' opened':'')}>
              {user.purchases.length > 0 && <>
                <div style={{margin:'10px 0 5px 12px'}}>
                  Reste à payer :&nbsp;
                  {formatPrice(reste)}
                </div>
                <div style={{margin:'5px 0 0 12px'}}>
                  Total :&nbsp;
                  {formatPrice(user.purchases.reduce((acc,purchase) => acc + purchase.price,0))}
                </div>
                <table style={{margin:'10px',width:'530px'}}>
                  <tbody>
                    {user.purchases.sort((a,b) => new Date(b.date) - new Date(a.date)).map((purchase) => (
                      <tr className={purchase.refunded?'user-purchase-refunded':''}>
                        <td style={{paddingBottom:'6px',textAlign:'left',width:'140px'}}>{formatDateTime(purchase.date)}</td>
                        <td style={{paddingBottom:'6px',textAlign:'left',width:'250px'}}>• {purchase.cocktail_name}</td>
                        <td style={{paddingBottom:'6px',textAlign:'right',width:'60px'}}>{formatPrice(purchase.price)}</td>
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
      </>}

      {/* CARTE */}

      {activePage === "Carte" && <>
        <div className='article-column-container'>
          {editedCocktail !== null ? <>
            <CocktailEditor
              key={editedCocktail.id}
              cocktail={editedCocktail}
              cocktails={cocktails}
              ingredients={ingredients}
              drinks={drinks}
              handleCancel={() => {
                setEditedCocktail(null);
                setCocktails([]);
                fetchCocktails();
              }}
            />
          </> : <>
            {cocktails.length === 0?<i style={{marginTop:'10px'}}>Chargement...</i>:
              <>
                {[{name:'À la carte',active:true},{name:'Produits masqués',active:false}].map((page) => (
                  <>
                    <h2 className='text-hr'><span>{page.name}</span></h2>
                    <div className='article-row-container'>
                      {drinks.map((drink) => (
                        <>
                          {drink.type!=='COCKTAIL' && cocktails.filter(a => a.type===drink.type && a.active===page.active).length>0&&
                            <div className='vertical-hr'></div>
                          }
                          {cocktails.filter(a => a.type===drink.type && a.active===page.active).map((cocktail) => (
                            <div>
                              <div key={cocktail.id}
                                onClick={() => {
                                  setEditedCocktail(cocktail);
                                }}
                                onContextMenu={(e) => e.preventDefault()}
                                onTouchStart={(e) => e.preventDefault()}
                                >
                                <BoCocktailFo
                                  cocktail={cocktail}
                                  ingredients={ingredients}
                                />
                              </div>
                              <div style={{display:'flex'}}>
                                <button className='btn-info' style={{margin:'3px 5px 0 auto',height:'28px'}}
                                  disabled={cocktail.menu_order===0}
                                  onClick={() => moveCocktail(cocktail,-1)}>
                                  <ArrowBigLeft size={17}/>
                                </button>
                                <input type='checkbox' checked={cocktail.active} className='toggleswitch'
                                  onClick={() => {cocktailToggle(cocktail)}}
                                ></input>
                                <button className='btn-info' style={{margin:'3px auto 0 6px',height:'28px'}}
                                  onClick={() => moveCocktail(cocktail,1)}>
                                  <ArrowBigRight size={17}/>
                                </button>
                              </div>
                            </div>
                          ))}
                        </>
                      ))}
                    </div>
                    <button className='btn-success'
                      onClick={() => {setEditedCocktail({name:'Nouveau produit',type:'COCKTAIL',volume:0,price:0,menu_order:-1,img:'noimage.jpg',recipe:[]})}}
                    ><PlusCircle size={20}/> Créer un produit</button>
                  </>
                ))}
              </>
            }
          </>}
        </div>
      </>}
      
      {/* COMMANDES */}
      
      {activePage === "Commandes" && <>
        <div className='article-column-container'>
          <h2 className='text-hr'><span>Commandes</span></h2>
          <p style={{margin:'10px 0 5px 0'}}>Reste à payer : {formatPrice(purchases.reduce((acc, item) => {return !item.refunded ? acc + item.price : acc}, 0))}</p>
          <p style={{margin:'0 0 10px 0'}}>Total : {formatPrice(purchases.reduce((acc, item) =>  acc + item.price, 0))}</p>
          <table style={{marginTop:'0'}}>
            <tbody>
              {purchases.map((purchase) => <>
                <tr style={{color:purchase.refunded?'white':'var(--danger)'}}>
                  <td style={{width:'20%'}}>{formatDateTime(purchase.date)}</td>
                  <td style={{width:'25%'}}>• {purchase.cocktail_name}</td>
                  <td style={{width:'25%'}}>{purchase.username}</td>
                  <td style={{width:'10%',textAlign:'right'}}>{formatPrice(purchase.price)}</td>
                  <td style={{width:'10%',textAlign:'right'}}>
                    <input type='checkbox' checked={purchase.refunded} className='toggleswitch'
                      onClick={() => purchaseRefundToggle(purchase)}
                    ></input>
                  </td>
                  <td style={{width:'10%',textAlign:'right'}}>
                    <button
                      onClick={() => {window.alert(`${purchase.cocktail_name} commandés : ${purchases.filter((p) => p.cocktail_name===purchase.cocktail_name).length}`);}}
                    ><ChartNoAxesCombined size={24}/></button>
                  </td>
                </tr>
              </>)}
            </tbody>
          </table>
        </div>
        </>
      }

      {/* TOOLBAR */}

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

      {/* MODALES */}

      <BoCocktailModal
        isOpen={cocktailModalIsOpen}
        onRequestClose={closeCocktailModal}
        cocktail={selectedCocktail}
      />

      <BoStockModal
        isOpen={stockModalIsOpen}
        onRequestClose={closeStockModal}
        ingredient={selectedIngredient}
      />

      <BoCustomModal
        isOpen={customModalIsOpen}
        onRequestClose={closeCustomModal}
      />

      <BoUserModal
        isOpen={userModalIsOpen}
        onRequestClose={closeUserModal}
      />

    </div>
  );
};

export default Gestion;
