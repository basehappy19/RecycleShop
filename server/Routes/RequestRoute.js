const express = require('express')
const { getRequestLink, SetStudentId, CreateRequestLink, SendBottle } = require('../Controllers/RequestController')
const router = express.Router()


router.get("/requestLink", getRequestLink)
router.post("/requestLink", CreateRequestLink)
router.post("/sendBottle", SendBottle)
router.put("/setStudentId", SetStudentId)


module.exports = router