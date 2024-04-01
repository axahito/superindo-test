import express from 'express';
import { Request, Response } from 'express';
import * as mysql from 'mysql';
import * as bodyParser from 'body-parser';
import { verifyToken, authorizeRole } from './middleware/auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';

const app = express();
app.use(cors)
const port = 3000;
const secretKey = 'secret_key';

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'superindo'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.json());

// Routes
// Login endpoint
app.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("email", email)
  console.log("pw", password)

  // Query the database to find the user
  const sql = 'SELECT * FROM users WHERE email = ?';
  connection.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Check if user exists
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare hashed password
    bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error('Error:', bcryptErr);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secretKey);

      res.json({ token });
    });
  });
});

// Users CRUD
app.post('/users', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const user = req.body;
  const sql = 'INSERT INTO users SET ?';
  connection.query(sql, user, (err, result) => {
    if (err) throw err;
    res.send('User added successfully');
  });
});

app.get('/users', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const sql = 'SELECT * FROM users';
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/users/:id', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const userId = req.params.id;
  const sql = `SELECT * FROM users WHERE id = ?`;
  connection.query(sql, userId, (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

app.put('/users/:id', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedUser = req.body;
  const sql = 'UPDATE users SET ? WHERE id = ?';
  connection.query(sql, [updatedUser, id], (err, result) => {
    if (err) throw err;
    res.send('User updated successfully');
  });
});

app.delete('/users/:id', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const id = req.params.id;
  const sql = 'DELETE FROM users WHERE id = ?';
  connection.query(sql, id, (err, result) => {
    if (err) throw err;
    res.send('User deleted successfully');
  });
});

// Roles CRUD
app.post('/roles', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const role = req.body;
  const sql = 'INSERT INTO role SET ?';
  connection.query(sql, role, (err, result) => {
    if (err) throw err;
    res.send('Role added successfully');
  });
});

app.get('/roles', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const sql = 'SELECT * FROM role';
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Categories CRUD
app.post('/categories', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const user = req.body;
  const sql = 'INSERT INTO categories SET ?';
  connection.query(sql, user, (err, result) => {
    if (err) throw err;
    res.send('User added successfully');
  });
});

app.get('/categories', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM categories';
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/categories/:id', (req: Request, res: Response) => {
  const categoryId = req.params.id;

  const categoryQuery = `SELECT * FROM categories WHERE id = ?`;
  const productsQuery = `SELECT * FROM products WHERE category_id = ?`;

  connection.query(categoryQuery, categoryId, (err, categoryResults) => {
    if (err) throw err;

    if (categoryResults.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = categoryResults[0];

    connection.query(productsQuery, categoryId, (err, productsResults) => {
      if (err) throw err;

      const categoryWithProducts = {
        ...category,
        products: productsResults
      };

      res.json(categoryWithProducts);
    });
  });
});

app.put('/categories/:id', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedUser = req.body;
  const sql = 'UPDATE categories SET ? WHERE id = ?';
  connection.query(sql, [updatedUser, id], (err, result) => {
    if (err) throw err;
    res.send('User updated successfully');
  });
});

app.delete('/categories/:id', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const id = req.params.id;
  const sql = 'DELETE FROM categories WHERE id = ?';
  connection.query(sql, id, (err, result) => {
    if (err) throw err;
    res.send('User deleted successfully');
  });
});

// Products CRUD
app.post('/products', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const product = req.body;

  connection.query('INSERT INTO products SET ?', product, (err, result) => {
    if (err) throw err;

    // If product inserted successfully, also insert variants
    const productId = result.insertId;
    const variants = product.variants.map((variant: any) => ({
      ...variant,
      product_id: productId,
    }));
    if (variants.length > 0) {
      connection.query('INSERT INTO variants (product_id, code, name, qty, price, active) VALUES ?', [variants.map((variant: any) => Object.values(variant))], (err, result) => {
        if (err) throw err;
        res.send('Product and variants added successfully');
      });
    } else {
      res.send('Product added successfully');
    }
  });
});

app.get('/products', (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (+page - 1) * +limit;

  const sql = `SELECT * FROM products LIMIT ?, ?`;
  connection.query(sql, [offset, Number(limit)], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/products/:id', (req: Request, res: Response) => {
  const productId = req.params.id;
  const productQuery = `SELECT * FROM products WHERE id = ?`;
  const variantsQuery = `SELECT * FROM variants WHERE product_id = ?`;

  connection.query(productQuery, productId, (err, productResults) => {
    if (err) throw err;

    if (productResults.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResults[0];

    connection.query(variantsQuery, productId, (err, variantsResults) => {
      if (err) throw err;

      const productWithVariants = {
        ...product,
        variants: variantsResults
      };

      res.json(productWithVariants);
    });
  });
});

app.put('/products/:id', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const productId = req.params.id;
  const product = req.body;

  connection.query('UPDATE products SET ? WHERE id = ?', [product, productId], (err, result) => {
    if (err) throw err;

    // Update associated variants if any
    if (product.variants && product.variants.length > 0) {
      const variants = product.variants.map((variant: any) => ({
        ...variant,
        product_id: productId,
      }));

      // Delete existing variants and insert new ones
      connection.query('DELETE FROM variants WHERE product_id = ?', productId, (err, result) => {
        if (err) throw err;

        connection.query('INSERT INTO variants (product_id, code, name, qty, price, active) VALUES ?', [variants.map((variant: any) => Object.values(variant))], (err, result) => {
          if (err) throw err;
          res.send('Product and variants updated successfully');
        });
      });
    } else {
      res.send('Product updated successfully');
    }
  });
});

app.delete('/products/:id', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const productId = req.params.id;

  connection.query('DELETE FROM products WHERE id = ?', productId, (err, result) => {
    if (err) throw err;

    // Also delete associated variants
    connection.query('DELETE FROM variants WHERE product_id = ?', productId, (err, result) => {
      if (err) throw err;
      res.send('Product and associated variants deleted successfully');
    });
  });
});

// Variants CRUD
app.post('/variants', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const user = req.body;
  const sql = 'INSERT INTO variants SET ?';
  connection.query(sql, user, (err, result) => {
    if (err) throw err;
    res.send('User added successfully');
  });
});

app.get('/variants', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM variants';
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.put('/variants/:id', authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedUser = req.body;
  const sql = 'UPDATE variants SET ? WHERE id = ?';
  connection.query(sql, [updatedUser, id], (err, result) => {
    if (err) throw err;
    res.send('User updated successfully');
  });
});

app.delete('/variants/:id', verifyToken, authorizeRole("OPERATOR"), (req: Request, res: Response) => {
  const id = req.params.id;
  const sql = 'DELETE FROM variants WHERE id = ?';
  connection.query(sql, id, (err, result) => {
    if (err) throw err;
    res.send('User deleted successfully');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
