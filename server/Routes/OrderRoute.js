const express = require("express");
const router = express.Router();

const { Order, OrderHistory } = require("../Controllers/OrderController");

router.post("/product/order/:productId", Order);
router.get("/order/history", OrderHistory);

module.exports = router;
