// const Room = require("../Models/RoomModel")
// const bcrypt = require("bcryptjs")
// const jwt = require("jsonwebtoken")
// require("dotenv").config();

// const secretKey = process.env.SECRET_KEY

// exports.AddRoom = async (req,res) => {
//     try {
//         const { roomId, name, password } = req.body

//         var room = await Room.findOne({ where: { roomId: roomId } })
//         if(room){
//             return res.json({ message: 'มีห้องนี้แล้ว',type: "error"}).status(400)
//         } 

//         // Encrypt
//         const salt = await bcrypt.genSalt(10)
//         const roomData = {
//             roomId,
//             name,
//             password
//         }
//         roomData.password = await bcrypt.hash(password, salt)

//         await Room.create(roomData)
//         res.json({
//             message: "สร้างบัญชีผู้ใช้เรียบร้อย",
//             type: "success"
//         }).status(201)
//     } catch (err) {
//         console.log(err);
//         res.json({
//             message:"เพิ่มห้องไม่สำเร็จ",
//             type:"error"
//         })
//     }
// }

// exports.Login = async(req, res) => {
//     try {
//         const { roomId, password } = req.body;
//         var room = await Room.findOne({ where: { roomId: roomId }});
        
//         if(room) {
//             const isMatch = await bcrypt.compare(password, room.password);
//             if(!isMatch){
//                 return res.status(400).json({message:"Password Invalid!!",type:"error"});
//             }
//             var payload = {
//                 id: room.roomId,
//                 name: room.name,
//             };
//             jwt.sign(payload,secretKey,{ expiresIn: '1d'},(err,token)=>{
//                 if(err) throw err;
//                 res.json({token,payload})
//             })
//         } else {
//             res.status(400).json({message:"User Not Found!!!",type:"error"});
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             message: 'Login Error',
//         });
//     }
// };