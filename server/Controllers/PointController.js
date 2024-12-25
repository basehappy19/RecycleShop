// const Room = require("../Models/RoomModel")
// exports.AddPoint = async (req, res) => {
//     try {
//         const { bottle_total, roomId } = req.body

//         const roomData = await Room.findOne({ where: { roomId: roomId } })

//         if (!roomData) {
//             return res.json({ message: 'Room not found', type: 'error' }).status(404)
//         }

//         roomData.point += bottle_total
//         roomData.total_point += bottle_total
//         await roomData.save()
//         res.json({ message: `${roomData.name} There are bottles left ${roomData.point}`, type:'success' }).status(200)
//     } catch (e) {
//         console.log(e);
//         res.send('Server Error').status(500)
//     }
// }