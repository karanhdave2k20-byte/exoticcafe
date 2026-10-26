const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aura';
const client = new MongoClient(uri);

let db = null;

async function connectDb() {
  if (db) return db;
  
  try {
    await client.connect();
    db = client.db();
    console.log('✅ Connected to MongoDB successfully');
    
    // Auto-seed the tables collection
    await seedTables(db);
    // Auto-seed menu collection
    await seedMenu(db);
    
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

async function seedTables(database) {
  try {
    const tablesCol = database.collection('tables');
    const count = await tablesCol.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding default tables in MongoDB...');
      const defaultTables = [
        { id: 1, status: 'Free', seats: 4, guestNames: [], currentSessionId: null },
        { id: 2, status: 'Free', seats: 2, guestNames: [], currentSessionId: null },
        { id: 3, status: 'Free', seats: 6, guestNames: [], currentSessionId: null },
        { id: 4, status: 'Free', seats: 4, guestNames: [], currentSessionId: null },
        { id: 5, status: 'Free', seats: 4, guestNames: [], currentSessionId: null },
        { id: 6, status: 'Free', seats: 2, guestNames: [], currentSessionId: null },
        { id: 7, status: 'Free', seats: 8, guestNames: [], currentSessionId: null },
        { id: 8, status: 'Free', seats: 4, guestNames: [], currentSessionId: null }
      ];
      await tablesCol.insertMany(defaultTables);
      console.log('✅ Tables seeded successfully');
    }
  } catch (err) {
    console.error('❌ Error seeding tables:', err.message);
  }
}

async function seedMenu(database) {
  try {
    const menuCol = database.collection('menu');

    const DISH_IMAGE_MAP = {
      1: '/fries.jpg', // Crispy Peri-Peri Fries
      2: '/crostini.jpg', // Paneer Tikka Crostini
      3: '/margherita_pizza.jpg', // Truffle Margherita Pizza
      4: '/farmhouse_pizza.jpg', // Smoked Farmhouse Pizza
      5: '/burger.jpg', // Double Brioche Crunch Burger
      6: '/spicy_burger.jpg', // Spicy Chipotle Veg Burger
      7: '/panini.jpg', // Grilled Pesto Panini Sandwich
      8: '/penne_alfredo.jpg', // Creamy Alfredo Penne
      9: '/espresso.png', // Artisan Espresso
      10: '/cappuccino.png', // Golden Crema Cappuccino
      11: '/frappe.jpg', // Iced Salted Caramel Frappé
      12: '/brownie.jpg', // Dark Chocolate Fudge Brownie
      13: '/cheesecake.png', // Vanilla Bean Cheesecake
      14: '/combo.jpg', // Table Hive Fiesta Combo
      16: '/hazelnut_latte.jpg', // Toasted Hazelnut Latte
    };

    // Purge any egg or non-veg items from existing MongoDB collections
    await menuCol.deleteMany({
      $or: [
        { id: 15 },
        { isVeg: false },
        { name: { $regex: /egg|poached|non-veg|chicken/i } }
      ]
    });

    const sessionsCol = database.collection('table_sessions');
    await sessionsCol.updateMany(
      {},
      {
        $pull: {
          cart: {
            $or: [
              { id: 15 },
              { isVeg: false },
              { name: { $regex: /egg|poached/i } }
            ]
          }
        }
      }
    );

    const count = await menuCol.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding default menu in MongoDB...');
      const defaultMenu = [
        { id: 1, name: 'Crispy Peri-Peri Fries', category: 'Starters', price: 160, img: '/fries.jpg', isVeg: true, rating: 4.8, prepTime: 8, desc: 'Golden potato fries tossed in zesty African peri-peri spice dust with garlic dip.', isAvailable: true, isPopular: true },
        { id: 2, name: 'Paneer Tikka Crostini', category: 'Starters', price: 240, img: '/crostini.jpg', isVeg: true, rating: 4.9, prepTime: 10, desc: 'Smokey tandoori marinated cottage cheese on crusty herb toasted baguette.', isAvailable: true, isBestSeller: true },
        { id: 3, name: 'Truffle Margherita Pizza', category: 'Pizza', price: 420, img: '/margherita_pizza.jpg', isVeg: true, rating: 4.8, prepTime: 15, desc: 'Slow-fermented sourdough crust, San Marzano pomodoro, Fior di Latte, and basil oil.', isAvailable: true, isPopular: true },
        { id: 4, name: 'Smoked Farmhouse Pizza', category: 'Pizza', price: 460, img: '/farmhouse_pizza.jpg', isVeg: true, rating: 4.7, prepTime: 16, desc: 'Bell peppers, red onion, sun-dried tomatoes, roasted garlic, and mozzarella.', isAvailable: true },
        { id: 5, name: 'Double Brioche Crunch Burger', category: 'Burger', price: 280, img: '/burger.jpg', isVeg: true, rating: 4.6, prepTime: 12, desc: 'Charred patty, smoked cheddar melting center, house pickles, and truffle aioli.', isAvailable: true, isBestSeller: true },
        { id: 6, name: 'Spicy Chipotle Veg Burger', category: 'Burger', price: 260, img: '/spicy_burger.jpg', isVeg: true, rating: 4.5, prepTime: 11, desc: 'Crispy vegetable patty layered with smoky chipotle spread and crunchy iceberg.', isAvailable: true },
        { id: 7, name: 'Grilled Pesto Panini Sandwich', category: 'Sandwich', price: 250, img: '/panini.jpg', isVeg: true, rating: 4.7, prepTime: 9, desc: 'Genovese basil pesto, buffalo mozzarella, and vine ripened heirloom tomatoes.', isAvailable: true },
        { id: 8, name: 'Creamy Alfredo Penne', category: 'Main Course', price: 380, img: '/penne_alfredo.jpg', isVeg: true, rating: 4.8, prepTime: 14, desc: 'Rich Parmesan cream sauce, roasted garlic florets, cracked pepper, and fresh parsley.', isAvailable: true, isPopular: true },
        { id: 9, name: 'Artisan Espresso', category: 'Beverages', price: 150, img: '/espresso.png', isVeg: true, rating: 4.8, prepTime: 5, desc: 'Rich double-shot extraction using hand-selected single-origin Arabica beans.', isAvailable: true, isPopular: true },
        { id: 10, name: 'Golden Crema Cappuccino', category: 'Beverages', price: 250, img: '/cappuccino.png', isVeg: true, rating: 4.9, prepTime: 7, desc: 'Silky micro-foam, velvety espresso, and a delicate dusting of Valrhona cocoa.', isAvailable: true, isBestSeller: true },
        { id: 11, name: 'Iced Salted Caramel Frappé', category: 'Beverages', price: 280, img: '/frappe.jpg', isVeg: true, rating: 4.7, prepTime: 6, desc: 'Chilled cold brew whipped with salted caramel, crushed ice, and Chantilly crema.', isAvailable: true, isBestSeller: true },
        { id: 12, name: 'Dark Chocolate Fudge Brownie', category: 'Desserts', price: 220, img: '/brownie.jpg', isVeg: true, rating: 4.9, prepTime: 4, desc: 'Warm 70% Belgian chocolate center topped with warm ganache and sea salt flakes.', isAvailable: true, isPopular: true },
        { id: 13, name: 'Vanilla Bean Cheesecake', category: 'Desserts', price: 350, img: '/cheesecake.png', isVeg: true, rating: 4.9, prepTime: 5, desc: 'Creamy Madagascar vanilla cheesecake resting on a buttery honey-graham crust.', isAvailable: true, isNew: true },
        { id: 14, name: 'Table Hive Fiesta Combo', category: 'Combos', price: 599, img: '/combo.jpg', isVeg: true, rating: 4.9, prepTime: 15, desc: 'Choice of 1 Pizza + 1 Brioche Burger + 2 Iced Beverages. Perfect for sharing!', isAvailable: true, isBestSeller: true },
        { id: 16, name: 'Toasted Hazelnut Latte', category: 'Beverages', price: 300, img: '/hazelnut_latte.jpg', isVeg: true, rating: 4.8, prepTime: 6, desc: 'Roasted hazelnut infusion with velvety espresso and steamed milk.', isAvailable: true }
      ];
      await menuCol.insertMany(defaultMenu);
      console.log('✅ Menu seeded successfully');
    } else {
      // Sync authentic matching images for all dishes in existing MongoDB collection
      for (const [dishId, imgPath] of Object.entries(DISH_IMAGE_MAP)) {
        await menuCol.updateOne({ id: parseInt(dishId) }, { $set: { img: imgPath } });
      }
      console.log('✅ Menu dish images synchronized successfully with authentic food photos');
    }
  } catch (err) {
    console.error('❌ Error seeding menu:', err.message);
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDb() first.');
  }
  return db;
}

module.exports = {
  connectDb,
  getDb,
  client
};
