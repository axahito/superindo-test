"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var mysql = __importStar(require("mysql"));
var bodyParser = __importStar(require("body-parser"));
var auth_1 = require("./middleware/auth");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var cors_1 = __importDefault(require("cors"));
var app = (0, express_1.default)();
app.use(cors_1.default);
var port = 3000;
var secretKey = 'secret_key';
// MySQL Connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'superindo'
});
connection.connect(function (err) {
    if (err)
        throw err;
    console.log('Connected to MySQL database');
});
// Middleware
app.use(bodyParser.json());
// Routes
// Login endpoint
app.post('/login', function (req, res) {
    var _a = req.body, email = _a.email, password = _a.password;
    console.log("email", email);
    console.log("pw", password);
    // Query the database to find the user
    var sql = 'SELECT * FROM users WHERE email = ?';
    connection.query(sql, [email], function (err, results) {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        // Check if user exists
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        var user = results[0];
        // Compare hashed password
        bcrypt_1.default.compare(password, user.password, function (bcryptErr, isMatch) {
            if (bcryptErr) {
                console.error('Error:', bcryptErr);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid password' });
            }
            // Generate JWT token
            var token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, secretKey);
            res.json({ token: token });
        });
    });
});
// Users CRUD
app.post('/users', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var user = req.body;
    var sql = 'INSERT INTO users SET ?';
    connection.query(sql, user, function (err, result) {
        if (err)
            throw err;
        res.send('User added successfully');
    });
});
app.get('/users', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var sql = 'SELECT * FROM users';
    connection.query(sql, function (err, results) {
        if (err)
            throw err;
        res.json(results);
    });
});
app.get('/users/:id', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var userId = req.params.id;
    var sql = "SELECT * FROM users WHERE id = ?";
    connection.query(sql, userId, function (err, results) {
        if (err)
            throw err;
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});
app.put('/users/:id', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var id = req.params.id;
    var updatedUser = req.body;
    var sql = 'UPDATE users SET ? WHERE id = ?';
    connection.query(sql, [updatedUser, id], function (err, result) {
        if (err)
            throw err;
        res.send('User updated successfully');
    });
});
app.delete('/users/:id', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var id = req.params.id;
    var sql = 'DELETE FROM users WHERE id = ?';
    connection.query(sql, id, function (err, result) {
        if (err)
            throw err;
        res.send('User deleted successfully');
    });
});
// Roles CRUD
app.post('/roles', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var role = req.body;
    var sql = 'INSERT INTO role SET ?';
    connection.query(sql, role, function (err, result) {
        if (err)
            throw err;
        res.send('Role added successfully');
    });
});
app.get('/roles', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var sql = 'SELECT * FROM role';
    connection.query(sql, function (err, results) {
        if (err)
            throw err;
        res.json(results);
    });
});
// Categories CRUD
app.post('/categories', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var user = req.body;
    var sql = 'INSERT INTO categories SET ?';
    connection.query(sql, user, function (err, result) {
        if (err)
            throw err;
        res.send('User added successfully');
    });
});
app.get('/categories', function (req, res) {
    var sql = 'SELECT * FROM categories';
    connection.query(sql, function (err, results) {
        if (err)
            throw err;
        res.json(results);
    });
});
app.get('/categories/:id', function (req, res) {
    var categoryId = req.params.id;
    var categoryQuery = "SELECT * FROM categories WHERE id = ?";
    var productsQuery = "SELECT * FROM products WHERE category_id = ?";
    connection.query(categoryQuery, categoryId, function (err, categoryResults) {
        if (err)
            throw err;
        if (categoryResults.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        var category = categoryResults[0];
        connection.query(productsQuery, categoryId, function (err, productsResults) {
            if (err)
                throw err;
            var categoryWithProducts = __assign(__assign({}, category), { products: productsResults });
            res.json(categoryWithProducts);
        });
    });
});
app.put('/categories/:id', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var id = req.params.id;
    var updatedUser = req.body;
    var sql = 'UPDATE categories SET ? WHERE id = ?';
    connection.query(sql, [updatedUser, id], function (err, result) {
        if (err)
            throw err;
        res.send('User updated successfully');
    });
});
app.delete('/categories/:id', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var id = req.params.id;
    var sql = 'DELETE FROM categories WHERE id = ?';
    connection.query(sql, id, function (err, result) {
        if (err)
            throw err;
        res.send('User deleted successfully');
    });
});
// Products CRUD
app.post('/products', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var product = req.body;
    connection.query('INSERT INTO products SET ?', product, function (err, result) {
        if (err)
            throw err;
        // If product inserted successfully, also insert variants
        var productId = result.insertId;
        var variants = product.variants.map(function (variant) { return (__assign(__assign({}, variant), { product_id: productId })); });
        if (variants.length > 0) {
            connection.query('INSERT INTO variants (product_id, code, name, qty, price, active) VALUES ?', [variants.map(function (variant) { return Object.values(variant); })], function (err, result) {
                if (err)
                    throw err;
                res.send('Product and variants added successfully');
            });
        }
        else {
            res.send('Product added successfully');
        }
    });
});
app.get('/products', function (req, res) {
    var _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c;
    var offset = (+page - 1) * +limit;
    var sql = "SELECT * FROM products LIMIT ?, ?";
    connection.query(sql, [offset, Number(limit)], function (err, results) {
        if (err)
            throw err;
        res.json(results);
    });
});
app.get('/products/:id', function (req, res) {
    var productId = req.params.id;
    var productQuery = "SELECT * FROM products WHERE id = ?";
    var variantsQuery = "SELECT * FROM variants WHERE product_id = ?";
    connection.query(productQuery, productId, function (err, productResults) {
        if (err)
            throw err;
        if (productResults.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        var product = productResults[0];
        connection.query(variantsQuery, productId, function (err, variantsResults) {
            if (err)
                throw err;
            var productWithVariants = __assign(__assign({}, product), { variants: variantsResults });
            res.json(productWithVariants);
        });
    });
});
app.put('/products/:id', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var productId = req.params.id;
    var product = req.body;
    connection.query('UPDATE products SET ? WHERE id = ?', [product, productId], function (err, result) {
        if (err)
            throw err;
        // Update associated variants if any
        if (product.variants && product.variants.length > 0) {
            var variants_1 = product.variants.map(function (variant) { return (__assign(__assign({}, variant), { product_id: productId })); });
            // Delete existing variants and insert new ones
            connection.query('DELETE FROM variants WHERE product_id = ?', productId, function (err, result) {
                if (err)
                    throw err;
                connection.query('INSERT INTO variants (product_id, code, name, qty, price, active) VALUES ?', [variants_1.map(function (variant) { return Object.values(variant); })], function (err, result) {
                    if (err)
                        throw err;
                    res.send('Product and variants updated successfully');
                });
            });
        }
        else {
            res.send('Product updated successfully');
        }
    });
});
app.delete('/products/:id', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var productId = req.params.id;
    connection.query('DELETE FROM products WHERE id = ?', productId, function (err, result) {
        if (err)
            throw err;
        // Also delete associated variants
        connection.query('DELETE FROM variants WHERE product_id = ?', productId, function (err, result) {
            if (err)
                throw err;
            res.send('Product and associated variants deleted successfully');
        });
    });
});
// Variants CRUD
app.post('/variants', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var user = req.body;
    var sql = 'INSERT INTO variants SET ?';
    connection.query(sql, user, function (err, result) {
        if (err)
            throw err;
        res.send('User added successfully');
    });
});
app.get('/variants', function (req, res) {
    var sql = 'SELECT * FROM variants';
    connection.query(sql, function (err, results) {
        if (err)
            throw err;
        res.json(results);
    });
});
app.put('/variants/:id', (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var id = req.params.id;
    var updatedUser = req.body;
    var sql = 'UPDATE variants SET ? WHERE id = ?';
    connection.query(sql, [updatedUser, id], function (err, result) {
        if (err)
            throw err;
        res.send('User updated successfully');
    });
});
app.delete('/variants/:id', auth_1.verifyToken, (0, auth_1.authorizeRole)("OPERATOR"), function (req, res) {
    var id = req.params.id;
    var sql = 'DELETE FROM variants WHERE id = ?';
    connection.query(sql, id, function (err, result) {
        if (err)
            throw err;
        res.send('User deleted successfully');
    });
});
// Start the server
app.listen(port, function () {
    console.log("Server is listening at http://localhost:".concat(port));
});
