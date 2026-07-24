const express = require('express');
const crypto = require('crypto');
const { initDb, run, get, addAuditEvent } = require('../db');

const router = express.Router();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createWalletId(email) {
  const hash = Array.from(email || 'blockchain-user').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `0x${hash.toString(16).padStart(8, '0')}`;
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    initDb();
    const existing = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const wallet = createWalletId(email);
    const result = await run(
      'INSERT INTO users (name, email, password_hash, wallet, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), hashPassword(password), wallet, new Date().toISOString(), new Date().toISOString()],
    );

    await addAuditEvent('signup', `Account created for ${email}`, result.lastID);

    res.json({
      id: result.lastID,
      name,
      email: email.toLowerCase(),
      wallet,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    initDb();
    const user = await get(
      'SELECT id, name, email, wallet FROM users WHERE email = ? AND password_hash = ?',
      [email.toLowerCase(), hashPassword(password)],
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await run('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), user.id]);
    await addAuditEvent('login', `User logged in: ${email}`, user.id);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      wallet: user.wallet,
      message: 'Login successful',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
