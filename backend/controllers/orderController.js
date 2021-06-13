const ErrorHandler = require("../config/errorHandler");
const Order = require("../models/Order");
const Product = require("./../models/Product");

// create a new order -> /api/v1/order/create
exports.createOrder = async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo
        } = req.body;

        const order = await Order.create({
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paidOn: Date.now(),
            user: req.user._id
        });

        res.status(200).json({
            success: true,
            order
        })

    } catch (error) {
        next(error)
    }
}

// get a single order -> /api/v1/order/:id
exports.getSingleOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) return next(new ErrorHandler('Order not found', 404));

        if (req.user.role !== 'admin' && order.user.id !== req.user.id) {
            return next(new ErrorHandler('Order not found for you', 404));
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
}

// get all orders for logged in user -> /api/v1/orders/me
exports.allOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id });

        if (orders.length == 0) {
            return next(new ErrorHandler('You do not have any orders as of now', 404));
        }

        res.status(200).json({
            success: true,
            orders
        });
        
    } catch (error) {
        next(error);
    }
}

// get all orders(Admin) -> /api/v1/admin/orders
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find();

        let totalAmount = 0;

        orders.forEach(order => totalAmount += order.totalPrice);

        res.status(200).json({
            success: true,
            orders,
            totalAmount
        });
    } catch (error) {
        next(error);
    }
}

// update order status(Admin) -> /api/v1/admin/manageOrder/:id
exports.manageOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order.orderStatus == "Delivered") {
            return next(new ErrorHandler('This order is already delivered', 400));
        }

        const updateProductStock = async (id, quantity) => {
            try {
                const product = await Product.findById(id);
            
                product.stock = product.stock - quantity;
            
                await product.save({ validateBeforeSave: false });
            } catch (error) {
                next(error);
            }
        }

        order.orderItems.forEach(async item => {
            await updateProductStock(item.product, item.quantity)
        });

        order.orderStatus = req.body.orderStatus;
        order.deliveredOn = Date.now();

        await order.save();
        
        res.status(200).json({
            success: true
        });
    } catch (error) {
        next(error);
    }
}

// Delete an order(Admin) -> /api/v1/admin/deleteOrder/:id 
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) return next(new ErrorHandler('Order not found', 404));

        res.status(200).json({
            success: true
        });
    } catch (error) {
        next(error)
    }
}