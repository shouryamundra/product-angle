const { ProductSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Product = require("./models/product");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateProduct = (req, res, next) => {
  const { error } = ProductSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if ((product.author = !req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/product/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/product/${id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isProfileOwner = async (req, res, next) => {
  const { user_id } = req.params;
  const id = req.user._id;
  console.log("the logged in id", id, "params id", user_id);
  if (id != user_id) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/product/${id}`);
  }
  next();
};
