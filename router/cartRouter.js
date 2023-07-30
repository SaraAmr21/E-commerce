const express = require('express')
const router = express.Router()
const userModel = require('../model/userModel.js')
const productModel = require('../model/productModel.js')
const cartModel = require('../model/cartModel.js')
const CustomError = require('../middleware/CustomError.js');

//add item to cart

router.post('/', async (req, res, next) => {
  try {
    const { userId, productId } = req.body;

    const user = await userModel.findById(userId);
    const product = await productModel.findById(productId);

    if (!user || !product) {
      return res.status(404).json({ message: 'User or Product not found' });
    }
    let userCart = await cartModel.findOne({ userId: user._id });

    if (!userCart) {
      userCart = new cartModel({
        userId: user._id,
        items: [],
      });
    }
    const existingItem = userCart.items.find(item => item.product.equals(product._id));

    if (existingItem) {
      existingItem.quantity += 1;
    } else {

      userCart.items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    await userCart.save();

    res.json({ message: 'Product added to cart successfully', cart: userCart });
  } catch (error) {
    next(CustomError({
      statusCod: 400,
      message: 'Invalid parameters'
    }));
  }
});

async function getCart(userId) {
  try {
    const userCart = await cartModel.findOne({ userId });

    if (!userCart) {
      return null;
    }
    let totalPrice = 0;

    for (const cartItem of userCart.items) {
      const product = await productModel.findById(cartItem.product);

      if (!product) {
        return null;
      }
      totalPrice += product.price * cartItem.quantity;
    }

    return { cart: userCart, totalPrice };
  } catch (error) {
    throw error;
  }
}
////verifications?!!
router.get('/verify/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cartData = await getCart(userId);

    if (!cartData) {
      return res.status(404).json({ message: 'Cart not found or contains invalid items' });
    }

    res.json({ message: 'Cart verification successful', cart: cartData.cart, totalPrice: cartData.totalPrice });
  } catch (error) {
    next(CustomError({
      statusCode: 500,
      message: 'Internal server error'
    }));
  }
});

/////remove one item (msh kolo)
router.delete('/remove/:userID', async (req, res, next) => {
  try {
    const { userID } = req.params;
    const { productID } = req.body;
    const user = await userModel.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userCart = await cartModel.findOne({ userId: user._id });

    if (!userCart) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }
    const itemIndex = userCart.items.findIndex(item => item.product.toString() === productID);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in the cart' });
    }
    userCart.items.splice(itemIndex, 1);
    await userCart.save();

    res.json({ message: 'Product removed from cart successfully', cart: userCart });
  } catch (error) {
    next(CustomError({
      statusCode: 500,
      message: 'Internal server error'
    }));
  }
});



/// cancel order=> by clearning the cart
router.delete('/clear/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const cart = await cartModel.findOne({ userId: user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart content cleared successfully' });
  } catch (error) {
    next(CustomError({ statusCode: 500, message: 'Internal server error' }));
  }
});


module.exports = router
