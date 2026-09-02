import Database from 'better-sqlite3';
import path from 'path';
import {
  SEED_CATEGORIES,
  SEED_BRANDS,
  SEED_MODELS,
  SEED_QUESTIONS,
  SEED_TESTIMONIALS,
  SEED_FAQS,
  SEED_BLOGS,
  SEED_BANNERS,
  SEED_ADMIN_ROLES,
  SEED_ADMIN_USERS,
  SEED_ORDERS,
} from './seed-data';

import fs from 'fs';

const getDbPath = () => {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  if (process.env.VERCEL || process.env.AWS_REGION) {
    const tmpDir = '/tmp';
    if (!fs.existsSync(tmpDir)) {
      try { fs.mkdirSync(tmpDir, { recursive: true }); } catch (e) {}
    }
    return path.join(tmpDir, 'trustmygadget.db');
  }
  return path.join(process.cwd(), 'trustmygadget.db');
};

const dbPath = getDbPath();

// Global singleton pattern for development hot-reloading
declare global {
  // eslint-disable-next-line no-var
  var __dbInstance: Database.Database | undefined;
}

function getDatabase(): Database.Database {
  if (!global.__dbInstance) {
    const db = new Database(dbPath);
    try {
      db.pragma('journal_mode = WAL');
    } catch (e) {
      db.pragma('journal_mode = DELETE');
    }
    db.pragma('foreign_keys = ON');
    initTables(db);
    global.__dbInstance = db;
  }
  return global.__dbInstance;
}

export const db = getDatabase();

function initTables(database: Database.Database) {
  // Schema DDL execution
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'CUSTOMER',
      isBlocked INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      roleSlug TEXT DEFAULT 'super_admin',
      isActive INTEGER DEFAULT 1,
      avatarUrl TEXT,
      lastLoginAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roleSlug) REFERENCES roles (slug)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      description TEXT,
      imageUrl TEXT,
      displayOrder INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      categoryId TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      logoUrl TEXT,
      isPopular INTEGER DEFAULT 0,
      displayOrder INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES categories (id) ON DELETE CASCADE,
      UNIQUE (categoryId, slug)
    );

    CREATE TABLE IF NOT EXISTS models (
      id TEXT PRIMARY KEY,
      brandId TEXT NOT NULL,
      categoryId TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      series TEXT,
      imageUrl TEXT,
      releaseYear INTEGER,
      basePrice REAL NOT NULL,
      minPrice REAL,
      maxPrice REAL,
      isPopular INTEGER DEFAULT 0,
      isFeatured INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      specifications TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brandId) REFERENCES brands (id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES categories (id) ON DELETE CASCADE,
      UNIQUE (brandId, slug)
    );

    CREATE TABLE IF NOT EXISTS variants (
      id TEXT PRIMARY KEY,
      modelId TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      ram TEXT,
      storage TEXT,
      processor TEXT,
      gpu TEXT,
      screenSize TEXT,
      color TEXT,
      basePrice REAL NOT NULL,
      minPrice REAL,
      maxPrice REAL,
      isDefault INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (modelId) REFERENCES models (id) ON DELETE CASCADE,
      UNIQUE (modelId, slug)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      categoryId TEXT,
      brandId TEXT,
      modelId TEXT,
      title TEXT NOT NULL,
      subtitle TEXT,
      code TEXT UNIQUE NOT NULL,
      questionType TEXT DEFAULT 'SINGLE_CHOICE',
      isRequired INTEGER DEFAULT 1,
      displayOrder INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES categories (id) ON DELETE SET NULL,
      FOREIGN KEY (brandId) REFERENCES brands (id) ON DELETE SET NULL,
      FOREIGN KEY (modelId) REFERENCES models (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      questionId TEXT NOT NULL,
      code TEXT NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      adjustmentType TEXT DEFAULT 'FIXED',
      adjustmentValue REAL DEFAULT 0,
      isRejection INTEGER DEFAULT 0,
      warningMessage TEXT,
      displayOrder INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (questionId) REFERENCES questions (id) ON DELETE CASCADE,
      UNIQUE (questionId, code)
    );

    CREATE TABLE IF NOT EXISTS pricing_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      categoryId TEXT,
      brandId TEXT,
      modelId TEXT,
      variantId TEXT,
      questionCode TEXT,
      answerCode TEXT,
      ruleType TEXT DEFAULT 'DEDUCTION',
      adjustmentType TEXT DEFAULT 'FIXED',
      adjustmentValue REAL DEFAULT 0,
      priorityLevel TEXT DEFAULT 'GLOBAL',
      maxCap REAL,
      minCap REAL,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS valuation_sessions (
      id TEXT PRIMARY KEY,
      sessionToken TEXT UNIQUE NOT NULL,
      categoryId TEXT NOT NULL,
      brandId TEXT NOT NULL,
      modelId TEXT NOT NULL,
      variantId TEXT NOT NULL,
      basePrice REAL NOT NULL,
      additionsTotal REAL DEFAULT 0,
      deductionsTotal REAL DEFAULT 0,
      estimatedPrice REAL NOT NULL,
      isRejected INTEGER DEFAULT 0,
      rejectionReason TEXT,
      answersSummary TEXT,
      userIp TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      orderNumber TEXT UNIQUE NOT NULL,
      userId TEXT,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      categoryName TEXT NOT NULL,
      brandName TEXT NOT NULL,
      modelName TEXT NOT NULL,
      variantName TEXT NOT NULL,
      deviceImageUrl TEXT,
      basePrice REAL NOT NULL,
      estimatedPrice REAL NOT NULL,
      finalVerifiedPrice REAL,
      status TEXT DEFAULT 'ORDER_PLACED',
      paymentStatus TEXT DEFAULT 'PENDING',
      payoutMethod TEXT DEFAULT 'UPI',
      payoutUpiId TEXT,
      payoutBankAccount TEXT,
      payoutBankIfsc TEXT,
      payoutBankName TEXT,
      pickupDate TEXT NOT NULL,
      pickupTimeSlot TEXT NOT NULL,
      pickupAddress TEXT NOT NULL,
      pickupCity TEXT NOT NULL,
      pickupState TEXT NOT NULL,
      pickupPincode TEXT NOT NULL,
      pickupLandmark TEXT,
      pickupNotes TEXT,
      assignedAgent TEXT,
      verificationNotes TEXT,
      cancellationReason TEXT,
      conditionSummary TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS verification_records (
      id TEXT PRIMARY KEY,
      orderId TEXT UNIQUE NOT NULL,
      verifiedBy TEXT NOT NULL,
      declaredCondition TEXT NOT NULL,
      verifiedCondition TEXT NOT NULL,
      priceDelta REAL DEFAULT 0,
      adjustmentsApplied TEXT,
      inspectionNotes TEXT,
      inspectionPhotos TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      changedBy TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      badgeText TEXT,
      desktopImage TEXT,
      mobileImage TEXT,
      ctaText TEXT DEFAULT 'Sell Now',
      ctaUrl TEXT DEFAULT '/sell',
      displayOrder INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      startDate DATETIME,
      endDate DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      category TEXT DEFAULT 'General',
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      displayOrder INTEGER DEFAULT 0,
      isFeatured INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      coverImage TEXT,
      author TEXT DEFAULT 'TrustMyGadget Team',
      category TEXT DEFAULT 'Selling Guide',
      readTime TEXT DEFAULT '4 min read',
      isPublished INTEGER DEFAULT 1,
      publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      seoTitle TEXT,
      seoDescription TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      location TEXT NOT NULL,
      deviceSold TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      reviewText TEXT NOT NULL,
      avatarUrl TEXT,
      isFeatured INTEGER DEFAULT 1,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      groupName TEXT DEFAULT 'general',
      description TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      adminId TEXT,
      adminName TEXT NOT NULL,
      action TEXT NOT NULL,
      entityType TEXT NOT NULL,
      entityId TEXT,
      details TEXT NOT NULL,
      oldValues TEXT,
      newValues TEXT,
      ipAddress TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      discountType TEXT DEFAULT 'FIXED',
      discountValue REAL NOT NULL,
      minDeviceValue REAL DEFAULT 0,
      maxBonus REAL,
      expiryDate TEXT,
      usageLimit INTEGER DEFAULT 1000,
      usageCount INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      ticketNumber TEXT UNIQUE NOT NULL,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      customerEmail TEXT,
      orderNumber TEXT,
      subject TEXT NOT NULL,
      status TEXT DEFAULT 'OPEN',
      priority TEXT DEFAULT 'MEDIUM',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      ticketId TEXT NOT NULL,
      sender TEXT NOT NULL,
      senderName TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticketId) REFERENCES support_tickets (id) ON DELETE CASCADE
    );
  `);

  try {
    database.exec('ALTER TABLE users ADD COLUMN isBlocked INTEGER DEFAULT 0');
  } catch (e) {
    // Column already exists
  }

  // Check if categories already seeded
  const countRow = database.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase(database);
  }
}

function seedDatabase(database: Database.Database) {
  const insertCategory = database.prepare(`
    INSERT INTO categories (id, name, slug, icon, description, imageUrl, displayOrder, isActive)
    VALUES (@id, @name, @slug, @icon, @description, @imageUrl, @displayOrder, 1)
  `);

  const insertBrand = database.prepare(`
    INSERT INTO brands (id, categoryId, name, slug, logoUrl, isPopular, displayOrder, isActive)
    VALUES (@id, @categoryId, @name, @slug, @logoUrl, @isPopular, @displayOrder, 1)
  `);

  const insertModel = database.prepare(`
    INSERT INTO models (id, brandId, categoryId, name, slug, series, imageUrl, releaseYear, basePrice, minPrice, maxPrice, isPopular, isFeatured, isActive, specifications)
    VALUES (@id, @brandId, @categoryId, @name, @slug, @series, @imageUrl, @releaseYear, @basePrice, @minPrice, @maxPrice, @isPopular, @isFeatured, 1, @specifications)
  `);

  const insertVariant = database.prepare(`
    INSERT INTO variants (id, modelId, name, slug, ram, storage, processor, gpu, screenSize, color, basePrice, minPrice, maxPrice, isDefault, isActive)
    VALUES (@id, @modelId, @name, @slug, @ram, @storage, @processor, @gpu, @screenSize, @color, @basePrice, @minPrice, @maxPrice, @isDefault, 1)
  `);

  const insertQuestion = database.prepare(`
    INSERT INTO questions (id, categoryId, brandId, modelId, title, subtitle, code, questionType, isRequired, displayOrder, isActive)
    VALUES (@id, @categoryId, @brandId, @modelId, @title, @subtitle, @code, @questionType, 1, @displayOrder, 1)
  `);

  const insertAnswer = database.prepare(`
    INSERT INTO answers (id, questionId, code, label, description, icon, adjustmentType, adjustmentValue, isRejection, warningMessage, displayOrder, isActive)
    VALUES (@id, @questionId, @code, @label, @description, @icon, @adjustmentType, @adjustmentValue, @isRejection, @warningMessage, @displayOrder, 1)
  `);

  const insertRole = database.prepare(`
    INSERT INTO roles (id, name, slug, description, permissions)
    VALUES (@id, @name, @slug, @description, @permissions)
  `);

  const insertAdminUser = database.prepare(`
    INSERT INTO admin_users (id, username, email, passwordHash, name, roleSlug, isActive, avatarUrl)
    VALUES (@id, @username, @email, @passwordHash, @name, @roleSlug, @isActive, @avatarUrl)
  `);

  const insertOrder = database.prepare(`
    INSERT INTO orders (id, orderNumber, customerName, customerPhone, customerEmail, categoryName, brandName, modelName, variantName, deviceImageUrl, basePrice, estimatedPrice, finalVerifiedPrice, status, paymentStatus, payoutMethod, payoutUpiId, payoutBankAccount, payoutBankIfsc, payoutBankName, pickupDate, pickupTimeSlot, pickupAddress, pickupCity, pickupState, pickupPincode, pickupLandmark, pickupNotes, assignedAgent, verificationNotes, conditionSummary)
    VALUES (@id, @orderNumber, @customerName, @customerPhone, @customerEmail, @categoryName, @brandName, @modelName, @variantName, @deviceImageUrl, @basePrice, @estimatedPrice, @finalVerifiedPrice, @status, @paymentStatus, @payoutMethod, @payoutUpiId, @payoutBankAccount, @payoutBankIfsc, @payoutBankName, @pickupDate, @pickupTimeSlot, @pickupAddress, @pickupCity, @pickupState, @pickupPincode, @pickupLandmark, @pickupNotes, @assignedAgent, @verificationNotes, @conditionSummary)
  `);

  const insertBanner = database.prepare(`
    INSERT INTO banners (id, title, subtitle, badgeText, desktopImage, mobileImage, ctaText, ctaUrl, displayOrder, isActive)
    VALUES (@id, @title, @subtitle, @badgeText, @desktopImage, @mobileImage, @ctaText, @ctaUrl, @displayOrder, @isActive)
  `);

  const insertFAQ = database.prepare(`
    INSERT INTO faqs (id, category, question, answer, displayOrder, isFeatured, isActive)
    VALUES (@id, @category, @question, @answer, @displayOrder, @isFeatured, 1)
  `);

  const insertBlog = database.prepare(`
    INSERT INTO blogs (id, title, slug, excerpt, content, coverImage, author, category, readTime, isPublished, seoTitle, seoDescription)
    VALUES (@id, @title, @slug, @excerpt, @content, @coverImage, @author, @category, @readTime, @isPublished, @seoTitle, @seoDescription)
  `);

  const insertTestimonial = database.prepare(`
    INSERT INTO testimonials (id, customerName, location, deviceSold, rating, reviewText, avatarUrl, isFeatured, isActive)
    VALUES (@id, @customerName, @location, @deviceSold, @rating, @reviewText, @avatarUrl, @isFeatured, 1)
  `);

  const insertSetting = database.prepare(`
    INSERT INTO settings (key, value, groupName, description)
    VALUES (@key, @value, @groupName, @description)
  `);

  const insertAuditLog = database.prepare(`
    INSERT INTO audit_logs (id, adminId, adminName, action, entityType, entityId, details, oldValues, newValues)
    VALUES (@id, @adminId, @adminName, @action, @entityType, @entityId, @details, @oldValues, @newValues)
  `);

  const transaction = database.transaction(() => {
    // Categories
    for (const cat of SEED_CATEGORIES) {
      insertCategory.run(cat);
    }

    // Brands
    for (const b of SEED_BRANDS) {
      insertBrand.run({
        id: b.id,
        categoryId: b.categoryId,
        name: b.name,
        slug: b.slug,
        logoUrl: b.logoUrl,
        isPopular: b.isPopular ? 1 : 0,
        displayOrder: b.displayOrder,
      });
    }

    // Models & Variants
    for (const m of SEED_MODELS) {
      insertModel.run({
        id: m.id,
        brandId: m.brandId,
        categoryId: m.categoryId,
        name: m.name,
        slug: m.slug,
        series: m.series,
        imageUrl: m.imageUrl,
        releaseYear: m.releaseYear,
        basePrice: m.basePrice,
        minPrice: m.minPrice,
        maxPrice: m.maxPrice,
        isPopular: m.isPopular ? 1 : 0,
        isFeatured: m.isFeatured ? 1 : 0,
        specifications: JSON.stringify(m.specifications),
      });

      for (const v of m.variants) {
        insertVariant.run({
          id: v.id,
          modelId: m.id,
          name: v.name,
          slug: v.slug,
          ram: v.ram || null,
          storage: v.storage || null,
          processor: v.processor || null,
          gpu: v.gpu || null,
          screenSize: v.screenSize || null,
          color: v.color || null,
          basePrice: v.basePrice,
          minPrice: v.minPrice,
          maxPrice: v.maxPrice,
          isDefault: v.isDefault ? 1 : 0,
        });
      }
    }

    // Questions & Answers
    for (const q of SEED_QUESTIONS) {
      insertQuestion.run({
        id: q.id,
        categoryId: q.categoryId || null,
        brandId: q.brandId || null,
        modelId: q.modelId || null,
        title: q.title,
        subtitle: q.subtitle,
        code: q.code,
        questionType: q.questionType,
        displayOrder: q.displayOrder,
      });

      for (const a of q.answers) {
        insertAnswer.run({
          id: a.id,
          questionId: q.id,
          code: a.code,
          label: a.label,
          description: a.description || null,
          icon: a.icon || null,
          adjustmentType: a.adjustmentType,
          adjustmentValue: a.adjustmentValue,
          isRejection: a.isRejection ? 1 : 0,
          warningMessage: a.warningMessage || null,
          displayOrder: a.displayOrder,
        });
      }
    }

    // Roles & Admin Users
    for (const r of SEED_ADMIN_ROLES) {
      insertRole.run(r);
    }
    for (const u of SEED_ADMIN_USERS) {
      insertAdminUser.run({
        ...u,
        isActive: u.isActive ? 1 : 0,
      });
    }

    // Orders
    for (const o of SEED_ORDERS) {
      insertOrder.run({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerEmail: o.customerEmail || '',
        categoryName: o.categoryName,
        brandName: o.brandName,
        modelName: o.modelName,
        variantName: o.variantName,
        deviceImageUrl: o.deviceImageUrl || null,
        basePrice: o.basePrice,
        estimatedPrice: o.estimatedPrice,
        finalVerifiedPrice: o.finalVerifiedPrice ?? null,
        status: o.status || 'ORDER_PLACED',
        paymentStatus: o.paymentStatus || 'PENDING',
        payoutMethod: o.payoutMethod || 'UPI',
        payoutUpiId: o.payoutUpiId || null,
        payoutBankAccount: o.payoutBankAccount || null,
        payoutBankIfsc: o.payoutBankIfsc || null,
        payoutBankName: (o as any).payoutBankName || null,
        pickupDate: o.pickupDate,
        pickupTimeSlot: o.pickupTimeSlot,
        pickupAddress: o.pickupAddress,
        pickupCity: o.pickupCity,
        pickupState: o.pickupState,
        pickupPincode: o.pickupPincode,
        pickupLandmark: o.pickupLandmark || null,
        pickupNotes: (o as any).pickupNotes || null,
        assignedAgent: (o as any).assignedAgent || null,
        verificationNotes: (o as any).verificationNotes || null,
        conditionSummary: (o as any).conditionSummary ? JSON.stringify((o as any).conditionSummary) : null,
      });
    }

    // Banners, FAQs, Blogs, Testimonials
    for (const ban of SEED_BANNERS) {
      insertBanner.run({ ...ban, isActive: ban.isActive ? 1 : 0 });
    }
    for (const f of SEED_FAQS) {
      insertFAQ.run({ ...f, isFeatured: f.isFeatured ? 1 : 0 });
    }
    for (const bl of SEED_BLOGS) {
      insertBlog.run({
        ...bl,
        isPublished: 1,
      });
    }
    for (const t of SEED_TESTIMONIALS) {
      insertTestimonial.run({ ...t, isFeatured: t.isFeatured ? 1 : 0 });
    }

    // Settings
    const defaultSettings = [
      { key: 'company_name', value: 'TrustMyGadget Technologies India Pvt Ltd', groupName: 'general', description: 'Registered legal company name' },
      { key: 'support_phone', value: '+91 1800 209 8899', groupName: 'general', description: 'Toll-free customer support helpline' },
      { key: 'support_email', value: 'help@trustmygadget.com', groupName: 'general', description: 'Customer support email address' },
      { key: 'pickup_pincodes_count', value: '19450', groupName: 'business', description: 'Serviceable pincodes in India' },
      { key: 'min_order_value', value: '1500', groupName: 'valuation', description: 'Minimum resale device purchase threshold in INR' },
      { key: 'instant_upi_enabled', value: 'true', groupName: 'payment', description: 'Enable instant IMPS / UPI doorstep payout' },
    ];
    for (const s of defaultSettings) {
      insertSetting.run(s);
    }

    // Initial Audit Log
    insertAuditLog.run({
      id: 'log_init',
      adminId: 'adm_super',
      adminName: 'System Architect',
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'PLATFORM',
      entityId: 'ROOT',
      details: 'Initial database seeding executed with 35+ brands, 60+ models, and comprehensive Indian valuation matrices.',
      oldValues: null,
      newValues: null,
    });
  });

  transaction();
}

// Helper Query Methods
export const dbHelpers = {
  // Categories
  getCategories: () => {
    return db.prepare('SELECT * FROM categories WHERE isActive = 1 ORDER BY displayOrder ASC').all();
  },
  getAllCategoriesAdmin: () => {
    return db.prepare('SELECT * FROM categories ORDER BY displayOrder ASC').all();
  },
  getCategoryBySlug: (slug: string) => {
    return db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
  },
  createCategory: (cat: any) => {
    return db.prepare(`
      INSERT INTO categories (id, name, slug, icon, description, imageUrl, displayOrder, isActive)
      VALUES (@id, @name, @slug, @icon, @description, @imageUrl, @displayOrder, 1)
    `).run(cat);
  },
  updateCategory: (id: string, cat: any) => {
    return db.prepare(`
      UPDATE categories
      SET name = COALESCE(@name, name),
          slug = COALESCE(@slug, slug),
          icon = COALESCE(@icon, icon),
          description = COALESCE(@description, description),
          imageUrl = COALESCE(@imageUrl, imageUrl),
          displayOrder = COALESCE(@displayOrder, displayOrder),
          isActive = COALESCE(@isActive, isActive),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = @id
    `).run({ id, ...cat });
  },
  deleteCategory: (id: string) => {
    return db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  },

  // Brands
  getBrandsByCategory: (categoryId: string) => {
    return db.prepare('SELECT * FROM brands WHERE categoryId = ? AND isActive = 1 ORDER BY displayOrder ASC, name ASC').all(categoryId);
  },
  getPopularBrands: (categoryId?: string) => {
    if (categoryId) {
      return db.prepare('SELECT * FROM brands WHERE categoryId = ? AND isPopular = 1 AND isActive = 1 ORDER BY displayOrder ASC').all(categoryId);
    }
    return db.prepare('SELECT * FROM brands WHERE isPopular = 1 AND isActive = 1 ORDER BY displayOrder ASC').all();
  },
  getBrandBySlug: (categoryId: string, slug: string) => {
    return db.prepare('SELECT * FROM brands WHERE categoryId = ? AND slug = ?').get(categoryId, slug);
  },

  // Models
  getModelsByBrand: (brandId: string) => {
    return db.prepare('SELECT * FROM models WHERE brandId = ? AND isActive = 1 ORDER BY releaseYear DESC, basePrice DESC').all(brandId);
  },
  getModelBySlug: (brandId: string, slug: string) => {
    return db.prepare('SELECT * FROM models WHERE brandId = ? AND slug = ?').get(brandId, slug);
  },
  getModelById: (modelId: string) => {
    return db.prepare('SELECT * FROM models WHERE id = ?').get(modelId);
  },
  getPopularModels: (limit = 8) => {
    return db.prepare(`
      SELECT m.*, b.name as brandName, b.slug as brandSlug, c.name as categoryName, c.slug as categorySlug 
      FROM models m
      JOIN brands b ON m.brandId = b.id
      JOIN categories c ON m.categoryId = c.id
      WHERE m.isPopular = 1 AND m.isActive = 1
      ORDER BY m.basePrice DESC
      LIMIT ?
    `).all(limit);
  },
  searchDevices: (query: string, limit = 20) => {
    const term = `%${query.trim()}%`;
    return db.prepare(`
      SELECT m.id, m.name, m.slug, m.series, m.imageUrl, m.basePrice, m.minPrice, m.maxPrice,
             b.name as brandName, b.slug as brandSlug,
             c.name as categoryName, c.slug as categorySlug
      FROM models m
      JOIN brands b ON m.brandId = b.id
      JOIN categories c ON m.categoryId = c.id
      WHERE (m.name LIKE ? OR b.name LIKE ? OR m.series LIKE ?) AND m.isActive = 1
      ORDER BY m.isPopular DESC, m.basePrice DESC
      LIMIT ?
    `).all(term, term, term, limit);
  },

  // Variants
  getVariantsByModel: (modelId: string) => {
    return db.prepare('SELECT * FROM variants WHERE modelId = ? AND isActive = 1 ORDER BY basePrice ASC').all(modelId);
  },
  getVariantById: (variantId: string) => {
    return db.prepare('SELECT * FROM variants WHERE id = ?').get(variantId);
  },

  // Questions & Answers
  getQuestionsForDevice: (categoryId: string, brandId?: string, modelId?: string) => {
    // Fetches category questions + brand specific + model specific questions
    const questions = db.prepare(`
      SELECT * FROM questions 
      WHERE (categoryId = ? OR categoryId IS NULL)
        AND (brandId = ? OR brandId IS NULL)
        AND (modelId = ? OR modelId IS NULL)
        AND isActive = 1
      ORDER BY displayOrder ASC
    `).all(categoryId, brandId || null, modelId || null) as any[];

    // Attach answers to each question
    const getAnswers = db.prepare('SELECT * FROM answers WHERE questionId = ? AND isActive = 1 ORDER BY displayOrder ASC');
    return questions.map(q => ({
      ...q,
      answers: getAnswers.all(q.id),
    }));
  },
  updateAnswer: (answerId: string, data: { adjustmentValue?: number; label?: string; description?: string }) => {
    return db.prepare(`
      UPDATE answers 
      SET adjustmentValue = COALESCE(?, adjustmentValue),
          label = COALESCE(?, label),
          description = COALESCE(?, description),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(data.adjustmentValue ?? null, data.label || null, data.description || null, answerId);
  },
  deleteQuestion: (questionId: string) => {
    db.prepare('DELETE FROM answers WHERE questionId = ?').run(questionId);
    return db.prepare('DELETE FROM questions WHERE id = ?').run(questionId);
  },

  // Orders
  getOrders: (limit = 100) => {
    return db.prepare('SELECT * FROM orders ORDER BY createdAt DESC LIMIT ?').all(limit);
  },
  getOrderById: (orderId: string) => {
    return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  },
  getOrderByNumber: (orderNumber: string) => {
    return db.prepare('SELECT * FROM orders WHERE orderNumber = ?').get(orderNumber);
  },
  createOrder: (orderData: any) => {
    const stmt = db.prepare(`
      INSERT INTO orders (
        id, orderNumber, userId, customerName, customerPhone, customerEmail,
        categoryName, brandName, modelName, variantName, deviceImageUrl,
        basePrice, estimatedPrice, finalVerifiedPrice, status, paymentStatus,
        payoutMethod, payoutUpiId, payoutBankAccount, payoutBankIfsc, payoutBankName,
        pickupDate, pickupTimeSlot, pickupAddress, pickupCity, pickupState,
        pickupPincode, pickupLandmark, pickupNotes, conditionSummary
      ) VALUES (
        @id, @orderNumber, @userId, @customerName, @customerPhone, @customerEmail,
        @categoryName, @brandName, @modelName, @variantName, @deviceImageUrl,
        @basePrice, @estimatedPrice, @finalVerifiedPrice, @status, @paymentStatus,
        @payoutMethod, @payoutUpiId, @payoutBankAccount, @payoutBankIfsc, @payoutBankName,
        @pickupDate, @pickupTimeSlot, @pickupAddress, @pickupCity, @pickupState,
        @pickupPincode, @pickupLandmark, @pickupNotes, @conditionSummary
      )
    `);
    stmt.run({
      id: orderData.id,
      orderNumber: orderData.orderNumber,
      userId: orderData.userId || null,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail || '',
      categoryName: orderData.categoryName,
      brandName: orderData.brandName,
      modelName: orderData.modelName,
      variantName: orderData.variantName,
      deviceImageUrl: orderData.deviceImageUrl || null,
      basePrice: orderData.basePrice,
      estimatedPrice: orderData.estimatedPrice,
      finalVerifiedPrice: orderData.finalVerifiedPrice ?? null,
      status: orderData.status || 'ORDER_PLACED',
      paymentStatus: orderData.paymentStatus || 'PENDING',
      payoutMethod: orderData.payoutMethod || 'UPI',
      payoutUpiId: orderData.payoutUpiId || null,
      payoutBankAccount: orderData.payoutBankAccount || null,
      payoutBankIfsc: orderData.payoutBankIfsc || null,
      payoutBankName: orderData.payoutBankName || null,
      pickupDate: orderData.pickupDate,
      pickupTimeSlot: orderData.pickupTimeSlot,
      pickupAddress: orderData.pickupAddress,
      pickupCity: orderData.pickupCity,
      pickupState: orderData.pickupState || 'India',
      pickupPincode: orderData.pickupPincode,
      pickupLandmark: orderData.pickupLandmark || null,
      pickupNotes: orderData.pickupNotes || null,
      conditionSummary: typeof orderData.conditionSummary === 'object' ? JSON.stringify(orderData.conditionSummary) : (orderData.conditionSummary || null),
    });
    return orderData;
  },
  updateOrderStatus: (orderId: string, status: string, note?: string, changedBy?: string) => {
    db.prepare('UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(status, orderId);
    db.prepare(`
      INSERT INTO order_status_history (id, orderId, status, note, changedBy)
      VALUES (?, ?, ?, ?, ?)
    `).run(`hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, orderId, status, note || null, changedBy || 'System');
  },
  updateOrderFinalPrice: (orderId: string, finalPrice: number, notes?: string, agent?: string) => {
    db.prepare(`
      UPDATE orders 
      SET finalVerifiedPrice = ?, verificationNotes = ?, assignedAgent = COALESCE(?, assignedAgent), updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(finalPrice, notes || null, agent || null, orderId);
  },
  updateOrderPaymentStatus: (orderId: string, paymentStatus: string) => {
    db.prepare('UPDATE orders SET paymentStatus = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(paymentStatus, orderId);
  },

  // Banners, FAQs, Blogs, Testimonials
  getActiveBanners: () => {
    return db.prepare('SELECT * FROM banners WHERE isActive = 1 ORDER BY displayOrder ASC').all();
  },
  getFAQs: (category?: string) => {
    if (category && category !== 'All') {
      return db.prepare('SELECT * FROM faqs WHERE category = ? AND isActive = 1 ORDER BY displayOrder ASC').all(category);
    }
    return db.prepare('SELECT * FROM faqs WHERE isActive = 1 ORDER BY displayOrder ASC').all();
  },
  getBlogs: (limit = 10) => {
    return db.prepare('SELECT * FROM blogs WHERE isPublished = 1 ORDER BY publishedAt DESC LIMIT ?').all(limit);
  },
  getBlogBySlug: (slug: string) => {
    return db.prepare('SELECT * FROM blogs WHERE slug = ?').get(slug);
  },
  getTestimonials: () => {
    return db.prepare('SELECT * FROM testimonials WHERE isActive = 1 ORDER BY isFeatured DESC, rating DESC').all();
  },

  // Settings & Audit Logs
  getSettings: () => {
    return db.prepare('SELECT * FROM settings').all();
  },
  updateSetting: (key: string, value: string) => {
    return db.prepare('UPDATE settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key = ?').run(value, key);
  },
  getAuditLogs: (limit = 100) => {
    return db.prepare('SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT ?').all(limit);
  },
  createAuditLog: (logData: {
    adminId?: string;
    adminName: string;
    action: string;
    entityType: string;
    entityId?: string;
    details: string;
    oldValues?: string;
    newValues?: string;
  }) => {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO audit_logs (id, adminId, adminName, action, entityType, entityId, details, oldValues, newValues)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, logData.adminId || null, logData.adminName, logData.action, logData.entityType, logData.entityId || null, logData.details, logData.oldValues || null, logData.newValues || null);
  },

  getAdminUserByEmail: (email: string) => {
    try {
      return db.prepare(`
        SELECT u.*, r.slug as roleSlug, r.name as roleName
        FROM admin_users u
        LEFT JOIN roles r ON u.roleSlug = r.slug
        WHERE (u.email = ? OR u.username = ?) AND u.isActive = 1
      `).get(email, email) as any;
    } catch (e) {
      return null;
    }
  },

  // Admin Dashboard Metrics
  getDashboardMetrics: () => {
    const totalOrdersRow = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
    const pendingOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('ORDER_PLACED', 'PICKUP_SCHEDULED', 'COLLECTED', 'IN_VERIFICATION')").get() as { count: number };
    const completedOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'PAYMENT_COMPLETED'").get() as { count: number };
    const cancelledOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'CANCELLED'").get() as { count: number };
    
    const purchaseValueRow = db.prepare("SELECT SUM(COALESCE(finalVerifiedPrice, estimatedPrice)) as total FROM orders WHERE status != 'CANCELLED'").get() as { total: number | null };
    const completedValueRow = db.prepare("SELECT SUM(finalVerifiedPrice) as total FROM orders WHERE status = 'PAYMENT_COMPLETED'").get() as { total: number | null };
    
    const totalModelsRow = db.prepare('SELECT COUNT(*) as count FROM models WHERE isActive = 1').get() as { count: number };
    const totalBrandsRow = db.prepare('SELECT COUNT(*) as count FROM brands WHERE isActive = 1').get() as { count: number };
    const totalUsersRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

    // Category distribution
    const categoryStats = db.prepare(`
      SELECT categoryName, COUNT(*) as orderCount, SUM(estimatedPrice) as totalValue 
      FROM orders 
      GROUP BY categoryName
    `).all();

    // Recent orders
    const recentOrders = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC LIMIT 6').all();

    return {
      totalOrders: totalOrdersRow.count,
      pendingOrders: pendingOrdersRow.count,
      completedOrders: completedOrdersRow.count,
      cancelledOrders: cancelledOrdersRow.count,
      totalPurchaseValue: purchaseValueRow.total || 0,
      completedPurchaseValue: completedValueRow.total || 0,
      totalModels: totalModelsRow.count,
      totalBrands: totalBrandsRow.count,
      totalUsers: totalUsersRow.count || 240, // baseline active user estimate
      categoryStats,
      recentOrders,
    };
  },
};
