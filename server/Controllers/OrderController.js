const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.OrderHistory = async (req, res) => {
    try {
        const user = req.user;

        const order = await prisma.order.findMany({
            where: {
                studentId: user.id,
            },
        });

        res.status(200).send(order);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

exports.Order = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await prisma.product.findFirst({
            where: {
                id: parseInt(productId),
            },
            include: {
                detail: true,
            },
        });
        if (product.detail.openSale === false) {
            return res
                .json({
                    message: "สินค้านี้ปิดการขายแล้ว",
                    type: "error",
                })
                .status(400);
        }
        if (product.detail.inStock <= 0) {
            return res
                .json({
                    message: "สินค้านี้ไม่มีสต็อกในขณะนี้",
                    type: "error",
                })
                .status(400);
        }

        const user = req.user;

        const totalDiscount = (product.detail.discount / 100) * product.price;
        const price = product.price - totalDiscount;

        if (price > user.point) {
            res.json({
                message: `จำนวนขวดของคุณไม่เพียงพอ ขาดอีก ${
                    price - user.point
                } ขวด`,
                type: "error",
            }).status(400);
        }
        await prisma.student.update({
            where: {
                id: user.id,
            },
            data: {
                point: {
                    decrement: price,
                },
            },
        });
        await prisma.product.update({
            where: {
                id: parseInt(productId),
            },
            data: {
                detail: {
                    update: {
                        inStock: {
                            decrement: 1,
                        },
                        sales: {
                            increment: 1,
                        },
                    },
                },
            },
        });

        await prisma.order.create({
            data: {
                studentId: user.id,
                totalPrice: price,
            },
        });

        res.json({
            message: `ซื้อสินค้า ${product.name} สำเร็จเรียบร้อย คงเหลือ ${
                user.point - price
            } ขวด`,
            type: "success",
        }).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};
