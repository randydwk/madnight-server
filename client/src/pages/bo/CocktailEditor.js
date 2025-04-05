import { ArrowLeftCircle, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CocktailEditor({ cocktail }) {
  const [formData, setFormData] = useState({ ...cocktail });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/update-cocktail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save');
      alert(`Cocktail "${formData.name}" updated!`);
    } catch (err) {
      console.error(err);
      alert('Error saving cocktail');
    }
  };

  return (

    <div className="cocktail-editor-container">
      <img
        src={`images/cocktail/${cocktail.type}/${cocktail.img}`}
        alt={cocktail.name}
        className='cocktail-editor-image'
      />

      <p>Nom</p>
      <input
        className="cocktail-editor-input"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />

      <p>Type</p>
      <select
        className='cocktail-editor-input'
        name="type"
        value={formData.type}
        disabled={!formData.active}
        onChange={handleChange}
      >
        {['COCKTAIL', 'SHOOTER', 'BEER', 'CUSTOM'].map((type) => (
          <option key={type} value={type}>
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      <p>Base</p>
      <select
        className='cocktail-editor-input'
        name="spirit"
        value={formData.spirit}
        onChange={handleChange}
      >
        {['', 'Vodka', 'Rhum', 'Cachaça', 'Tequila', 'Gin', 'Whisky', 'Brandy', 'Sans alcool'].map((type) => (
          <option key={type} value={type}>
            {type===''?'Autre':type}
          </option>
        ))}
      </select>

      <p>Prix (€)</p>
      <input
        className="cocktail-editor-input"
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
      />

      <p>Actif</p>
      <input
        type='checkbox'
        className='toggleswitch'
        name="active"
        checked={formData.active}
        onChange={handleChange}
      />

      <p>Ordre</p>
      <input
        className="cocktail-editor-input"
        type="number"
        name="menu_order"
        value={formData.menu_order}
        onChange={handleChange}
      />

      <br/>
      <button className='btn-success'
        onClick={handleSave}
      ><Save size={20}/> Enregistrer</button>
      <button className='btn-danger'
        onClick={() => {}}
      ><Trash2 size={20}/> Supprimer</button>
      <button className='btn-info'
        onClick={() => {}}
      ><ArrowLeftCircle size={20}/> Annuler</button>
    </div>
  );
}
