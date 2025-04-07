import { ArrowBigDownIcon, ArrowBigUpIcon, ArrowLeftCircle, PlusCircle, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CocktailEditor({ cocktail, ingredients, handleCancel }) {
  const [formData, setFormData] = useState({ ...cocktail });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
    console.log(formData);
    try {
      const res = await fetch('/cocktail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save');
      handleCancel();
    } catch (err) {
      console.error(err);
      alert('Error saving cocktail');
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
            src={`images/cocktail/${cocktail.type}/${cocktail.img}`}
            alt={cocktail.name}
            className='cocktail-editor-image'
          />

          <p>Nom</p>
          <input className="cocktail-editor-input" type="text" name="name" value={formData.name} onChange={handleChange}/>

          <p>Type</p>
          <select className='cocktail-editor-input' name="type" value={formData.type} onChange={handleChange}>
            {['COCKTAIL', 'SHOOTER', 'BEER', 'CUSTOM'].map((type) => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          <p>Spiritueux</p>
          <select className='cocktail-editor-input' name="spirit" value={formData.spirit} onChange={handleChange}>
            {['', 'Vodka', 'Rhum', 'Cachaça', 'Tequila', 'Gin', 'Whisky', 'Brandy', 'Sans alcool'].map((type) => (
              <option key={type} value={type}>
                {type===''?'Autre':type}
              </option>
            ))}
          </select>

          <p>Prix (€)</p>
          <input className="cocktail-editor-input" type="number" name="price" step="0.1" value={formData.price} onChange={handleChange}/>

          <p>Ordre</p>
          <input className="cocktail-editor-input" type="number" name="menu_order" value={formData.menu_order} onChange={handleChange}/>
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
                  <ArrowBigUpIcon size={20} /></button>}
                  {index!==formData.recipe.length-1 && <button className="btn-info" style={{margin:'0',marginBottom:'0'}}
                    onClick={() => moveIngredient(index,'down')}>
                  <ArrowBigDownIcon size={20} /></button>}
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

                <input className="cocktail-editor-input" type="text" value={recipe_step.proportion} onChange={(e) => handleRecipeChange(index, 'proportion', e.target.value)}/>

                <input className="cocktail-editor-input" type="number" step="0.1" value={recipe_step.quantity} onChange={(e) => handleRecipeChange(index, 'quantity', parseFloat(e.target.value))}/>
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
