require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Listing = require('./models/listing');
const Product = require('./models/product');
const { featuredListingsSeed, featuredProductsSeed } = require('./data/featured-catalog');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/reviews', require('./routes/reviews'));

const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URL) throw new Error('Missing MONGO_URL in server/.env');
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET in server/.env');

const defaultAdmin = {
  firstName: process.env.ADMIN_FIRST_NAME || 'System',
  lastName: process.env.ADMIN_LAST_NAME || 'Admin',
  email: (process.env.ADMIN_EMAIL || 'admin@techmarket.local').toLowerCase(),
  password: process.env.ADMIN_PASSWORD || 'Admin123!Secure',
  birthDate: process.env.ADMIN_BIRTH_DATE || '1990-01-01'
};

async function ensureDefaultAdmin() {
  const existing = await User.findOne({ email: defaultAdmin.email });

  if (!existing) {
    const hash = await bcrypt.hash(defaultAdmin.password, 12);
    await User.create({
      firstName: defaultAdmin.firstName,
      lastName: defaultAdmin.lastName,
      email: defaultAdmin.email,
      password: hash,
      birthDate: defaultAdmin.birthDate,
      role: 'admin'
    });

    console.log(`Default admin created: ${defaultAdmin.email}`);
    return;
  }

  if (existing.role !== 'admin') {
    existing.role = 'admin';
    await existing.save();
  }
}

async function ensureListingStockField() {
  await Listing.updateMany({ stock: { $exists: false } }, { $set: { stock: 0 } });
}

async function ensureFeaturedListings() {
  const operations = featuredListingsSeed.map((item) => ({
    updateOne: {
      filter: { slug: item.slug },
      update: {
        $setOnInsert: {
          title: item.title,
          slug: item.slug,
          price: item.price,
          stock: 10,
          type: 'buyNow',
          category: 'featured',
          description: `${item.title} from featured catalog.`,
          images: []
        }
      },
      upsert: true
    }
  }));

  const result = await Listing.bulkWrite(operations, { ordered: false });
  const inserted = Number(result.upsertedCount || 0);

  if (inserted > 0) {
    console.log(`Seeded ${inserted} featured listings into inventory.`);
  }
}

async function ensureFeaturedProducts() {
  const operations = featuredProductsSeed.map((item) => ({
    updateOne: {
      filter: { slug: item.slug },
      update: {
        $setOnInsert: {
          name: item.name,
          slug: item.slug,
          category: item.category,
          price: item.price,
          stock: item.stock,
          description: item.description,
          image: item.image,
          specs: item.specs,
          rating: item.rating,
          ratingCount: item.ratingCount,
          isAuction: false
        }
      },
      upsert: true
    }
  }));

  const result = await Product.bulkWrite(operations, { ordered: false });
  const inserted = Number(result.upsertedCount || 0);

  if (inserted > 0) {
    console.log(`Seeded ${inserted} featured products into catalog.`);
  }
}

async function removeLegacyBidsCollection() {
  const collections = await mongoose.connection.db.listCollections({ name: 'bids' }).toArray();
  if (!collections.length) return;

  await mongoose.connection.db.dropCollection('bids');
  console.log('Removed legacy bids collection.');
}

mongoose
  .connect(MONGO_URL, { autoIndex: true })
  .then(async () => {
    console.log('MongoDB connected');
    await removeLegacyBidsCollection();
    await ensureDefaultAdmin();
    await ensureListingStockField();
    await ensureFeaturedListings();
    await ensureFeaturedProducts();

    const PORT = Number(process.env.PORT || 3000);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

