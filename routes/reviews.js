const express = require('express');
const router = express.Router({mergeParams: true});

const Review = require('../models/review');
const Campground = require('../models/campground');
const reviews = require('../controllers/reviews');

const {validateReview, isLoggedIn, isReviewAuthor} = require('../utils/middleware');
const ExpressError = require('../utils/ExpressError');
const wrapAsync = require('../utils/wrapAsync');
const { reviewSchema } = require('../utils/validationSchema');

router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.createReview));

router.delete('/:reviewId', isReviewAuthor, wrapAsync(reviews.deleteReview));

module.exports = router;