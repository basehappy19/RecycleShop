const express = require("express");
const router = express.Router();
const { AddStudent, Auth } = require("../Controllers/AuthController");

router.post("/student", AddStudent);
router.post("/auth", Auth);

module.exports = router;
