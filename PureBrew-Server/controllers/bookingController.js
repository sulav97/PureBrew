const Booking = require("../models/Booking");

const createBooking = async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress, contact, paymentMethod, paymentStatus, khaltiTransactionId } = req.body;
    
    const bookingData = {
      userId: req.user._id,
      products,
      totalAmount,
      shippingAddress,
      contact,
      paymentMethod,
      paymentStatus,
      khaltiTransactionId
    };

    const booking = await Booking.create(bookingData);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    let userId = req.user._id;
    if (req.user.isAdmin && req.query.userId) {
      userId = req.query.userId;
    }
    const bookings = await Booking.find({ user: userId }).populate("coffee");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Admin access required" });
    const bookings = await Booking.find().populate("user coffee");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Admin access required" });
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user coffee");
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus
};
