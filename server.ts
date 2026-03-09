import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'restaurant', 'retail', 'service', etc.
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    quantity INTEGER DEFAULT 0,
    price REAL DEFAULT 0,
    category TEXT,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    total_amount REAL NOT NULL,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL,
    inventory_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'staff',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    user_id TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    salary REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed initial data if empty
const orgCount = db.prepare("SELECT COUNT(*) as count FROM organizations").get() as { count: number };
if (orgCount.count === 0) {
  const orgId = "org_1";
  db.prepare("INSERT INTO organizations (id, name) VALUES (?, ?)").run(orgId, "OmniBiz Holdings Kenya");

  const businesses = [
    { id: "biz_1", name: "Nyama Choma Hub", type: "restaurant", location: "Westlands, Nairobi" },
    { id: "biz_2", name: "Kasarani Fresh Butchery", type: "butchery", location: "Kasarani" },
    { id: "biz_3", name: "Mombasa Road Mart", type: "retail", location: "Mombasa Road" }
  ];

  for (const biz of businesses) {
    db.prepare("INSERT INTO businesses (id, org_id, name, type, location) VALUES (?, ?, ?, ?, ?)")
      .run(biz.id, orgId, biz.name, biz.type, biz.location);
  }

  // Nyama Choma Hub Inventory
  const invR1 = `inv_biz_1_1`; db.prepare("INSERT INTO inventory (id, business_id, name, sku, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)").run(invR1, "biz_1", "Grilled Goat (1 Kg)", "R-001", 50, 1200, "Food");
  const invR2 = `inv_biz_1_2`; db.prepare("INSERT INTO inventory (id, business_id, name, sku, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)").run(invR2, "biz_1", "Ugali", "R-002", 100, 150, "Food");
  const invR3 = `inv_biz_1_3`; db.prepare("INSERT INTO inventory (id, business_id, name, sku, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)").run(invR3, "biz_1", "Tusker Lager", "R-003", 200, 350, "Beverage");

  // Kasarani Fresh Butchery Inventory
  const invB1 = `inv_biz_2_1`; db.prepare("INSERT INTO inventory (id, business_id, name, sku, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)").run(invB1, "biz_2", "Beef on Bone (1 Kg)", "B-001", 120, 650, "Meat");
  const invB2 = `inv_biz_2_2`; db.prepare("INSERT INTO inventory (id, business_id, name, sku, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)").run(invB2, "biz_2", "Minced Meat (1 Kg)", "B-002", 40, 750, "Meat");
  const invB3 = `inv_biz_2_3`; db.prepare("INSERT INTO inventory (id, business_id, name, sku, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)").run(invB3, "biz_2", "Goat Meat (1 Kg)", "B-003", 80, 850, "Meat");

  // Mombasa Road Mart Inventory
  const invM1 = `inv_biz_3_1`; db.prepare("INSERT INTO inventory (id, business_id, name, sku, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)").run(invM1, "biz_3", "Unga wa Ugali (2 Kg)", "M-001", 150, 220, "Groceries");
  const invM2 = `inv_biz_3_2`; db.prepare("INSERT INTO inventory (id, business_id, name, sku, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)").run(invM2, "biz_3", "Milk (500ml)", "M-002", 300, 65, "Dairy");
  const invM3 = `inv_biz_3_3`; db.prepare("INSERT INTO inventory (id, business_id, name, sku, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)").run(invM3, "biz_3", "Omo Washing Powder (500g)", "M-003", 80, 250, "Household");

  // Seed Customers
  const customers = [
    { id: "cust_1", name: "John Kamau", email: "kamau@example.com", phone: "+254711000001" },
    { id: "cust_2", name: "Mary Wanjiku", email: "wanjiku@example.com", phone: "+254722000002" },
    { id: "cust_3", name: "Peter Omondi", email: "omondi@example.com", phone: "+254733000003" },
    { id: "cust_4", name: "Alice Mutuku", email: "mutuku@example.com", phone: "+254744000004" }
  ];
  for (const c of customers) {
    db.prepare("INSERT INTO customers (id, org_id, name, email, phone) VALUES (?, ?, ?, ?, ?)").run(c.id, orgId, c.name, c.email, c.phone);
  }

  // Seed Staff
  const staff = [
    { id: "staff_1", business_id: "biz_1", name: "Chef Njoroge", role: "Head Chef", salary: 45000 },
    { id: "staff_2", business_id: "biz_1", name: "Waitress Auma", role: "Waitress", salary: 25000 },
    { id: "staff_3", business_id: "biz_2", name: "Butcher Kiprono", role: "Head Butcher", salary: 35000 },
    { id: "staff_4", business_id: "biz_3", name: "Cashier Akinyi", role: "Cashier", salary: 28000 }
  ];
  for (const s of staff) {
    db.prepare("INSERT INTO staff (id, business_id, name, role, salary) VALUES (?, ?, ?, ?, ?)").run(s.id, s.business_id, s.name, s.role, s.salary);
  }

  // Seed Sales
  const sales = [
    { id: "sale_1", business_id: "biz_1", amount: 1550, method: "M-Pesa" },
    { id: "sale_2", business_id: "biz_1", amount: 350, method: "Cash" },
    { id: "sale_3", business_id: "biz_2", amount: 1300, method: "M-Pesa" },
    { id: "sale_4", business_id: "biz_3", amount: 485, method: "Card" }
  ];
  for (const s of sales) {
    db.prepare("INSERT INTO sales (id, business_id, total_amount, payment_method) VALUES (?, ?, ?, ?)").run(s.id, s.business_id, s.amount, s.method);
  }

  // Expenses
  db.prepare("INSERT INTO expenses (id, business_id, category, amount, description) VALUES (?, ?, ?, ?, ?)").run("exp_1", "biz_1", "Rent", 25000, "Monthly Rent");
  db.prepare("INSERT INTO expenses (id, business_id, category, amount, description) VALUES (?, ?, ?, ?, ?)").run("exp_2", "biz_2", "Supplies", 15000, "Meat Supplies");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get("/api/init", (req, res) => {
    const totalBusinesses = db.prepare("SELECT COUNT(*) as count FROM businesses").get() as { count: number };
    const totalSales = db.prepare("SELECT SUM(total_amount) as total FROM sales").get() as { total: number };
    const lowStock = db.prepare("SELECT COUNT(*) as count FROM inventory WHERE quantity < 10").get() as { count: number };

    const salesByBusiness = db.prepare(`
      SELECT b.name, SUM(s.total_amount) as value
      FROM businesses b
      LEFT JOIN sales s ON b.id = s.business_id
      GROUP BY b.id
    `).all();

    const businesses = db.prepare("SELECT * FROM businesses").all();
    const inventory = db.prepare("SELECT * FROM inventory").all();
    const staff = db.prepare("SELECT * FROM staff").all();
    const customers = db.prepare("SELECT * FROM customers").all();

    const revenue = db.prepare("SELECT SUM(total_amount) as total FROM sales").get() as { total: number };
    const expenses = db.prepare("SELECT SUM(amount) as total FROM expenses").get() as { total: number };

    res.json({
      metrics: {
        businesses: totalBusinesses.count,
        revenue: totalSales.total || 0,
        lowStock: lowStock.count,
        activeStaff: staff.length
      },
      salesByBusiness,
      businesses,
      inventory,
      staff,
      customers,
      finance: {
        revenue: revenue.total || 0,
        expenses: expenses.total || 0,
        profit: (revenue.total || 0) - (expenses.total || 0)
      }
    });
  });

  // API Routes
  app.get("/api/dashboard/summary", (req, res) => {
    const totalBusinesses = db.prepare("SELECT COUNT(*) as count FROM businesses").get() as { count: number };
    const totalSales = db.prepare("SELECT SUM(total_amount) as total FROM sales").get() as { total: number };
    const lowStock = db.prepare("SELECT COUNT(*) as count FROM inventory WHERE quantity < 10").get() as { count: number };

    const salesByBusiness = db.prepare(`
      SELECT b.name, SUM(s.total_amount) as value
      FROM businesses b
      LEFT JOIN sales s ON b.id = s.business_id
      GROUP BY b.id
    `).all();

    res.json({
      metrics: {
        businesses: totalBusinesses.count,
        revenue: totalSales.total || 0,
        lowStock: lowStock.count,
        activeStaff: 12 // Mocked for now
      },
      salesByBusiness
    });
  });

  app.get("/api/businesses", (req, res) => {
    const businesses = db.prepare("SELECT * FROM businesses").all();
    res.json(businesses);
  });

  app.post("/api/businesses", (req, res) => {
    const { name, type, location } = req.body;
    const id = `biz_${Date.now()}`;
    db.prepare("INSERT INTO businesses (id, org_id, name, type, location) VALUES (?, ?, ?, ?, ?)")
      .run(id, "org_1", name, type, location);
    res.json({ success: true, id });
  });

  app.get("/api/inventory", (req, res) => {
    const { businessId } = req.query;
    let query = "SELECT * FROM inventory";
    const params = [];
    if (businessId) {
      query += " WHERE business_id = ?";
      params.push(businessId);
    }
    const items = db.prepare(query).all(...params);
    res.json(items);
  });

  app.post("/api/inventory", (req, res) => {
    const { businessId, name, sku, quantity, price, category } = req.body;
    const id = `inv_${Date.now()}`;
    db.prepare("INSERT INTO inventory (id, business_id, name, sku, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, businessId, name, sku, quantity, price, category);
    res.json({ success: true, id });
  });

  app.get("/api/staff", (req, res) => {
    const { businessId } = req.query;
    let query = "SELECT * FROM staff";
    const params = [];
    if (businessId) {
      query += " WHERE business_id = ?";
      params.push(businessId);
    }
    const staff = db.prepare(query).all(...params);
    res.json(staff);
  });

  app.get("/api/customers", (req, res) => {
    const customers = db.prepare("SELECT * FROM customers").all();
    res.json(customers);
  });

  app.post("/api/customers", (req, res) => {
    const { name, email, phone } = req.body;
    const id = `cust_${Date.now()}`;
    db.prepare("INSERT INTO customers (id, org_id, name, email, phone) VALUES (?, ?, ?, ?, ?)")
      .run(id, "org_1", name, email, phone);
    res.json({ success: true, id });
  });

  app.get("/api/finance/summary", (req, res) => {
    const revenue = db.prepare("SELECT SUM(total_amount) as total FROM sales").get() as { total: number };
    const expenses = db.prepare("SELECT SUM(amount) as total FROM expenses").get() as { total: number };
    res.json({
      revenue: revenue.total || 0,
      expenses: expenses.total || 0,
      profit: (revenue.total || 0) - (expenses.total || 0)
    });
  });

  app.post("/api/sales", (req, res) => {
    const { businessId, amount, paymentMethod } = req.body;
    const id = `sale_${Date.now()}`;
    db.prepare("INSERT INTO sales (id, business_id, total_amount, payment_method) VALUES (?, ?, ?, ?)")
      .run(id, businessId, amount, paymentMethod);
    res.json({ success: true, id });
  });

  // Businesses CRUD
  app.put("/api/businesses/:id", (req, res) => {
    const { id } = req.params;
    const { name, type, location } = req.body;
    db.prepare("UPDATE businesses SET name = ?, type = ?, location = ? WHERE id = ?").run(name, type, location, id);
    res.json({ success: true });
  });

  app.delete("/api/businesses/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM businesses WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Inventory CRUD
  app.put("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const { name, sku, quantity, price, category } = req.body;
    db.prepare("UPDATE inventory SET name = ?, sku = ?, quantity = ?, price = ?, category = ? WHERE id = ?")
      .run(name, sku, quantity, price, category, id);
    res.json({ success: true });
  });

  app.delete("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM inventory WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Staff CRUD
  app.post("/api/staff", (req, res) => {
    const { businessId, name, role, salary } = req.body;
    const id = `staff_${Date.now()}`;
    db.prepare("INSERT INTO staff (id, business_id, name, role, salary) VALUES (?, ?, ?, ?, ?)")
      .run(id, businessId, name, role, salary);
    res.json({ success: true, id });
  });

  app.put("/api/staff/:id", (req, res) => {
    const { id } = req.params;
    const { businessId, name, role, salary } = req.body;
    db.prepare("UPDATE staff SET business_id = ?, name = ?, role = ?, salary = ? WHERE id = ?")
      .run(businessId, name, role, salary, id);
    res.json({ success: true });
  });

  app.delete("/api/staff/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM staff WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Customers CRUD
  app.put("/api/customers/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, phone, loyalty_points } = req.body;
    db.prepare("UPDATE customers SET name = ?, email = ?, phone = ?, loyalty_points = ? WHERE id = ?")
      .run(name, email, phone, loyalty_points, id);
    res.json({ success: true });
  });

  app.delete("/api/customers/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM customers WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Expenses CRUD
  app.get("/api/expenses", (req, res) => {
    const { businessId } = req.query;
    let query = "SELECT * FROM expenses";
    const params = [];
    if (businessId) {
      query += " WHERE business_id = ?";
      params.push(businessId);
    }
    const expenses = db.prepare(query).all(...params);
    res.json(expenses);
  });

  app.post("/api/expenses", (req, res) => {
    const { businessId, category, amount, description } = req.body;
    const id = `exp_${Date.now()}`;
    db.prepare("INSERT INTO expenses (id, business_id, category, amount, description) VALUES (?, ?, ?, ?, ?)")
      .run(id, businessId, category, amount, description);
    res.json({ success: true, id });
  });

  app.put("/api/expenses/:id", (req, res) => {
    const { id } = req.params;
    const { category, amount, description } = req.body;
    db.prepare("UPDATE expenses SET category = ?, amount = ?, description = ? WHERE id = ?")
      .run(category, amount, description, id);
    res.json({ success: true });
  });

  app.delete("/api/expenses/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
