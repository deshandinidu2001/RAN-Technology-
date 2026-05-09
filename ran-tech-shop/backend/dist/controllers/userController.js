"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const server_1 = require("../server");
const getAllUsers = async (req, res) => {
    try {
        const users = await server_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=userController.js.map