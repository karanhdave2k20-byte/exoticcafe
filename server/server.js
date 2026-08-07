require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const os = require('os');
const { connectDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🚀 PREPARE FRONTEND SERVING
const path = require('path');
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// 🚀 DATABASE CONNECTION
console.log('✅ MongoDB Integration Active');

// In production, transition this 'otpStore' object to Redis. For now it is memory based.
const otpStore = {};

// Expose Server IP for Mobile Phone QR Code Scanning
app.get('/api/get-ip', (req, res) => {
  const fs = require('fs');
  const tunnelPath = path.join(__dirname, '../tunnel_url.txt');
  let tunnelUrl = null;
  
  if (fs.existsSync(tunnelPath)) {
    try {
      const content = fs.readFileSync(tunnelPath, 'utf8');
      const match = content.match(/https?:\/\/[^\s]+/);
      if (match) tunnelUrl = match[0];
    } catch(e) {}
  }

  const nets = os.networkInterfaces();
  let ip = '127.0.0.1'; // Safest default
  
  // High-reliability IP detection logic
  const interfaceKeys = Object.keys(nets);
  for (const name of interfaceKeys) {
    for (const net of nets[name]) {
      // Focus on IPv4 and skip internal/virtual/loopback
      if (net.family === 'IPv4' && !net.internal) {
        // Prioritize physical Wi-Fi or Ethernet interfaces for real device testing
        const lowerName = name.toLowerCase();
        if (lowerName.includes('wi-fi') || lowerName.includes('wlan') || lowerName.includes('ethernet') || lowerName.includes('en0')) {
           return res.status(200).json({ ip: net.address, tunnelUrl });
        }
        ip = net.address; // Valid IPv4 fallback
      }
    }
  }
  res.status(200).json({ ip, tunnelUrl });
});

// Proxy for QR Codes to avoid CORS download issues
app.get('/api/proxy-qr', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL required');
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Proxy error');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', `attachment; filename="qr-code.png"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Proxy failure');
  }
});

// Polling Sync Endpoint
app.get('/api/database/sync', async (req, res) => {
  try {
    const db = getDb();
    const [tables, orders, feedback, customers, payments, bookings, waiterCalls] = await Promise.all([
      db.collection('tables').find({}).sort({ id: 1 }).toArray(),
      db.collection('orders').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('feedback').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('customers').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('payments').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('waiter_calls').find({ status: 'Active' }).sort({ createdAt: -1 }).toArray()
    ]);
    res.json({ tables, orders, feedback, customers, payments, bookings, waiterCalls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database mapping error" });
  }
});

// Create Order Endpoint
app.post('/api/database/orders', async (req, res) => {
  try {
    const db = getDb();
    const newOrder = {
      ...req.body,
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date(),
      updatedAt: new Date()
    };
    await db.collection('orders').insertOne(newOrder);

    // Robustly extract the table number (handles "1", "Table 1", "table-1", etc)
    const tableNumberMatch = String(newOrder.t).match(/\d+/);
    if (tableNumberMatch && String(newOrder.t).toLowerCase() !== 'takeaway') {
      const tableIdInt = parseInt(tableNumberMatch[0]);
      await db.collection('tables').updateOne({ id: tableIdInt }, { $set: { status: 'Occupied' } });
    }

    // Update Customer Lifetime Value (LTV) if contact exists
    if (newOrder.contact) {
      const customer = await db.collection('customers').findOne({ c: newOrder.contact });
      if (customer) {
        const newLtv = (parseFloat(customer.l) || 0) + (parseFloat(newOrder.rawAmount) || 0);
        await db.collection('customers').updateOne({ c: newOrder.contact }, { $set: { l: newLtv, updatedAt: new Date() } });
      }
    }
    
    // Fetch newly compiled orders to sync Realtime state
    const currentOrders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    res.status(200).json({ success: true, orders: currentOrders });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Update Table Endpoint
app.get('/api/database/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const table = await db.collection('tables').findOne({ id: parseInt(id) });
    if (table) {
      res.status(200).json(table);
    } else {
      res.status(404).json({ error: "Table not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch table" });
  }
});

app.post('/api/database/tables/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = getDb();
    const updatePayload = { status };
    if (status === 'Free') updatePayload.guestNames = [];
    await db.collection('tables').updateOne({ id: parseInt(id) }, { $set: updatePayload });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update table status" });
  }
});

app.post('/api/database/tables/:id/guests', async (req, res) => {
  try {
    const { id } = req.params;
    const { guestNames } = req.body;
    const db = getDb();
    await db.collection('tables').updateOne({ id: parseInt(id) }, { $set: { guestNames, status: 'Occupied' } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update table guests" });
  }
});

// Update Order Status Endpoint
app.post('/api/database/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = getDb();
    
    await db.collection('orders').updateOne({ o: id }, { $set: { s: status, updatedAt: new Date() } });
    const order = await db.collection('orders').findOne({ o: id });

    if (order && order.contact) {
      sendWhatsAppNotification(order.contact, `Hello! Your Order #${id} is now ${status}. Enjoy your time at Exotic Café!`);
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Delete Order Endpoint
app.delete('/api/database/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await db.collection('orders').deleteOne({ o: id });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// Dangerous Hard Reset Endpoint (For Admin Dev Use)
app.delete('/api/database/reset', async (req, res) => {
  try {
    const db = getDb();
    await Promise.all([
      db.collection('orders').deleteMany({}),
      db.collection('payments').deleteMany({}),
      db.collection('customers').deleteMany({}),
      db.collection('feedback').deleteMany({}),
      db.collection('waiter_calls').deleteMany({}),
      db.collection('tables').updateMany({}, { $set: { status: 'Free', guestNames: [] } })
    ]);
    res.status(200).json({ success: true, message: "Database wiped completely!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset Database" });
  }
});

// Create Table Endpoint
app.post('/api/database/tables', async (req, res) => {
  try {
    const { seats } = req.body;
    const db = getDb();
    
    const highest = await db.collection('tables').find({}).sort({ id: -1 }).limit(1).toArray();
    const newId = highest.length > 0 ? highest[0].id + 1 : 1;
    
    await db.collection('tables').insertOne({ id: newId, status: 'Free', seats: seats || 4, guestNames: [] });
    const allTables = await db.collection('tables').find({}).sort({ id: 1 }).toArray();
    
    res.status(200).json({ success: true, tables: allTables });
  } catch (error) {
    res.status(500).json({ error: "Failed to create table" });
  }
});

app.delete('/api/database/customers/:contact', async (req, res) => {
  try {
    const { contact } = req.params;
    const db = getDb();
    await db.collection('customers').deleteOne({ c: contact });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

// Submit Customer Endpoint
app.post('/api/database/customers', async (req, res) => {
  try {
    const db = getDb();
    const newC = {
      ...req.body,
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date(),
      updatedAt: new Date()
    };
    
    const existing = await db.collection('customers').findOne({ c: newC.c });
    if (existing) {
      await db.collection('customers').updateOne(
        { c: newC.c },
        { $set: { v: (existing.v || 0) + 1, updatedAt: new Date() } }
      );
    } else {
      await db.collection('customers').insertOne(newC);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit customer" });
  }
});

// Submit Payment Endpoint
app.post('/api/database/payments', async (req, res) => {
  try {
    const db = getDb();
    const payment = {
      ...req.body,
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date()
    };
    await db.collection('payments').insertOne(payment);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit payment" });
  }
});

// Submit Feedback Endpoint
app.post('/api/database/feedback', async (req, res) => {
  try {
    const db = getDb();
    const feedbackDoc = {
      ...req.body,
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date()
    };
    await db.collection('feedback').insertOne(feedbackDoc);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

// Create Booking Endpoint
app.post('/api/database/bookings', async (req, res) => {
  try {
    const db = getDb();
    const bookingDoc = {
      ...req.body,
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date()
    };
    await db.collection('bookings').insertOne(bookingDoc);
    const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// Waiter Call Endpoints
app.post('/api/database/waiter-calls', async (req, res) => {
  try {
    const { tableId } = req.body;
    const db = getDb();
    const existing = await db.collection('waiter_calls').findOne({ tableId, status: 'Active' });
    if (existing) {
      await db.collection('waiter_calls').updateOne({ _id: existing._id }, { $set: { updatedAt: new Date() } });
    } else {
      await db.collection('waiter_calls').insertOne({
        tableId,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create waiter call" });
  }
});

app.get('/api/database/waiter-calls', async (req, res) => {
  try {
    const db = getDb();
    const calls = await db.collection('waiter_calls').find({ status: 'Active' }).toArray();
    res.json(calls || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch waiter calls" });
  }
});

app.post('/api/database/waiter-calls/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await db.collection('waiter_calls').updateOne({ _id: new ObjectId(id) }, { $set: { status: 'Resolved', updatedAt: new Date() } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve waiter call" });
  }
});

// Mock WhatsApp Notification
const sendWhatsAppNotification = (contact, message) => {
  console.log(`[WHATSAPP MOCK] Sent to ${contact}: ${message}`);
};

// 🚀 PRODUCTION GMAIL SETUP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ SMTP CONNECTION FAILED:', error.message);
    console.warn('⚠️  TIP: Check your GMAIL_USER and GMAIL_PASS in .env');
    console.warn('⚠️  TIP: Ensure you are using an "App Password", not your regular password.');
  } else {
    console.log('📬 SMTP Mail Server is ready to deliver OTPs');
  }
});

// Helper function to hash OTP securely 
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { contact, isLogin, name, password } = req.body; 
    if (!contact) return res.status(400).json({ error: 'Contact required' });

    const db = getDb();
    const existing = await db.collection('customers').findOne({ c: contact });

    if (isLogin === false && existing) {
      return res.status(400).json({ error: 'You already have an account! Please switch to Login.' });
    }
    if (isLogin === true && !existing) {
      return res.status(400).json({ error: 'Account not found! Please create a new account first.' });
    }

    if (isLogin === true && existing && existing.p && password && existing.p !== password) {
       return res.status(401).json({ error: 'Incorrect password! Please try again.' });
    }

    const existingRecord = otpStore[contact];
    if (existingRecord && (Date.now() - existingRecord.requestedAt < 60000)) {
      const waitTime = Math.ceil((60000 - (Date.now() - existingRecord.requestedAt)) / 1000);
      return res.status(429).json({ error: `Please wait ${waitTime}s before requesting a new OTP.` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    otpStore[contact] = {
      hashedOtp: hashOTP(otp),
      expires: Date.now() + 5 * 60 * 1000, 
      requestedAt: Date.now(),
      attempts: 0,
      name, 
      password 
    };

    const isEmail = contact.includes('@');
    if (isEmail && process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: `"Exotic Cafe" <${process.env.GMAIL_USER}>`,
          to: contact,
          subject: "Your Cafe Auth OTP Code",
          text: `Your requested EXOTIC CAFE OTP is: ${otp}. It expires in 5 minutes. Do not share this with anyone.`,
        });
        console.log(`[AUTH] Secure OTP delivered to ${contact}`);
        return res.status(200).json({ message: "OTP sent to your email successfully!" });
      } catch (err) {
        console.error("[AUTH] GMAIL ERROR:", err.message);
        // Fallback for development: Log the OTP to console so the dev can proceed even if SMTP fails
        if (process.env.NODE_ENV === 'development') {
          console.log(`\n🚨 [DEV FALLBACK] SMTP failed, but here is the OTP: ${otp}\n`);
          return res.status(200).json({ 
            message: "Development mode fallback active. OTP printed to server console.",
            mockOtp: otp 
          });
        }
        return res.status(500).json({ 
          error: "Email delivery failed. Check project logs or your SMTP credentials."
        });
      }
    } else {
      // For non-email contacts, or if SMTP is not configured
      console.log(`[MOCK OTP] -> ${contact} -> ${otp}`);
      return res.status(200).json({ 
        message: "OTP simulation successful.", 
        mockOtp: otp 
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { contact, otp } = req.body;
    if (!contact || !otp) return res.status(400).json({ error: "Contact and OTP are required." });

    const record = otpStore[contact];
    if (!record) return res.status(400).json({ error: "No OTP requested for this contact." });
    if (Date.now() > record.expires) {
      delete otpStore[contact];
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    record.attempts += 1;
    const hashedInput = hashOTP(otp);

    if (record.hashedOtp !== hashedInput) {
      if (record.attempts >= 3) {
        delete otpStore[contact];
        return res.status(403).json({ error: "Max attempts reached (3/3). Request a new one." });
      }
      return res.status(400).json({ error: `Invalid OTP. You have ${3 - record.attempts} attempts left.` });
    }

    const db = getDb();
    let existing = await db.collection('customers').findOne({ c: contact });
    if (!existing && record.name) {
       const newCustomer = {
         n: record.name,
         c: contact,
         p: record.password,
         v: 1,
         l: 0,
         createdAt: new Date(),
         updatedAt: new Date()
       };
       await db.collection('customers').insertOne(newCustomer);
       existing = newCustomer;
    }

    delete otpStore[contact]; 

    res.status(200).json({ 
      message: "Authentication successful.",
      token: "jwt-token-premium-secure-7392",
      userName: existing ? existing.n : null
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// 🚀 INVITE FRIENDS ENDPOINT (EMAIL / SMS)
app.post('/api/auth/invite', async (req, res) => {
  try {
    const { tableNo, contacts } = req.body;
    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Contacts array required' });
    }

    // Resolve correct accessible host on the server
    const fs = require('fs');
    const path = require('path');
    const tunnelPath = path.join(__dirname, '../tunnel_url.txt');
    let activeTunnelUrl = null;
    if (fs.existsSync(tunnelPath)) {
      try {
        const content = fs.readFileSync(tunnelPath, 'utf8');
        const match = content.match(/https?:\/\/[^\s]+/);
        if (match) activeTunnelUrl = match[0];
      } catch(e) {}
    }

    // Detect Server IP
    const nets = os.networkInterfaces();
    let serverIp = '127.0.0.1';
    let ipFound = false;
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          const lowerName = name.toLowerCase();
          if (lowerName.includes('wi-fi') || lowerName.includes('wlan') || lowerName.includes('ethernet') || lowerName.includes('en0')) {
             serverIp = net.address;
             ipFound = true;
             break;
          }
          serverIp = net.address;
        }
      }
      if (ipFound) break;
    }

    const host = activeTunnelUrl || `http://${serverIp}:5174`;
    const resolvedTableUrl = `${host}/table/${tableNo}?invite=true`;

    const emailInvites = contacts.filter(c => c.includes('@'));
    const phoneInvites = contacts.filter(c => !c.includes('@'));

    // Log phone invites to console (simulate SMS/WhatsApp)
    phoneInvites.forEach(phone => {
      console.log(`[SMS MOCK] Invite sent to ${phone}: Join Table ${tableNo} at ${resolvedTableUrl}`);
    });

    if (emailInvites.length > 0 && process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      const emailPromises = emailInvites.map(email => {
        return transporter.sendMail({
          from: `"Exotic Cafe" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: `Join Table ${tableNo} at Exotic Café! ☕`,
          html: `
            <div style="font-family: sans-serif; background-color: #f7f3eb; padding: 2.5rem; border-radius: 16px; border: 1px solid #e2d9cf; max-width: 500px; margin: 0 auto; color: #1e3a2f;">
              <h2 style="color: #6f4e37; text-align: center; margin-bottom: 1.5rem;">You're Invited! 🍽️</h2>
              <p style="font-size: 1.1rem; line-height: 1.6; text-align: center;">
                Your friend wants you to join their table session at <strong>Exotic Café</strong>.
              </p>
              <div style="background-color: #ffffff; padding: 1.5rem; border-radius: 12px; margin: 2rem 0; text-align: center; border: 1px solid #e2d9cf;">
                <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #8c8c8c; text-transform: uppercase; letter-spacing: 1px;">Session Table</p>
                <h3 style="margin: 0; color: #6f4e37; font-size: 2rem;">Table ${tableNo}</h3>
              </div>
              <div style="text-align: center;">
                <a href="${resolvedTableUrl}" style="display: inline-block; background-color: #6f4e37; color: #ffffff; padding: 1rem 2rem; border-radius: 50px; font-weight: bold; text-decoration: none; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(111,78,55,0.25);">
                  Join Table & Order
                </a>
              </div>
              <p style="font-size: 0.85rem; color: #8c8c8c; text-align: center; margin-top: 2rem;">
                If the button doesn't work, copy this link: <br/>
                <a href="${resolvedTableUrl}" style="color: #6f4e37;">${resolvedTableUrl}</a>
              </p>
            </div>
          `
        });
      });

      await Promise.all(emailPromises);
      console.log(`[INVITE] Emails successfully sent to ${emailInvites.join(', ')}`);
    }

    res.status(200).json({ success: true, message: "Invites delivered successfully!" });
  } catch (error) {
    console.error("[INVITE] Error sending emails:", error.message);
    res.status(200).json({ success: true, fallback: true, message: "Invites simulated." });
  }
});

// 🚀 CATCH-ALL FOR REACT ROUTING (SPA)
app.get(/^.*$/, (req, res) => {
  const fs = require('fs');
  const indexHtmlPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    res.status(200).json({ status: "ok", message: "Exotic Cafe Backend API is active" });
  }
});

const PORT = process.env.PORT || 3001;
connectDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Node Backend running on port ${PORT}`));
}).catch(err => {
  console.error("Failed to start server due to database connection error:", err);
  process.exit(1);
});
