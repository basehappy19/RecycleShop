const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

exports.AddStudent = async (req, res) => {
    try {
        const { studentId, name, password } = req.body;

        let student = await prisma.student.findOne({ where: { studentId } });
        if (student) {
            return res
                .json({
                    message: "มีนักเรียนรหัสนี้ซ้ำในระบบอยู่แล้ว",
                    type: "error",
                })
                .status(400);
        }

        // Encrypt
        const salt = await bcrypt.genSalt(10);
       
        const hashPassword = await bcrypt.hash(password, salt);

        await prisma.student.create({
            data: { studentId, name, password: hashPassword },
        })
        res.json({
            message: `เพิ่มบัญชีนักเรียน ${studentId} เรียบร้อยแล้ว`,
            type: "success",
        }).status(201);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

exports.Auth = async (req, res) => {
    try {
        const { studentId, password } = req.body;
        let student = await prisma.student.findFirst({
            where: { studentId: studentId },
        });

        if (student) {
            const isMatch = await bcrypt.compare(password, student.password);
            if (!isMatch) {
                return res
                    .status(400)
                    .json({ message: "Password Invalid!!", type: "error" });
            }
            let payload = {
                id: student.id,
                fullName: student.fullName,
            };
            jwt.sign(payload, secretKey, { expiresIn: "1d" }, (err, token) => {
                if (err) throw err;
                res.json({ token, payload });
            });
        } else {
            res.status(400).json({
                message: "Student Not Found!!!",
                type: "error",
            });
        }
    } catch (err) {
        res.status(500).send("Server Error");
        console.error(err);
    }
};
