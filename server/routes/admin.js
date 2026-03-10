const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Listing = require('../models/listing');
const User = require('../models/user');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { featuredListingsSeed, featuredProductsSeed } = require('../data/featured-catalog');

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

  await Listing.bulkWrite(operations, { ordered: false });
  await Listing.updateMany({ stock: { $exists: false } }, { $set: { stock: 0 } });
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

  await Product.bulkWrite(operations, { ordered: false });
}

async function ensureFeaturedInventory() {
  await Promise.all([
    ensureFeaturedListings(),
    ensureFeaturedProducts()
  ]);
}

function toInventoryItem(item, source) {
  if (source === 'product') {
    return {
      id: item._id,
      source,
      name: item.name || 'Untitled product',
      price: Number(item.price || 0),
      stock: Number(item.stock || 0),
      category: item.isAuction ? 'Auction' : 'Standard',
      createdAt: item.createdAt
    };
  }

  return {
    id: item._id,
    source,
    name: item.title || 'Untitled listing',
    price: Number(item.price || item.buyoutPrice || item.currentBid || 0),
    stock: Number(item.stock || 0),
    category: item.type || 'buyNow',
    createdAt: item.createdAt
  };
}

router.get('/users', auth, admin, async (_req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch {
    return res.status(500).json({ message: 'Could not load users' });
  }
});

router.get('/products', auth, admin, async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch {
    return res.status(500).json({ message: 'Could not load products' });
  }
});

router.get('/inventory', auth, admin, async (_req, res) => {
  try {
    await ensureFeaturedInventory();

    const [products, listings] = await Promise.all([
      Product.find().sort({ createdAt: -1 }),
      Listing.find().sort({ createdAt: -1 })
    ]);

    const inventory = [
      ...products.map((item) => toInventoryItem(item, 'product')),
      ...listings.map((item) => toInventoryItem(item, 'listing'))
    ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return res.json(inventory);
  } catch {
    return res.status(500).json({ message: 'Could not load inventory' });
  }
});

router.patch('/inventory/:source/:id/stock', auth, admin, async (req, res) => {
  try {
    const { source, id } = req.params;
    const stock = Number(req.body?.stock);

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: 'Stock must be a non-negative integer' });
    }

    const Model = source === 'product' ? Product : source === 'listing' ? Listing : null;
    if (!Model) {
      return res.status(400).json({ message: 'Invalid inventory source' });
    }

    const updated = await Model.findByIdAndUpdate(id, { stock }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Item not found' });
    }

    return res.json({
      message: 'Stock updated',
      item: toInventoryItem(updated, source)
    });
  } catch {
    return res.status(500).json({ message: 'Could not update stock' });
  }
});

router.post('/products', auth, admin, async (req, res) => {
  try {
    const {
      name,
      description = '',
      image = '',
      isAuction = false,
      price,
      stock
    } = req.body;

    const normalizedName = String(name || '').trim();
    const normalizedPrice = Number(price);
    const normalizedStock = Number(stock);

    if (!normalizedName) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    if (!Number.isInteger(normalizedStock) || normalizedStock < 0) {
      return res.status(400).json({ message: 'Stock must be a non-negative integer' });
    }

    const product = await Product.create({
      name: normalizedName,
      price: normalizedPrice,
      stock: normalizedStock,
      description: String(description || '').trim(),
      image: String(image || '').trim(),
      isAuction: Boolean(isAuction),
      createdBy: req.user.id
    });

    return res.status(201).json(product);
  } catch {
    return res.status(500).json({ message: 'Could not create product' });
  }
});

router.get('/stats', auth, admin, async (_req, res) => {
  try {
    await ensureFeaturedInventory();

    const [
      totalUsers,
      totalAdmins,
      totalProducts,
      totalListings,
      totalOrders,
      productStockAgg,
      listingStockAgg
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      Product.countDocuments(),
      Listing.countDocuments(),
      Order.countDocuments(),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalStockUnits: { $sum: '$stock' },
            totalInventoryValue: { $sum: { $multiply: ['$stock', '$price'] } },
            lowStockItems: {
              $sum: {
                $cond: [{ $lte: ['$stock', 5] }, 1, 0]
              }
            }
          }
        }
      ]),
      Listing.aggregate([
        {
          $group: {
            _id: null,
            totalStockUnits: { $sum: '$stock' },
            totalInventoryValue: {
              $sum: {
                $multiply: [
                  '$stock',
                  { $ifNull: ['$price', { $ifNull: ['$buyoutPrice', { $ifNull: ['$currentBid', 0] }] }] }
                ]
              }
            },
            lowStockItems: {
              $sum: {
                $cond: [{ $lte: ['$stock', 5] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const productStock = productStockAgg[0] || {
      totalStockUnits: 0,
      totalInventoryValue: 0,
      lowStockItems: 0
    };

    const listingStock = listingStockAgg[0] || {
      totalStockUnits: 0,
      totalInventoryValue: 0,
      lowStockItems: 0
    };

    return res.json({
      totalUsers,
      totalAdmins,
      totalProducts,
      totalListings,
      totalOrders,
      totalStockUnits: Number(productStock.totalStockUnits || 0) + Number(listingStock.totalStockUnits || 0),
      totalInventoryValue:
        Number(productStock.totalInventoryValue || 0) + Number(listingStock.totalInventoryValue || 0),
      lowStockProducts: Number(productStock.lowStockItems || 0) + Number(listingStock.lowStockItems || 0)
    });
  } catch {
    return res.status(500).json({ message: 'Could not load stats' });
  }
});

router.delete('/listing/:id', auth, admin, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Deleted' });
  } catch {
    return res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
