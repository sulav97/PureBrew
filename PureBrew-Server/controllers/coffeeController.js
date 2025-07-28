const Coffee = require("../models/Coffee");

exports.createcoffee = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Admin access required" });
    const { name, description, pricePerGram, stock, image } = req.body;
    const newCoffee = await Coffee.create({ name, description, pricePerGram, stock, image });
    res.status(201).json(newCoffee);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getAllcoffees = async (req, res) => {
  try {
    const coffees = await Coffee.find();
    res.json(coffees);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getcoffeeById = async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id);
    res.json(coffee);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updatecoffee = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Admin access required" });
    const { name, description, pricePerGram, stock, image } = req.body;
    const updatedData = { name, description, pricePerGram, stock, image };
    const updated = await Coffee.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deletecoffee = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Admin access required" });
    await Coffee.findByIdAndDelete(req.params.id);
    res.json({ msg: "coffee deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getcoffeeByName = async (req, res) => {
  const { name } = req.params;
  const coffee = await Coffee.findOne({ name });
  if (!coffee) return res.status(404).json({ msg: "coffee bean not found" });
  res.json(coffee);
};
