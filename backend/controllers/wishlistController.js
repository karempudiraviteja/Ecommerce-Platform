const Wishlist = require('../models/Wishlist');

// @desc Get wishlist
exports.getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.json({ success: true, data: wishlist || { products: [] } });
};

// @desc Toggle product in wishlist
exports.toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });

  const idx = wishlist.products.indexOf(productId);
  let added;
  if (idx > -1) {
    wishlist.products.splice(idx, 1);
    added = false;
  } else {
    wishlist.products.push(productId);
    added = true;
  }
  await wishlist.save();
  res.json({ success: true, data: { added, wishlist } });
};

// @desc Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });
  wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
  await wishlist.save();
  res.json({ success: true, data: wishlist });
};
