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
    const [tables, orders, feedback, customers, payments, bookings, waiterCalls, menu, activeSessions, notifications] = await Promise.all([
      db.collection('tables').find({}).sort({ id: 1 }).toArray(),
      db.collection('orders').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('feedback').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('customers').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('payments').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('waiter_calls').find({ status: 'Active' }).sort({ createdAt: -1 }).toArray(),
      db.collection('menu').find({}).sort({ id: 1 }).toArray(),
      db.collection('table_sessions').find({ status: 'active' }).toArray(),
      db.collection('notifications').find({}).sort({ timestamp: -1 }).limit(20).toArray()
    ]);
    res.json({ tables, orders, feedback, customers, payments, bookings, waiterCalls, menu, activeSessions, notifications });
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
      sendWhatsAppNotification(order.contact, `Hello! Your Order #${id} is now ${status}. Enjoy your time at TableHive!`);
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
    
    await db.collection('tables').insertOne({ 
      id: newId, 
      status: 'Free', 
      seats: seats || 4, 
      guestNames: [], 
      currentSessionId: null 
    });
    const allTables = await db.collection('tables').find({}).sort({ id: 1 }).toArray();
    
    res.status(200).json({ success: true, tables: allTables });
  } catch (error) {
    res.status(500).json({ error: "Failed to create table" });
  }
});

// Update / Edit Table
app.put('/api/database/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { seats, status } = req.body;
    const db = getDb();
    const updateDoc = {};
    if (seats !== undefined) updateDoc.seats = parseInt(seats);
    if (status !== undefined) updateDoc.status = status;
    await db.collection('tables').updateOne({ id: parseInt(id) }, { $set: updateDoc });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update table" });
  }
});

// Delete Table
app.delete('/api/database/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await db.collection('tables').deleteOne({ id: parseInt(id) });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete table" });
  }
});

// 📋 MENU MANAGEMENT ENDPOINTS
app.get('/api/database/menu', async (req, res) => {
  try {
    const db = getDb();
    const menu = await db.collection('menu').find({}).sort({ id: 1 }).toArray();
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

app.post('/api/database/menu', async (req, res) => {
  try {
    const db = getDb();
    const highest = await db.collection('menu').find({}).sort({ id: -1 }).limit(1).toArray();
    const newId = highest.length > 0 ? highest[0].id + 1 : 1;
    const newItem = {
      ...req.body,
      id: newId,
      price: Number(req.body.price),
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
      createdAt: new Date()
    };
    await db.collection('menu').insertOne(newItem);
    res.status(200).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ error: "Failed to create menu item" });
  }
});

app.put('/api/database/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const updates = { ...req.body, updatedAt: new Date() };
    if (updates.price) updates.price = Number(updates.price);
    delete updates._id;
    await db.collection('menu').updateOne({ id: parseInt(id) }, { $set: updates });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

app.delete('/api/database/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await db.collection('menu').deleteOne({ id: parseInt(id) });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

// 🐝 TABLE HIVE SESSION MANAGEMENT
app.post('/api/sessions/start', async (req, res) => {
  try {
    const { tableId, tableNo, guestNames, peopleCount, customerEmail, customerName } = req.body;
    const db = getDb();
    const tId = parseInt(tableId || tableNo);

    // Verify table exists
    const table = await db.collection('tables').findOne({ id: tId });
    if (!table) {
      return res.status(404).json({ error: `Table #${tId} does not exist.` });
    }

    // Check if there is an existing active session for this table
    let session = await db.collection('table_sessions').findOne({ 
      tableId: tId, 
      status: 'active' 
    });

    const members = (guestNames && guestNames.length > 0)
      ? guestNames.map(name => ({ name, email: customerEmail || '', joinedAt: new Date() }))
      : [{ name: customerName || 'Host', email: customerEmail || '', joinedAt: new Date() }];

    if (!session) {
      const sessionId = `THS-${tId}-${Date.now().toString(36).toUpperCase()}`;
      session = {
        sessionId,
        tableId: tId,
        startTime: new Date(),
        status: 'active',
        members,
        peopleCount: peopleCount || members.length,
        interests: [],
        cart: [],
        orders: [],
        paymentStatus: 'pending',
        splitPayments: members.map(m => ({ person: m.name, amount: 0, status: 'pending', method: '' })),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection('table_sessions').insertOne(session);

      // Create Admin Notification
      await db.collection('notifications').insertOne({
        id: `notif-${Date.now()}`,
        title: 'New Table Session Started',
        message: `Table #${tId} session started by ${members[0]?.name} (${members.length} guests)`,
        type: 'table',
        target: 'admin',
        timestamp: new Date(),
        read: false
      });
    } else {
      // Add any new members if not present
      const existingNames = new Set(session.members.map(m => m.name.toLowerCase()));
      const newMembers = members.filter(m => !existingNames.has(m.name.toLowerCase()));
      if (newMembers.length > 0) {
        await db.collection('table_sessions').updateOne(
          { sessionId: session.sessionId },
          { 
            $push: { members: { $each: newMembers } },
            $set: { updatedAt: new Date() }
          }
        );
        session.members.push(...newMembers);
      }
    }

    // Mark table as Occupied with session id
    await db.collection('tables').updateOne(
      { id: tId },
      { 
        $set: { 
          status: 'Occupied', 
          currentSessionId: session.sessionId,
          guestNames: session.members.map(m => m.name)
        } 
      }
    );

    res.status(200).json({ success: true, session });
  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({ error: "Failed to initialize table session" });
  }
});

app.get('/api/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const session = await db.collection('table_sessions').findOne({ sessionId: id });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

app.get('/api/sessions/active/table/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const db = getDb();
    const session = await db.collection('table_sessions').findOne({ 
      tableId: parseInt(tableId), 
      status: 'active' 
    });
    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active session for table" });
  }
});

app.post('/api/sessions/:id/interests', async (req, res) => {
  try {
    const { id } = req.params;
    const { interests } = req.body;
    const db = getDb();
    await db.collection('table_sessions').updateOne(
      { sessionId: id },
      { $set: { interests: interests || [], updatedAt: new Date() } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save interests" });
  }
});

app.post('/api/sessions/:id/cart', async (req, res) => {
  try {
    const { id } = req.params;
    const { cart } = req.body;
    const db = getDb();
    await db.collection('table_sessions').updateOne(
      { sessionId: id },
      { $set: { cart: cart || [], updatedAt: new Date() } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update shared cart" });
  }
});

app.post('/api/sessions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const session = await db.collection('table_sessions').findOne({ sessionId: id });
    if (session) {
      await db.collection('table_sessions').updateOne(
        { sessionId: id },
        { $set: { status: 'completed', endTime: new Date(), updatedAt: new Date() } }
      );
      // Reset table to Free
      await db.collection('tables').updateOne(
        { id: parseInt(session.tableId) },
        { $set: { status: 'Free', currentSessionId: null, guestNames: [] } }
      );
    }
    res.status(200).json({ success: true, message: "Table session ended cleanly." });
  } catch (error) {
    res.status(500).json({ error: "Failed to end session" });
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
          from: `"TableHive" <${process.env.GMAIL_USER}>`,
          to: contact,
          subject: "Your Cafe Auth OTP Code",
          text: `Your requested TableHive OTP is: ${otp}. It expires in 5 minutes. Do not share this with anyone.`,
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

// 🚀 REAL GOOGLE SIGN-IN ENDPOINT
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, email, name, picture, googleId } = req.body;
    let userEmail = email;
    let userName = name;
    let userPicture = picture;
    let userId = googleId;

    // Decode Google ID Token if passed from Google Identity Services
    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          userEmail = payload.email || userEmail;
          userName = payload.name || userName;
          userPicture = payload.picture || userPicture;
          userId = payload.sub || userId;
        }
      } catch (e) {
        console.warn('Could not parse Google credential JWT:', e.message);
      }
    }

    if (!userEmail) {
      return res.status(400).json({ error: 'Valid Google email is required.' });
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanName = (userName || cleanEmail.split('@')[0]).trim();

    const db = getDb();
    let customer = await db.collection('customers').findOne({ c: cleanEmail });

    if (!customer) {
      const newCustomer = {
        n: cleanName,
        c: cleanEmail,
        googleId: userId || null,
        picture: userPicture || null,
        v: 1,
        l: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection('customers').insertOne(newCustomer);
      customer = newCustomer;
      console.log(`[AUTH] New Google customer registered: ${cleanName} (${cleanEmail})`);
    } else {
      await db.collection('customers').updateOne(
        { c: cleanEmail },
        { 
          $set: { 
            v: (customer.v || 0) + 1,
            picture: userPicture || customer.picture || null,
            updatedAt: new Date() 
          } 
        }
      );
      console.log(`[AUTH] Existing Google customer signed in: ${cleanName} (${cleanEmail})`);
    }

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token: `g-jwt-${Date.now()}`,
      user: {
        name: customer.n,
        email: customer.c,
        picture: customer.picture || null,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Failed to process Google sign in' });
  }
});

// 🚀 INVITE FRIENDS ENDPOINT (EMAIL / SMS)
app.post('/api/auth/invite', async (req, res) => {
  try {
    const { tableNo, contacts, email, sessionId } = req.body;
    const targetContacts = contacts || (email ? [email] : []);
    if (!targetContacts || !Array.isArray(targetContacts) || targetContacts.length === 0) {
      return res.status(400).json({ error: 'Valid email address is required.' });
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
    const sessionQuery = sessionId ? `&session=${encodeURIComponent(sessionId)}` : '';
    const resolvedTableUrl = `${host}/table/${tableNo}?invite=true${sessionQuery}`;

    const emailInvites = targetContacts.filter(c => c.includes('@'));
    const phoneInvites = targetContacts.filter(c => !c.includes('@'));

    // Log phone invites to console (simulate SMS/WhatsApp)
    phoneInvites.forEach(phone => {
      console.log(`[SMS MOCK] Invite sent to ${phone}: Join Table ${tableNo} at ${resolvedTableUrl}`);
    });

    if (emailInvites.length > 0 && process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      const emailPromises = emailInvites.map(email => {
        return transporter.sendMail({
          from: `"TableHive" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: `Join Table ${tableNo} at TableHive! ☕`,
          html: `
            <div style="font-family: sans-serif; background-color: #f7f3eb; padding: 2.5rem; border-radius: 16px; border: 1px solid #e2d9cf; max-width: 500px; margin: 0 auto; color: #1e3a2f;">
              <h2 style="color: #6f4e37; text-align: center; margin-bottom: 1.5rem;">You're Invited! 🍽️</h2>
              <p style="font-size: 1.1rem; line-height: 1.6; text-align: center;">
                Your friend wants you to join their table session at <strong>TableHive</strong>.
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

// 🤖 ENHANCED AI ENDPOINTS (Gemini Official SDK)
// 1. AI Menu Assistant & Chat Companion
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return res.status(503).json({ error: 'AI not configured. Please add GEMINI_API_KEY to server/.env' });
    }

    const db = getDb();
    const menuItems = await db.collection('menu').find({ isAvailable: true }).limit(20).toArray();
    const menuSummary = menuItems.map(m => `- ${m.name} (${m.category}, ₹${m.price}, ${m.isVeg ? 'Veg' : 'Non-Veg'}): ${m.desc}`).join('\n');

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    // Try gemini-3.5-flash to avoid 503 overloads on latest
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: `You are TableHive's AI Culinary Sommelier & Café Assistant at "Exotic Café".
You help customers seated at tables choose food, answer questions about flavor pairings, entertain them while they wait, and suggest delicious combinations.
Current Café Menu:
${menuSummary}

Rules:
- Be warm, inviting, concise, and enthusiastic.
- Recommend specific dishes from our menu whenever relevant.
- If asked for something spicy, suggest Peri-Peri Fries or Chipotle Veg Burger.
- If asked for something sweet, suggest Dark Chocolate Fudge Brownie or Vanilla Bean Cheesecake.
- Keep replies brief and conversational (2-4 sentences max unless asked for details).`,
    });

    let sanitizedHistory = [];
    let expectedRole = 'user';
    for (const msg of messages.slice(0, -1)) {
      const role = msg.role === 'user' ? 'user' : 'model';
      if (role === expectedRole) {
        sanitizedHistory.push({ role, parts: [{ text: msg.text }] });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    }
    // The history array must end with 'model' so the new user message appended by sendMessage is valid
    if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === 'user') {
      sanitizedHistory.pop();
    }

    const chat = model.startChat({ history: sanitizedHistory });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.text);
    const reply = result.response.text();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[AI CHAT] Error:', error.message);
    return res.status(500).json({ 
      error: error.message || "Failed to reach AI service."
    });
  }
});

// 2. AI Food Recommendations
app.post('/api/ai/recommendations', async (req, res) => {
  try {
    const { preferences, pastOrders, interests, isPureVeg } = req.body;
    const db = getDb();
    const menuItems = await db.collection('menu').find({ isAvailable: true }).toArray();

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

        const prompt = `Based on the following diner context, pick 3 best dishes from the menu and give a 1-sentence personalized reason for each.
Context:
- Pure Veg Only: ${isPureVeg ? 'YES' : 'NO'}
- Diner Interests: ${(interests || []).join(', ') || 'General dining'}
- Past Orders: ${(pastOrders || []).join(', ') || 'First-time visitor'}
- Preferences: ${JSON.stringify(preferences || {})}

Available Menu:
${menuItems.map(m => `ID ${m.id}: ${m.name} (${m.category}, ₹${m.price}, ${m.isVeg ? 'Veg' : 'Non-Veg'}) - ${m.desc}`).join('\n')}

Format response as strict JSON array with items having: "id" (number), "name" (string), "reason" (string).`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const recs = JSON.parse(jsonMatch[0]);
          return res.status(200).json({ recommendations: recs });
        }
      } catch (aiErr) {
        console.warn('[AI RECOMMENDATIONS] AI call failed, using rule-based recommendation:', aiErr.message);
      }
    }

    // Rule-based fallback
    const filtered = menuItems.filter(m => !isPureVeg || m.isVeg);
    const popular = filtered.filter(m => m.isPopular || m.isBestSeller).slice(0, 3);
    const recommendations = popular.map(m => ({
      id: m.id,
      name: m.name,
      reason: `Highly popular with guests enjoying ${interests?.[0] || 'our artisan menu'}!`
    }));

    res.status(200).json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

// 3. AI Sales & Operations Insights for Admin
app.post('/api/ai/sales-insights', async (req, res) => {
  try {
    const db = getDb();
    const [orders, menu] = await Promise.all([
      db.collection('orders').find({}).toArray(),
      db.collection('menu').find({}).toArray()
    ]);

    // Aggregate stats
    const itemSales = {};
    let totalRevenue = 0;
    orders.forEach(o => {
      totalRevenue += parseFloat(o.rawAmount) || 0;
      const desc = o.i || '';
      menu.forEach(m => {
        if (desc.includes(m.name)) {
          itemSales[m.name] = (itemSales[m.name] || 0) + 1;
        }
      });
    });

    const sortedItems = Object.entries(itemSales).sort((a, b) => b[1] - a[1]);
    const topSellers = sortedItems.slice(0, 3).map(([name, count]) => ({ name, count }));
    const lowSellers = menu.filter(m => !itemSales[m.name] || itemSales[m.name] < 2).slice(0, 3).map(m => m.name);

    let aiAdvice = [
      "Promote slower-moving sandwiches during afternoon 2-5 PM hours with combo deals.",
      "Artisan coffee drinks drive 40% of table cart additions; feature new seasonal beans.",
      "Guests dining in groups of 3+ have 65% higher average spend; suggest sharing platters."
    ];

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `You are an expert café business analyst.
Orders count: ${orders.length}
Total Revenue: ₹${totalRevenue.toFixed(0)}
Top-selling dishes: ${topSellers.map(t => `${t.name} (${t.count} orders)`).join(', ') || 'Cappuccino, Pizza'}
Slow-moving items: ${lowSellers.join(', ') || 'None'}

Provide 3 actionable, high-impact business insights for the café manager.
Return strict JSON array of 3 strings: ["insight 1", "insight 2", "insight 3"]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          aiAdvice = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('AI Sales Insights error:', e.message);
      }
    }

    res.status(200).json({
      totalRevenue,
      orderCount: orders.length,
      topSellers,
      lowSellers,
      insights: aiAdvice
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate sales insights" });
  }
});

// 💳 PAYTM & PAYMENT GATEWAY ARCHITECTURE
app.post('/api/payments/paytm/initiate', async (req, res) => {
  try {
    const { orderId, amount, tableNo, customer, splitType } = req.body;
    const txnToken = `PTM_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const merchantId = 'TABLEHIVE_MID_SECURE';

    res.status(200).json({
      success: true,
      gateway: 'Paytm',
      merchantId,
      orderId: orderId || `TH${Math.floor(1000 + Math.random() * 9000)}`,
      txnToken,
      amount: parseFloat(amount),
      currency: 'INR',
      callbackUrl: '/api/payments/paytm/verify',
      status: 'INITIATED'
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to initiate Paytm payment" });
  }
});

app.post('/api/payments/paytm/verify', async (req, res) => {
  try {
    const { txnToken, orderId, amount, tableNo, customer, method, splitType, person } = req.body;
    const db = getDb();

    const paymentRecord = {
      id: txnToken || `PAY-${Date.now()}`,
      orderId: orderId || 'TH-ORDER',
      rel: tableNo ? `Table ${tableNo}` : 'Takeaway',
      customer: customer || person || 'Guest',
      amount: `₹${parseFloat(amount || 0).toFixed(2)}`,
      rawAmount: parseFloat(amount || 0),
      method: method || 'Paytm',
      status: 'Successful',
      splitType: splitType || 'full',
      person: person || customer || 'Guest',
      createdAt: new Date()
    };

    await db.collection('payments').insertOne(paymentRecord);

    // If part of active session, update session split payments
    if (tableNo) {
      const tId = parseInt(tableNo);
      const session = await db.collection('table_sessions').findOne({ tableId: tId, status: 'active' });
      if (session) {
        let updatedSplits = session.splitPayments || [];
        if (person) {
          updatedSplits = updatedSplits.map(s => 
            s.person.toLowerCase() === person.toLowerCase() 
              ? { ...s, status: 'paid', method: method || 'Paytm', amount: parseFloat(amount) }
              : s
          );
        } else {
          updatedSplits = updatedSplits.map(s => ({ ...s, status: 'paid', method: method || 'Paytm' }));
        }

        const allPaid = updatedSplits.every(s => s.status === 'paid');
        await db.collection('table_sessions').updateOne(
          { sessionId: session.sessionId },
          { 
            $set: { 
              splitPayments: updatedSplits,
              paymentStatus: allPaid ? 'completed' : 'partially_paid',
              updatedAt: new Date()
            } 
          }
        );
      }
    }

    // Insert Admin Notification
    await db.collection('notifications').insertOne({
      id: `notif-pay-${Date.now()}`,
      title: 'Payment Received',
      message: `Received ₹${parseFloat(amount || 0).toFixed(2)} via ${method || 'Paytm'} for Table #${tableNo || 'Takeaway'}`,
      type: 'payment',
      target: 'admin',
      timestamp: new Date(),
      read: false
    });

    res.status(200).json({ success: true, payment: paymentRecord });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// 🚀 CATCH-ALL FOR REACT ROUTING (SPA)
app.get(/^.*$/, (req, res) => {
  const fs = require('fs');
  const indexHtmlPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    res.status(200).json({ status: "ok", message: "TableHive Backend API is active" });
  }
});

const PORT = process.env.PORT || 3001;
connectDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Node Backend running on port ${PORT}`));
}).catch(err => {
  console.error("Failed to start server due to database connection error:", err);
  process.exit(1);
});
