// const Product = require("../Models/ProductModel")
// const ManageProduct = require("../Models/ManageProductModel")

// exports.AllProduct = async (req,res) => {
//     try {
//         const productData = await Product.findAll({
//             include: [{
//                 model: ManageProduct,
//                 attributes: { exclude: ['id','productId'] },
//                 where:{openSale : 1}
//             }]
//         })
        
//         res.send(productData)
//     } catch (err) {
//         res.json({
//             message:"ไม่พบสินค้า",
//             type:"error"
//         })
//     }
// }

// exports.AddProduct = async (req,res) => {
//     try {
//         const { name, price } = req.body
//         const productData = {
//             name,
//             price
//         }
        
//         const product = await Product.create(productData)
//         const manageProductData = {
//             productId: product.id
//         }

//         await ManageProduct.create(manageProductData)

//         res.json({
//             message:"เพิ่มสินค้าเรียบร้อย",
//             type:"success"
//         })

//     } catch (err) {
//         res.json({
//             message:"เพิ่มสินค้าไม่ได้",
//             type:"error"
//         })
//     }
// }
