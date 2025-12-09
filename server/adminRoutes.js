import express from "express";
import { storage } from "./storage.js"; // 👈 important: add .js here
const router = express.Router();
// 🧠 Get all players
router.get("/players", async (_req, res) => {
    try {
        const players = await storage.getAllPlayers();
        res.json(players);
    }
    catch (err) {
        console.error("Error fetching players:", err);
        res.status(500).json({ error: "Failed to load players" });
    }
});
// ✅ Approve player (also publishes)
router.post("/approve/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.session?.user?.id || "system"; // fallback
        const updated = await storage.approvePlayer(id, adminId);
        res.json(updated);
    }
    catch (err) {
        console.error("Error approving player:", err);
        res.status(500).json({ error: "Failed to approve player" });
    }
});
// 🚫 Reject player
router.post("/reject/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.session?.user?.id || "system";
        const updated = await storage.rejectPlayer(id, adminId);
        res.json(updated);
    }
    catch (err) {
        console.error("Error rejecting player:", err);
        res.status(500).json({ error: "Failed to reject player" });
    }
});
// 💤 Deactivate player
router.post("/deactivate/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await storage.deactivatePlayer(id);
        res.json(updated);
    }
    catch (err) {
        console.error("Error deactivating player:", err);
        res.status(500).json({ error: "Failed to deactivate player" });
    }
});
// 🔁 Reactivate player
router.post("/activate/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await storage.activatePlayer(id);
        res.json(updated);
    }
    catch (err) {
        console.error("Error activating player:", err);
        res.status(500).json({ error: "Failed to activate player" });
    }
});
// ❌ Delete player
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await storage.deletePlayer(id);
        res.json({ success: true });
    }
    catch (err) {
        console.error("Error deleting player:", err);
        res.status(500).json({ error: "Failed to delete player" });
    }
});
export default router;
