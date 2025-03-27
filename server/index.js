require('dotenv').config();

const path = require('path');
const express = require("express");
const pool = require('./db');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get('/cocktail', async (req, res) => {
  try {
    const cocktailsResult = await pool.query('SELECT c.id,c.name,c.type,c.spirit,c.instructions,g.name as glass,c.img,c.nbmade FROM cocktail c JOIN glass g ON g.id = c.glass');
    const cocktails = cocktailsResult.rows;

    for (const cocktail of cocktails) {
      const ingredientsQuery = `SELECT i.stock, r.quantity
                                FROM recipe r JOIN ingredient i ON r.ingredient_id = i.id
                                WHERE r.cocktail_id = $1`;
      const ingredientsResult = await pool.query(ingredientsQuery, [cocktail.id]);
      const ingredients = ingredientsResult.rows;

      cocktail.maxMake = Infinity;
      for (const ingredient of ingredients) {
        const possibleCocktails = Math.floor(ingredient.stock / ingredient.quantity);

        if (possibleCocktails < cocktail.maxMake) {
          cocktail.maxMake = possibleCocktails;
        }
      }

    }

    res.json(cocktails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/cocktail/:id', async (req, res) => {
  const cocktailId = parseInt(req.params.id, 10);

  try {
    const ingredientsResult = await pool.query(`SELECT i.name,i.stock,i.unit,r.step,r.proportion,r.quantity,r.showclient
                                                FROM recipe r JOIN ingredient i ON r.ingredient_id = i.id
                                                WHERE r.cocktail_id = $1`,[cocktailId]);

    const ingredients = ingredientsResult.rows;

    res.json({ingredients});
  } catch (error) {
    console.error('Error fetching cocktail details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/cocktailmake', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const { cocktailId, cocktailNb } = req.body;

      await client.query('BEGIN');

      await client.query(`UPDATE cocktail SET nbmade = nbmade - $1 WHERE id = $2`,[cocktailNb,cocktailId]);

      const {rows: recipes} = await client.query(`
        SELECT r.ingredient_id as ingredient_id, sum(r.quantity) as quantity, i.name, i.stock
        FROM recipe r JOIN ingredient i ON r.ingredient_id = i.id
        WHERE r.cocktail_id = $1 GROUP BY r.ingredient_id, i.name, i.stock;`,
        [cocktailId]);

      for (const recipe of recipes) {
        const newStock = Math.max(recipe.stock+(recipe.quantity*cocktailNb),0);
        await client.query(`UPDATE ingredient SET stock = $1 WHERE id = $2`,[newStock,recipe.ingredient_id]);
      }

      const {rows: glass} = await client.query(`
        SELECT g.id,g.stock
        FROM glass g
        JOIN cocktail c ON g.id = c.glass
        WHERE c.id = $1`,
        [cocktailId]);
      
      if (glass.length === 0) {throw new Error('No glass found for the provided cocktail ID.');}

      const newGlassStock = Math.max(glass[0].stock+cocktailNb,0);
      await client.query(`UPDATE glass SET stock = $1 WHERE id = $2`,[newGlassStock,glass[0].id]);

      await client.query('COMMIT');
      res.json({ success: true, message: 'Cocktail made successfully!' });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    // if (newStock < 0) {
    //   await client.query('ROLLBACK');
    //   return res.status(400).json({ success: false, message: `Plus assez de ${recipe.name} en stock.` });
    // }
  } catch (error) {
    console.error('Error making cocktail:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Ingredients

app.get('/ingredient', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingredient');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/ingredientreload', async (req, res) => {
  try {
    const { ingredientId, quantity } = req.body;

    const result = await pool.query(`UPDATE ingredient SET stock = stock + $1 WHERE id = $2 RETURNING *;`,[quantity,ingredientId]);
    await pool.query(`UPDATE ingredient SET stock = 0 WHERE stock < 0;`);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ingredient not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Glasses

app.get('/glass', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM glass');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/glassreload', async (req, res) => {
  try {
    const { glassId, quantity } = req.body;

    const result = await pool.query(`UPDATE glass SET stock = stock + $1 WHERE id = $2 ${quantity>0?'':'AND stock > 0 '}RETURNING *;`,[quantity,glassId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Glass not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// General

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});