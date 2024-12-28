const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch'); // For Telegram API calls
const multer = require('multer'); // For file uploads
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const app = express();
const port = 5000;

// Middleware setup
const corsOptions = {
  origin: 'https://cha7n-al3ab-iliktronia.com', // No trailing slash
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' })); // JSON request size limit
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // URL-encoded forms size limit

// MySQL database connection
const db = mysql.createPool({
  host: '69.30.247.228',
  user: 'yahia',
  password: 'yahiarahalHa3a$$',
  database: 'free_fire',
});

db.getConnection()
  .then(() => console.log('Connected to MySQL'))
  .catch((err) => {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  });

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // Limit: 50MB

// Helper: Fetch user from database
const getUser = (telegram_id) =>
  db.query('SELECT telegram_id, balance FROM telegram_users WHERE telegram_id = ?', [telegram_id])
    .then(([rows]) => rows[0] || null)
    .catch((err) => {
      console.error("Error fetching user:", err);
      throw err;
    });

// Helper: Create user with initial funds
const createUser = (telegram_id, initialBalance = 0) =>
  db.query('INSERT INTO telegram_users (telegram_id, balance) VALUES (?, ?)', [telegram_id, initialBalance])
    .then(([result]) => ({ telegram_id, balance: initialBalance }))
    .catch((err) => {
      console.error("Error inserting user:", err);
      throw err;
    });


// Check latest orders
app.get('/api/check-latest-orders', (req, res) => {
  db.query('SELECT * FROM OrderConfirm ORDER BY ID DESC LIMIT 10')
    .then(([results]) => res.json({ orders: results }))
    .catch((err) => {
      console.error('Error fetching data from OrderConfirm:', err.message);
      res.status(500).json({ message: 'Failed to fetch order data', error: err.message });
    });
});
app.post('/insert_to_db', async (req, res) => {
  const { payment_link, coins, amount, trans_id, method, currency, telegram_id, state } = req.body;

  // Check if all required fields are provided
  if (!payment_link || !coins || !amount || !trans_id || !method || !currency || !telegram_id || !state) {
    console.error('Validation Error: Missing required fields', { payment_link, coins, amount, trans_id, method, currency, telegram_id, state });
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Log the data being inserted for debugging
    console.log('Attempting to insert into database:', { payment_link, coins, amount, trans_id, method, currency, telegram_id, state });

    // Insert deposit details into the database
    const [result] = await db.query(
      'INSERT INTO deposit (payment_link, coins, amount, trans_id, method, currency, telegram_id, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [payment_link, coins, amount, trans_id, method, currency, telegram_id, state]
    );

    // Log the result of the insertion
    console.log('Data inserted successfully with ID:', result.insertId);

    // Return a success response
    res.status(200).json({ message: 'Data inserted successfully', id: result.insertId });
  } catch (err) {
    // Log the full error for debugging
    console.error('Error inserting data into the database:', {
      message: err.message,
      stack: err.stack,
      sql: err.sql,
      sqlMessage: err.sqlMessage,
    });

    // Return an error response
    res.status(500).json({ message: 'Failed to insert data into the database', error: err.message });
  }
});

app.get('/api/deposits', async (req, res) => {
  try {
    // Fetch all records from the deposit table
    const [results] = await db.query('SELECT * FROM deposit');

    // Return all records in the response
    res.status(200).json({ status: 'success', deposits: results });
  } catch (err) {
    console.error('Error fetching data from deposit:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch deposit data', error: err.message });
  }
});
// Update or delete product
app.route('/api/products/:id')
  .put((req, res) => {
    const { id } = req.params;
    const { name, price, image } = req.body;
    db.query('UPDATE products SET name = ?, price = ?, image = ? WHERE id = ?', [name, price, image, id])
      .then(() => res.json({ id, name, price, image }))
      .catch(() => res.status(500).send('Error updating product'));
  })
  .delete((req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE id = ?', [id])
      .then(() => res.status(204).send())
      .catch(() => res.status(500).send('Error deleting product'));
  });

// User Funds API
app.post('/api/getFunds', async (req, res) => {
  const { telegram_id } = req.body;

  if (!telegram_id) {
    return res.status(400).json({ message: 'Telegram ID is required' });
  }

  try {
    let user = await getUser(telegram_id);
    if (!user) {
      // If the user doesn't exist, send the bot link and the page to redirect after
      const botLink = "https://t.me/King2game_shop2_bot"; // Telegram bot link
      const registerPage = "/KRegister"; // Redirect to /KRegister page in the same app
      return res.status(200).json({ redirectBot: botLink, redirectPage: registerPage });
    }

    // Ensure the balance is returned as a float with 2 decimal places
    const balance = parseFloat(user.balance) || 0;

    // Round the balance to two decimal places
    const roundedBalance = balance.toFixed(2); 

    // Return the rounded balance
    res.status(200).json({ balance: roundedBalance });
  } catch (err) {
    console.error("Error in /api/getFunds:", err);
    res.status(500).json({ message: 'Error fetching balance', error: err.message });
  }
});

// Add funds API
app.post('/api/addFunds', async (req, res) => {
  const { telegramUserId, amount } = req.body;
  if (!telegramUserId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid user ID or amount' });
  }

  try {
    const result = await db.query('UPDATE users SET funds = funds + ? WHERE telegramUserId = ?', [amount, telegramUserId]);
    if (result[0].affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Funds added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding funds', error: err.message });
  }
});

// Deduct funds API
app.post('/api/deductFunds', async (req, res) => {
  const { telegram_id, amount, gameUserId, cartItems } = req.body;

  if (!telegram_id || !amount || !gameUserId || !cartItems || !cartItems.length) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Fetch the current balance for the user
    const [userData] = await db.query('SELECT balance FROM telegram_users WHERE telegram_id = ?', [telegram_id]);
    if (!userData || userData.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentBalance = userData[0].balance;
    if (currentBalance < amount) {
      return res.status(400).json({ message: "Insufficient funds." });
    }

    const newBalance = currentBalance - amount;

    // Create a new order_details array with only title and quantity
    const filteredOrderDetails = cartItems.map(item => ({
      title: item.title,
      quantity: item.quantity
    }));

    // Format the current date to 'YYYY-MM-DD HH:MM:SS' format for MySQL
    const transactionTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Update the user's balance in the database
    await db.query('UPDATE telegram_users SET balance = ? WHERE telegram_id = ?', [newBalance, telegram_id]);

    // Insert the order into HoldOrders table with state set to "Send"
    await db.query('INSERT INTO HoldOrders (telegram_id, game_user_id, order_details, total_price, transaction_time, state) VALUES (?, ?, ?, ?, ?, ?)', [
      telegram_id, gameUserId, JSON.stringify(filteredOrderDetails), amount, transactionTime, 'Send'
    ]);

    // Send the response with updated balance
    res.status(200).json({ message: "Payment processed successfully.", remainingFunds: newBalance });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
});



// Send order confirmation to Telegram
const BOT_TOKEN = '7754966695:AAEwt9Xz4J3Q1CijW00wvK01xHr_Y-U76W8'; // Replace with your actual bot token
const CHAT_ID = '5800924684';
app.post('/api/sendConfirmation', upload.single('file'), async (req, res) => {
  const { telegramUserId, paymentMethod, amount, convertedAmount, currency } = req.body;
  if (!telegramUserId || !paymentMethod || !amount || !convertedAmount || !currency || !req.file) {
    return res.status(400).json({ message: 'Invalid input. All fields are required.' });
  }

  const message = `💳 *Order Confirmation*:
  - *UserID: ${telegramUserId}
  - *Funds: + ${amount}
  - *Paid: ${convertedAmount} ${currency}
  - *Payment Method: ${paymentMethod}
  - *Transaction Time: ${new Date().toLocaleString()}`;

  const photoPath = path.join(uploadDir, req.file.filename);
  const formData = new FormData();
  formData.append("chat_id", CHAT_ID);
  formData.append("caption", message);
  formData.append("photo", fs.createReadStream(photoPath));

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: formData,
    });

    const result = await telegramResponse.json();
    if (result.ok) {
      res.status(200).json({ message: "Order confirmation with photo sent successfully to the bot." });
    } else {
      res.status(500).json({ message: "Failed to send order confirmation and photo.", error: result });
    }
  } catch (error) {
    console.error("Error sending order confirmation to Telegram:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
});
app.post('/api/storeOrderConfirmation', async (req, res) => {
  const { telegramUserId, amount, convertedAmount, currency, paymentMethod, imageUrl } = req.body;
  
  if (!telegramUserId || !amount || !convertedAmount || !currency || !paymentMethod || !imageUrl) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const [existingUser] = await db.query('SELECT * FROM telegram_users WHERE telegram_id = ?', [telegramUserId]);
    if (!existingUser || existingUser.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Insert the order into the OrderConfirm table, including ImageUrl and setting state to "Send"
    await db.query('INSERT INTO OrderConfirm (telegram_id, AddedBalance, Paid, PaymentMethod, TransactionTime, ImageUrl, state) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      telegramUserId, amount, convertedAmount, paymentMethod, new Date(), imageUrl, "Send"
    ]);

    res.status(200).json({ message: "Order stored successfully." });
  } catch (error) {
    console.error("Error storing order confirmation:", error);
    res.status(500).json({ message: "Failed to store order confirmation.", error: error.message });
  }
});
const getMembership = async (telegram_id) => {
  try {
    const [rows] = await db.query('SELECT membership FROM telegram_users WHERE telegram_id = ?', [telegram_id]);
    return rows.length > 0 ? rows[0].membership : null;
  } catch (err) {
    console.error('Error fetching membership:', err);
    throw err;
  }
};

// Helper function: Update membership
const updateMembership = async (telegram_id, membership) => {
  try {
    const [result] = await db.query('UPDATE telegram_users SET membership = ? WHERE telegram_id = ?', [membership, telegram_id]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error('Error updating membership:', err);
    throw err;
  }
};

// API endpoint: Get membership
app.post('/api/getMembership', async (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) {
    return res.status(400).json({ message: 'Telegram ID is required' });
  }

  try {
    const membership = await getMembership(telegram_id);
    if (membership === null) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ membership });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching membership', error: err.message });
  }
});

// API endpoint: Update membership
app.post('/api/updateMembership', async (req, res) => {
  const { telegram_id, membership } = req.body;
  if (!telegram_id || !membership) {
    return res.status(400).json({ message: 'Telegram ID and membership status are required' });
  }

  try {
    const updated = await updateMembership(telegram_id, membership);
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Membership updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating membership', error: err.message });
  }
});

// Store order confirmation in database
app.post('/api/deductFunds', async (req, res) => {
  const { telegram_id, amount, gameUserId, cartItems } = req.body;
  if (!telegram_id || !amount || !gameUserId || !cartItems || !cartItems.length) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Get the user data to confirm the user exists
    const [userData] = await db.query('SELECT balance FROM telegram_users WHERE telegram_id = ?', [telegram_id]);
    if (!userData || !userData.length) return res.status(404).json({ message: "User not found." });

    const currentBalance = userData[0].balance;
    if (currentBalance < amount) return res.status(400).json({ message: "Insufficient funds." });

    // Deduct balance
    const newBalance = currentBalance - amount;
    await db.query('UPDATE telegram_users SET balance = ? WHERE telegram_id = ?', [newBalance, telegram_id]);

    // Insert the order into HoldOrders table with deducted balance
    await db.query('INSERT INTO HoldOrders (telegram_id, game_user_id, order_details, total_price, transaction_time) VALUES (?, ?, ?, ?, ?)', [
      telegram_id, gameUserId, JSON.stringify(cartItems), amount, new Date().toISOString()
    ]);

    // Send the response back with the updated balance
    res.status(200).json({ message: "Payment processed successfully.", remainingFunds: newBalance });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
