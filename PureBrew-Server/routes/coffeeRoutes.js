const express = require("express");
const router = express.Router();
const coffeeController = require("../controllers/coffeeController");

const auth = require("../middleware/authMiddleware");

router.get("/", coffeeController.getAllcoffees);
router.get("/:id", coffeeController.getcoffeeById);
router.post("/", auth, coffeeController.createcoffee);
router.put("/:id", auth, coffeeController.updatecoffee);
router.delete("/:id", auth, coffeeController.deletecoffee);
router.get("/name/:name", coffeeController.getcoffeeByName);

module.exports = router;
