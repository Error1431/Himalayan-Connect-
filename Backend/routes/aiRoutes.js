const express = require("express");
const router = express.Router();
const { queryAI, getProductAnalysis, getAllProducts, getSeasonalCalendar, assistantChat } = require("../controllers/aiController");
const { aiLimiter } = require("../middleware/rateLimiter");

router.post("/query", queryAI);
router.get("/products", getAllProducts);
router.get("/product-analysis", getProductAnalysis);
router.get("/seasonal-calendar", getSeasonalCalendar);
router.post("/assistant", aiLimiter, assistantChat);

module.exports = router;