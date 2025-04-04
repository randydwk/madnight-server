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
    const cocktailsResult = await pool.query('SELECT * FROM cocktail');
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

// Users
app.get('/user', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "user"');

    const users = result.rows;

    for (const user of users) {
      const purchaseResult = await pool.query(`SELECT * FROM purchase p WHERE p.user_id = $1`, [user.id]);
      user.purchases = purchaseResult.rows;
    }

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/newuser', async (req, res) => {
  try {
    const { username } = req.body;

    const result = await pool.query(`INSERT INTO "user" (name) VALUES ($1) RETURNING *;`,[username]);

    if (result.rows.length === 0) {
      return res.status(500).json({ message: 'Error with the newuser request.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/deleteuser', async (req, res) => {
  try {
    const { userId } = req.body;

    const resultPurchases = await pool.query(`DELETE FROM purchase WHERE user_id = $1 RETURNING *;`,[userId]);

    if (resultPurchases.rows.length === 0) {
      return res.status(500).json({ message: 'Error with the deleteuser request (purchases).' });
    }

    const result = await pool.query(`DELETE FROM "user" WHERE id = $1 RETURNING *;`,[userId]);

    if (result.rows.length === 0) {
      return res.status(500).json({ message: 'Error with the deleteuser request (actual user).' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/useractive', async (req, res) => {
  try {
    const { userId, active } = req.body;

    const result = await pool.query(`UPDATE "user" SET active = $1 WHERE id = $2 RETURNING *;`,[active,userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Purchase

app.post('/newpurchase', async (req, res) => {
  try {
    const { userId, cocktailName, price } = req.body;

    await pool.query(`INSERT INTO purchase (user_id,cocktail_name,price,"date") VALUES ($1,$2,$3,now())`,[userId,cocktailName,price]);

    res.json({ success: true, message: 'Cocktail made successfully!' });
  } catch (error) {
    console.error('Error making purchase:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/purchaserefund', async (req, res) => {
  try {
    const { purchaseId, refunded } = req.body;

    const result = await pool.query(`UPDATE purchase SET refunded = $1 WHERE id = $2 RETURNING *;`,[refunded,purchaseId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Purchase not found.' });
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