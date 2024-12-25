// const Product = require("../Models/ProductModel")
// const ManageProduct = require("../Models/ManageProductModel")
// const Room = require("../Models/RoomModel")
// const OrderModel = require("../Models/OrderModel")
// const crypto = require('crypto')
// const ListOrder = require("../Models/ListOrderModel")
// const TypeOrder = require("../Models/TypeOrderModel")
// function generateOrderCode() {
//     return crypto.randomBytes(8).toString('hex');
// }

// exports.HistoryOrder = async (req,res) => {
//     try {
//         const { roomId } = req.body

//         const orderData = await OrderModel.findAll({
//             where: {
//                 roomId : roomId
//             },
//             include: [{
//                 model: ListOrder,
//                 attributes: ['productId'],
//                 include: [{
//                     model: Product,
//                     attributes: ['name', 'price'],
//                     include: [{
//                         model: ManageProduct,
//                         attributes: ['discount'] 
//                     }]
//                 }]
//             },
//             {
//                 model: TypeOrder,
//             }
//             ],
//             order: [['createdAt', 'DESC']],
//         })
//         res.send(orderData).status(200)
//     } catch (err) {
//         res.json({
//             message:"ไม่พบประวัติการสั่งซื้อ",
//             type:"error"
//         }).status(404)
//     }
// }

// exports.Order = async (req,res) => {
//     try {
//         const productId = parseInt(req.params.productId)
//         const productData = await Product.findOne({
//             where:{
//                 id:productId
//             },
//             include: [{
//                 model: ManageProduct,
//                 attributes: { exclude: ['id','productId'] },
//             }]
//         })
//         if(productData.manageProducts[0].openSale === false) {
//             return res.json({
//                 message: "สินค้านี้ปิดการขายแล้ว",
//                 type: "error"
//             }).status(400)
//         } else if (productData.manageProducts[0].inStock <= 0) {
//             return res.json({
//                 message: "สินค้านี้ไม่มีสต็อกในขณะนี้",
//                 type: "error"
//             }).status(400)
//         } else {
//             const { roomId, orderBy } = req.body
//             const checkPoint = await Room.findOne({
//                 select: ['id'],
//                 where:{roomId:roomId},
//                 attributes: { exclude: ['password','createdAt','updatedAt'] },
//             })

//             const price = productData.price
//             const roomPoint = checkPoint.point
            
//             if(price > roomPoint) {
//                 res.json({
//                     message: "จำนวนขวดของห้องไม่เพียงพอ",
//                     type: "error"
//                 }).status(400)
//             } else {
//                 const discountPercent = productData.manageProducts[0].discount
//                 const totalDiscount = (discountPercent / 100 ) * price
//                 const totalPrice = price - totalDiscount
//                 const remainingPoint = roomPoint - totalPrice

//                 await ManageProduct.increment(
//                     {sales: + 1},
//                     {where: {
//                         id: productId
//                     }}
//                 );

//                 await ManageProduct.decrement(
//                     {inStock: + 1},
//                     {where: {
//                         id: productId
//                     }}
//                 );
//                 const orderCodeKey = generateOrderCode();

//                 const orderData = {
//                     roomId: roomId,
//                     orderBy: orderBy,
//                     totalPrice: totalPrice,
//                     orderCodeKey: orderCodeKey,
//                     typeColorId: 1,
//                 }
//                 console.log(orderData);
                
//                 const createOrderData = await OrderModel.create(orderData)
//                 const listOrderData = {
//                         orderId: createOrderData.id,
//                         productId: productId
//                  }
//                 await ListOrder.create(listOrderData)
                
//                 await Room.update({
//                     point: remainingPoint
//                 },{
//                     where: {
//                         roomId: roomId
//                     }
//                 })
//                 res.json({
//                     message: "ซื้อ" + productData.name + "สำเร็จ",
//                     type:"success"
//                 }).status(200)
                
//             }
//         }

//     } catch (err) {
//         console.log(err);
//         res.json({
//             message:"ไม่พบสินค้านี้",
//             type:"error"
//         }).status(404)
//     }
// }


