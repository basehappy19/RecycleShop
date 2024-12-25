const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function generateRandomCode(length = 4) {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return result;
}

exports.getRequestLink = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).send("Missing code");
        }

        const now = new Date();

        const binKey = req.header("binKey");

        let link;

        if (binKey) {
            link = await prisma.requestQRCode.findFirst({
                where: {
                    code: code,
                    bin: {
                        key: binKey,
                    },
                },
            });
        } else {
            link = await prisma.requestQRCode.findFirst({
                include: {
                    student: {
                        select: {
                            id: true,
                            fullName: true,
                            point: true,
                        },
                    },
                },
                where: {
                    code: code,
                    status: {
                        notIn: ["COMPLETED"],
                    },
                    expiredAt: {
                        gte: now,
                    },
                },
            });
        }

        if (!link) {
            return res.status(404).send("Link not found");
        }

        res.status(200).send(link);
    } catch (e) {
        res.status(500).send("Server Error");
        console.log(e);
    }
};

exports.CreateRequestLink = async (req, res) => {
    try {
        const url = process.env.CLIENT_URL;
        const uniqueCode = generateRandomCode();
        const binKey = req.header("binKey");

        const bin = await prisma.bin.findFirst({
            where: {
                key: binKey,
            },
        });

        if (!bin || !binKey) {
            return res.status(404).send("Access denied");
        }

        const Url = `${url}?code=${uniqueCode}`;

        const expiredAt = new Date(Date.now() + 30 * 60 * 1000); //

        const link = await prisma.requestQRCode.create({
            data: {
                link: Url,
                code: uniqueCode,
                expiredAt: expiredAt,
                binId: bin.id,
            },
        });

        res.status(200).send(link);
    } catch (e) {
        res.status(500).send("Server Error");
        console.log(e);
    }
};

exports.SendBottle = async (req, res) => {
    try {
        const { bottle, studentId, code } = req.body;
        const binKey = req.header("binKey");

        const bin = await prisma.bin.findFirst({
            where: {
                key: binKey,
            },
        });

        if (!bin || !binKey) {
            return res.status(404).send("Access denied");
        }

        const student = await prisma.student.findFirst({
            where: {
                id: parseInt(studentId),
            },
        });

        if (!student) {
            return res.status(404).send("Student not found");
        }

        await prisma.student.update({
            where: {
                id: student.id,
            },
            data: {
                point: {
                    increment: parseInt(bottle),
                },
                totalPoint: {
                    increment: parseInt(bottle),
                },
            },
        });
        const requestQRCode = await prisma.requestQRCode.findFirst({
            where: {
                code: code,
                status: "STUDENT_ID_RECEIVED",
            },
        });

        await prisma.requestQRCode.update({
            data: {
                status: "COMPLETED",
                bottleCount: parseInt(bottle),
                bin: {
                    update: {
                        totalBottle: {
                            increment: parseInt(bottle),
                        },
                    }
                },
            },
            where: {
                id: requestQRCode.id,
            },
        });

        res.status(200).json({
            message: `${student.studentId} ได้รับ ${bottle}`,
            point: `ปัจจุปันมี ${student.point} แต้ม`,
        });
    } catch (e) {
        res.status(500).send("Server Error");
        console.log(e);
    }
};

exports.SetStudentId = async (req, res) => {
    try {
        const { code, studentId } = req.body;
        const now = new Date();

        const request = await prisma.requestQRCode.findFirst({
            where: {
                status: "WAITING_FOR_SCAN",
                code: code,
                expiredAt: {
                    gte: now,
                },
            },
        });

        if (!request) {
            return res
                .status(404)
                .send("QR Code not found or already set student ID");
        }

        const student = await prisma.student.findFirst({
            where: {
                studentId: studentId,
            },
        });

        if (!student) {
            return res.status(404).send("Student not found");
        }

        await prisma.requestQRCode.update({
            where: {
                id: request.id,
            },
            data: {
                status: "STUDENT_ID_RECEIVED",
                studentId: student.id,
            },
        });

        return res.status(200).json({
            studentId: student.studentId,
            fullName: student.fullName,
            point: student.point,
        });
    } catch (e) {
        res.status(500).send("Server Error");
        console.log(e);
    }
};
