import express from "express";
import { createGroup, getGroups, getGroup, getGroupUsers, addUserToGroup, removeUserFromGroup, updateGroup, deleteGroup } from "../controllers/group.controller.js";
import firebaseAuth from "../middlewares/firebaseAuth.js";
import attachUser from "../middlewares/attachUser.js";
import roleGuard from "../middlewares/roleGuard.js";

const router = express.Router();

// All admin-protected
router.post("/", firebaseAuth, attachUser, roleGuard("admin"), createGroup);
router.get("/", firebaseAuth, attachUser, roleGuard("admin"), getGroups);
router.get("/:id", firebaseAuth, attachUser, roleGuard("admin"), getGroup);
router.put("/:id", firebaseAuth, attachUser, roleGuard("admin"), updateGroup);
router.delete("/:id", firebaseAuth, attachUser, roleGuard("admin"), deleteGroup);
router.get("/:id/users", firebaseAuth, attachUser, roleGuard("admin"), getGroupUsers);
router.post("/:id/users/:userId", firebaseAuth, attachUser, roleGuard("admin"), addUserToGroup);
router.delete("/:id/users/:userId", firebaseAuth, attachUser, roleGuard("admin"), removeUserFromGroup);

export default router;
