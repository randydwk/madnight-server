require('dotenv').config();

const path = require('path');
const express = require("express");
const pool = require('./db');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDKEY,
  api_secret: process.env.CLOUDSECRET,
});

// Multer en mémoire (pas besoin de disque)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo max
});

// Fonction utilitaire pour uploader depuis un buffer
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'cocktails' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

app.post('/cocktailimage', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided.' });

    // Upload vers Cloudinary
    const result = await streamUpload(req.file.buffer);

    // Retourne l'URL Cloudinary
    res.status(200).json({
      message: 'Image uploaded successfully.',
      url: result.secure_url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Image upload failed.', error: err.message });
  }
});

// Cocktail

app.get('/cocktail', async (req, res) => {
  try {
    const cocktailsResult = await pool.query('SELECT * FROM cocktail');
    const cocktails = cocktailsResult.rows;

    for (const cocktail of cocktails) {
      const ingredientsResult = await pool.query(`SELECT i.id as ingredient_id,i.name,i.stock,i.unit,r.step,r.proportion,r.quantity,r.showclient,r.shaker
                                FROM recipe r JOIN ingredient i ON r.ingredient_id = i.id
                                WHERE r.cocktail_id = $1`,[cocktail.id]);
      const ingredients = ingredientsResult.rows;

      cocktail.maxMake = Infinity;
      cocktail.recipe = ingredients.sort((a,b) => a.step-b.step);
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

app.post('/cocktail', upload.single("image"), async (req, res) => {
  try {
    const {id,name,type,spirit,volume,price,instructions,recipe,menu_order} = req.body;

    if (!name || typeof name !== 'string' || !Array.isArray(JSON.parse(recipe || '[]'))) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    let cocktailId;
    let imageUrl = null;

    // Si une image est uploadée, on l'envoie sur Cloudinary
    if (req.file) {
      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
    }

    if (id) {
      // UPDATE
      let updateQuery = `UPDATE cocktail 
                         SET name = $1, type = $2, spirit = $3, volume = $4, price = $5, instructions = $6, menu_order = $7`;
      const params = [name, type, spirit, volume, price, instructions || '', menu_order];

      if (imageUrl) {
        updateQuery += `, img = $8 WHERE id = $9 RETURNING id`;
        params.push(imageUrl, id);
      } else {
        updateQuery += ` WHERE id = $8 RETURNING id`;
        params.push(id);
      }

      const updateResult = await pool.query(updateQuery, params);
      if (updateResult.rowCount === 0) {
        return res.status(404).json({ error: 'Cocktail not found' });
      }
      cocktailId = updateResult.rows[0].id;

    } else {
      // CREATE
      const insertQuery = `INSERT INTO cocktail (name, type, spirit, volume, price, instructions, menu_order, img)
                           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                           RETURNING id`;
      const insertResult = await pool.query(insertQuery, [name,type,spirit,volume,price,instructions || '',menu_order,imageUrl?imageUrl:'images/cocktail/noimage.jpg']);
      cocktailId = insertResult.rows[0].id;
    }

    // RECIPE
    const parsedRecipe = JSON.parse(recipe || '[]');
    await pool.query('DELETE FROM recipe WHERE cocktail_id=$1', [cocktailId]);
    const insertRecipeQuery = `INSERT INTO recipe (cocktail_id, ingredient_id, quantity, step, proportion, showclient, shaker)
                               VALUES ($1,$2,$3,$4,$5,$6,$7)`;

    for (let i=0; i<parsedRecipe.length; i++){
      const { ingredient_id, quantity, proportion, showclient, shaker } = parsedRecipe[i];

      if (ingredient_id && quantity!=null){
        await pool.query(insertRecipeQuery, [cocktailId,ingredient_id,quantity,i,proportion||'',showclient||false,shaker||false]);
      }
    }

    res.status(200).json({ message: 'Cocktail saved successfully', cocktailId });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/cocktailmake', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const { cocktailId, cocktailNb } = req.body;

      await client.query('BEGIN');

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
  } catch (error) {
    console.error('Error making cocktail:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/cocktailmove', async (req, res) => {
  const { cocktailId, direction } = req.body;

  try {
    await pool.query(
      `UPDATE cocktail SET menu_order = menu_order + $1 WHERE id = $2`,
      [direction, cocktailId]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Error moving cocktail:', err);
    res.status(500).send('Error moving cocktail');
  }
});

app.post('/cocktailactive', async (req, res) => {
  try {
    const { cocktailId, active } = req.body;

    const result = await pool.query(`UPDATE cocktail SET active = $1 WHERE id = $2 RETURNING *;`,[active,cocktailId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cocktail not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/cocktail/:id', async (req, res) => {
  const cocktailId = req.params.id;

  try {
    await pool.query('DELETE FROM recipe WHERE cocktail_id = $1', [cocktailId]);
    await pool.query('DELETE FROM cocktail WHERE id = $1', [cocktailId]);

    res.status(200).json({ message: 'Cocktail deleted successfully' });
  } catch (err) {
    console.error('Erreur suppression cocktail:', err.message);
    res.status(500).send('Server Error');
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

app.post('/ingredientprice', async (req, res) => {
  try {
    const { ingredientId, price } = req.body;

    const result = await pool.query(`UPDATE ingredient SET price = $1 WHERE id = $2 RETURNING *;`,[price,ingredientId]);

    if (result.rows.length === 0) return res.status(404).json({ message: 'Ingredient not found.' });
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

    /*if (resultPurchases.rows.length === 0) {
      return res.status(500).json({ message: 'Error with the deleteuser request (purchases).' });
    }*/

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

app.get('/purchase', async (req, res) => {
  try {
    const purchaseResult = await pool.query(`SELECT p.id,p.cocktail_name,p.price,p.refunded,p.user_id,p.date,u.name as username FROM purchase p JOIN "user" u ON p.user_id=u.id`);

    res.json(purchaseResult.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

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