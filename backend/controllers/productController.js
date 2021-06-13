const ErrorHandler = require("../config/errorHandler");
const apiFeatures = require("../utils/apiFeatures");
const Product = require("./../models/Product");

// get all products -> /api/v1/products?keyword=apple

exports.getProducts = async (req, res, next) => {
    try {
        const products = await apiFeatures(Product.find(), req.query);

        const productCount = await Product.countDocuments();

        res.status(200).json({
            "success": true,
            "count": products.length,
            products,
            productCount
        })
        
    } catch (error) {
        next(error);
    }
}

// Create a new product -> /api/v1/admin/product/create

exports.postProduct = async (req, res, next) => {
    try {
        // adding loggedIn user id to product schema
        req.body.createdBy = req.user.id;

        const product = await Product.create(req.body);

        res.status(201).json({
            "success": true,
            product
        })
        
    } catch (error) {
        next(error);
    }
}

// Get a single product -> /api/v1/product/:id

exports.getSingleProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) return next(new ErrorHandler('Prdocut not found', 404));

        res.status(200).json({
            "success": true,
            product
        });
    } catch (error) {
        next(error);
    }     
};

// Update product -> /api/v1/admin/product/:id

exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        if (!product) return next(new ErrorHandler('Prdocut not found', 404));
    
        res.status(200).json({
            "success": true,
            product
        });

    } catch (error) {
        next(error);
    }
}

// Delete a product -> /api/v1/admin/product/:id

exports.deleteProducts = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) return next(new ErrorHandler('Prdocut not found', 404));

        await product.remove();

        res.status(200).json({
            "success": true,
            "message": "Product deleted"
        });

    } catch (error) {
        next(error);
    }
}

// Create/Update review -> /api/v1/review
exports.productReview = async (req, res, next) => {
    try {
        const { star_rating, comment, productId } = req.body;

        const review = {
            user: req.user.id,
            name: req.user.name,
            star_rating: Number(star_rating),
            comment
        }

        const product = await Product.findById(productId);

        const alreadyReviewed = product.reviews.find(r => {
            return r.user.toString() === req.user.id.toString();
        });

        if (!alreadyReviewed) {
            product.reviews.push(review);
            product.num_of_reviews = product.reviews.length;
        } else {
            product.reviews.forEach(r => {
                if (r.user.toString() === req.user.id.toString()) {
                    r.comment = review.comment,
                    r.star_rating = review.star_rating
                }
            });
        }

        product.avg_star_rating = product.reviews.reduce((acc, item) => {
            return item.star_rating + acc;
        }, 0) / product.reviews.length;

        await product.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true
        });

    } catch (error) {
        next(error);
    }
}

// Get Product Reviews -> /api/v1/reviews
exports.getProductReviews = async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.id);

        res.status(200).json({
            success: true,
            reviews: product.reviews
        });
    } catch (error) {
        next(error);
    }
}

// Delete a review (Admin & review owner) -> /api/v1/deleteReview
exports.deleteReview = async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.productId);

        const review = product.reviews.find(r => r.id.toString() === req.query.reviewId.toString());

        if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
            return next(new ErrorHandler('Invalid owner', 404));
        }

        const reviews = product.reviews.filter(r => r.id.toString() !== req.query.reviewId.toString());

        const num_of_reviews = reviews.length;

        let avg_star_rating = 0

        if (num_of_reviews >= 1) {
            avg_star_rating = reviews.reduce((acc, item) => {
                return item.star_rating + acc;
            }, 0) / reviews.length; 
        }

        console.log("av_rating", avg_star_rating)

        await Product.findByIdAndUpdate(req.query.productId, {
            reviews,
            avg_star_rating: Number(avg_star_rating),
            num_of_reviews
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true
        });
    } catch (error) {
        next(error);
    }
}