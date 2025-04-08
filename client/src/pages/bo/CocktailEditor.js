import { ArrowBigDown, ArrowBigUp, ArrowLeftCircle, BadgeEuroIcon, GlassWater, PlusCircle, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { spiritueux } from '../data/data';

export default function CocktailEditor({ cocktail, cocktails, ingredients, drinks, handleCancel }) {
  const [formData, setFormData] = useState({ ...cocktail });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name==='type') formData.menu_order = -1;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const previewUrl = URL.createObjectURL(file);
  
    setFormData({
      ...formData,
      imgFile: file,
      imgPreview: previewUrl
    });
  };

  const handleRecipeChange = (index, field, value) => {
    const updatedRecipe = [...formData.recipe];
    updatedRecipe[index] = {
      ...updatedRecipe[index],
      [field]: field === 'showclient' ? value : value
    };
    setFormData({
      ...formData,
      recipe: updatedRecipe
    });
  };

  const handleRemoveIngredient = (index) => {
    const updatedRecipe = formData.recipe.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      recipe: updatedRecipe
    });
  };

  const moveIngredient = (index, direction) => {
    const newRecipe = [...formData.recipe];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRecipe.length) return;
  
    [newRecipe[index], newRecipe[targetIndex]] = [newRecipe[targetIndex], newRecipe[index]];
  
    setFormData({
      ...formData,
      recipe: newRecipe
    });
  }; 

  const handleSave = async () => {
    if (formData.menu_order === -1) formData.menu_order = cocktails.filter(c => c.type===formData.type&&c.active).reduce((max,c) => (
      c.menu_order > max ? c.menu_order : max),0)+1;
    if (formData.imgFile) formData.img = formData.imgFile.name.replace(/\s+/g, '-');
    if (formData.type==='COCKTAIL' && !formData.id && !formData.spirit) formData.spirit = 'Sans alcool';
    try {
      const res = await fetch('/cocktail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save');

      if (formData.imgFile) {
        const form = new FormData();
        form.append('image', formData.imgFile);
  
        const imgUpload = await fetch('/cocktailimage', {
          method: 'POST',
          body: form,
        });
  
        if (!imgUpload.ok) throw new Error('Erreur lors de l\'upload de l\'image.');
      }

      handleCancel();
    } catch (err) {
      console.error(err);
      alert('Erreur d\'enregistrement : un produit existe peut-être déjà avec ce nom.');
    }
  };
  
  const handleDelete = async() => {
    if (window.confirm("Êtes-vous sûr de supprimer ce produit ?")) {
      try {
        const res = await fetch(`/cocktail/${formData.id}`, {
          method: 'DELETE'
        });
  
        if (!res.ok) throw new Error('Erreur suppression');
        handleCancel();
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression du cocktail');
      }
    }
  }

  return (
    <>
      <h2 className='text-hr'><span>Nouveau produit</span></h2>
      <button className='btn-success' style={{width:'200px'}}
        onClick={handleSave}
      ><Save size={20}/> Enregistrer</button>
      {formData.id && <button className='btn-danger' style={{width:'200px',marginTop:'0'}}
        onClick={handleDelete}
      ><Trash2 size={20}/> Supprimer</button>}
      <button className='btn-info' style={{width:'200px',marginTop:'0'}}
        onClick={handleCancel}
      ><ArrowLeftCircle size={20}/> Annuler</button>
      <div className='cocktail-editor-container' style={{width:'100%'}}>
        <div className="cocktail-editor-column" style={{width:'20%'}}>
          <img
            src={formData.imgPreview || `images/cocktail/${formData.img}`}
            alt={formData.name}
            className="cocktail-editor-image"
          />

          <p>Image</p>
          <input
            className="cocktail-editor-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />

          <p>Nom</p>
          <input className="cocktail-editor-input" type="text" name="name" value={formData.name} onChange={handleChange}/>

          <p>Catégorie</p>
          <select className='cocktail-editor-input' name="type" value={formData.type} onChange={handleChange}>
            {drinks.map((drink) => (
              <option key={drink.type} value={drink.type}>
                {drink.title}
              </option>
            ))}
          </select>

          <p>Spiritueux</p>
          <select className='cocktail-editor-input' name="spirit" value={formData.spirit} onChange={handleChange} disabled={formData.type!=='COCKTAIL'}>
           <option key={''} value={''}>Autre</option>
            {spiritueux.map(b => b.spirits).flat().sort((a,b) => a.localeCompare(b)).map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </select>

          <div style={{display:'flex'}}>
            <p>Volume (cl)</p>
            <button style={{paddingLeft:'1px',width:'26px',height:'26px',margin:'15px 0 0 10px'}}
              onClick={() => {
                let volume = 0;
                for (const r of formData.recipe) {
                  const ing = ingredients.find(i => i.id===r.ingredient_id)
                  volume += r.quantity*ing.volume;
                }
                window.alert(`Volume sans glaçons : ${Math.round(volume)}cl`);
              }}
            ><GlassWater size={20}/></button>
          </div>
          <input className="cocktail-editor-input" type="number" name="volume" value={formData.volume} onChange={handleChange}/>

          <div style={{display:'flex'}}>
            <p>Prix (€)</p>
            <button style={{paddingLeft:'1px',width:'26px',height:'26px',margin:'15px 0 0 10px'}}
              onClick={() => {
                let price = 0;
                for (const r of formData.recipe) {
                  const ing = ingredients.find(i => i.id===r.ingredient_id);
                  const ing_price = ing.unit==='cl'?ing.price/100:(ing.unit==='g'?ing.price/1000:ing.price);
                  price += r.quantity * ing_price;
                }
                price = Math.floor(price*100)/100;
                window.alert(`Coût de production : ${price.toLocaleString(undefined,{minimumFractionDigits:2})} €`);
              }}
            ><BadgeEuroIcon size={20}/></button>
          </div>
          <input className="cocktail-editor-input" type="number" name="price" step="0.1" value={formData.price} onChange={handleChange}/>
        </div>

        <div className="cocktail-editor-column" style={{width:'40%'}}>
          <p style={{marginTop:'0'}}>Recette</p>
          <input className="cocktail-editor-input" type="text" name="instructions" value={formData.instructions} onChange={handleChange}/>
          {formData.recipe.map((recipe_step, index) => (
            <div key={index} className="cocktail-editor-recipe">
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <input type='checkbox' className='toggleswitch' checked={recipe_step.showclient} onChange={(e) => handleRecipeChange(index, 'showclient', e.target.checked)} style={{marginLeft:'0'}}/>
                <div style={{display:'flex',gap:'10px'}}>
                  {index!==0 && <button className="btn-info" style={{margin:'0',marginBottom:'0'}}
                    onClick={() => moveIngredient(index,'up')}>
                  <ArrowBigUp size={20} /></button>}
                  {index!==formData.recipe.length-1 && <button className="btn-info" style={{margin:'0',marginBottom:'0'}}
                    onClick={() => moveIngredient(index,'down')}>
                  <ArrowBigDown size={20} /></button>}
                  <button className="btn-danger" style={{margin:'0',marginBottom:'0'}}
                    onClick={() => handleRemoveIngredient(index)}>
                  <Trash2 size={20} /></button>
                </div>
              </div>
              <div style={{display:'flex',gap:'10px'}}>
                <select className='cocktail-editor-input' value={recipe_step.ingredient_id} onChange={(e) => handleRecipeChange(index, 'ingredient_id', parseInt(e.target.value))}>
                  <option key={null} value={null}>Sélectionner un ingrédient</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name}
                    </option>
                  ))}
                </select>
              
                <input className="cocktail-editor-input" type="number" step="0.1" value={recipe_step.quantity} onChange={(e) => handleRecipeChange(index, 'quantity', parseFloat(e.target.value))}/>
                {recipe_step.ingredient_id && <>{ingredients.find(i => i.id===recipe_step.ingredient_id).unit}</>}

                <input className="cocktail-editor-input" type="text" value={recipe_step.proportion} onChange={(e) => handleRecipeChange(index, 'proportion', e.target.value)}/>
              </div>
            </div>
          ))}
          <button className='btn-success' style={{width:'100%',marginBottom:'0'}}
            onClick={() => {
              setFormData({
                ...formData,
                recipe: [
                  ...formData.recipe, 
                  { step: formData.recipe.length + 1, ingredient_id: null, quantity: 0, proportion: '', showclient: true }
                ]
              });
            }}
          ><PlusCircle size={20} /> Ajouter un ingrédient</button>
        </div>
      </div>
    </>
  );
}
