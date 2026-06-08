const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { featuredProductsSeed } = require('../data/featured-catalog');

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
          discountPercent: 0,
          showDiscountBadge: false,
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
  await ensureFeaturedProducts();
}

function toInventoryItem(item) {
  return {
    id: item._id,
    source: 'product',
    name: item.name || 'Untitled product',
    price: Number(item.price || 0),
    discountPercent: Number(item.discountPercent || 0),
    showDiscountBadge: Boolean(item.showDiscountBadge),
    stock: Number(item.stock || 0),
    category: item.isAuction ? 'Auction' : 'Standard',
    createdAt: item.createdAt
  };
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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

    const products = await Product.find().sort({ createdAt: -1 });

    const inventory = products.map(toInventoryItem);

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

    if (source !== 'product') {
      return res.status(400).json({ message: 'Invalid inventory source' });
    }

    const updated = await Product.findByIdAndUpdate(id, { stock }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Item not found' });
    }

    return res.json({
      message: 'Stock updated',
      item: toInventoryItem(updated)
    });
  } catch {
    return res.status(500).json({ message: 'Could not update stock' });
  }
});

router.patch('/inventory/:source/:id/pricing', auth, admin, async (req, res) => {
  try {
    const { source, id } = req.params;
    const discountPercent = Number(req.body?.discountPercent || 0);
    const showDiscountBadge = Boolean(req.body?.showDiscountBadge);

    if (source !== 'product') {
      return res.status(400).json({ message: 'Invalid inventory source' });
    }

    if (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 95) {
      return res.status(400).json({ message: 'Discount must be a whole percent from 0 to 95' });
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        discountPercent,
        showDiscountBadge: showDiscountBadge && discountPercent > 0
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Item not found' });
    }

    return res.json({
      message: 'Pricing updated',
      item: toInventoryItem(updated)
    });
  } catch {
    return res.status(500).json({ message: 'Could not update pricing' });
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
      slug: slugify(normalizedName),
      price: normalizedPrice,
      discountPercent: 0,
      showDiscountBadge: false,
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
      totalOrders,
      productStockAgg
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalStockUnits: { $sum: '$stock' },
            totalInventoryValue: {
              $sum: {
                $multiply: [
                  '$stock',
                  '$price',
                  {
                    $subtract: [
                      1,
                      {
                        $divide: [
                          { $ifNull: ['$discountPercent', 0] },
                          100
                        ]
                      }
                    ]
                  }
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

    return res.json({
      totalUsers,
      totalAdmins,
      totalProducts,
      totalListings: 0,
      totalOrders,
      totalStockUnits: Number(productStock.totalStockUnits || 0),
      totalInventoryValue: Number(productStock.totalInventoryValue || 0),
      lowStockProducts: Number(productStock.lowStockItems || 0)
    });
  } catch {
    return res.status(500).json({ message: 'Could not load stats' });
  }
});

module.exports = router;
