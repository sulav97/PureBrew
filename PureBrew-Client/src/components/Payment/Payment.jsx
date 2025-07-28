import { useEffect, useState } from "react";
import KhaltiCheckout from "khalti-checkout-web";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../api/api";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { generateEsewaSignature } from "../../utils/esewaSignature";
import { verifyFormDataIntegrity, verifyAPIResponseIntegrity } from '../../utils/integrityUtils';

const publicTestKey = "test_public_key_402c2b0e98364222bb1c1ab02369cefd";

const Payment = ({
  cart,
  address,
  contact,
  paymentMethod,
  total,
  setError,
  setLoading,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState(null);

  const config = {
    publicKey: publicTestKey,
    productIdentity: "PureBrew-coffees-order",
    productName: "Pure Brew beans",
    productUrl: "http://localhost:5174",
    eventHandler: {
      onSuccess(payload) {
        handlePaymentSuccess(payload.token);
      },
      onError(error) {
        setError("Payment failed. Please try again.");
        setLoading(false);
      },
      onClose() {
        setLoading(false);
      },
    },
    paymentPreference: [
      "KHALTI",
      "EBANKING",
      "MOBILE_BANKING",
      "CONNECT_IPS",
      "SCT",
    ],
  };

  useEffect(() => {
    // Initialize KhaltiCheckout instance
    const khaltiCheckout = new KhaltiCheckout(config);
    setCheckout(khaltiCheckout);

    // Cleanup the KhaltiCheckout instance on component unmount
    return () => {
      // khaltiCheckout.destroy(); // Use this if KhaltiCheckout has a destroy method
    };
  }, []); // Run useEffect only once during component mount

  const handlePaymentSuccess = async (transactionId = null) => {
    try {
      // Send each cart item as a separate booking
      for (const item of cart) {
        const bookingData = {
          coffee: item.id,
          quantity: item.quantity,
          totalPrice: item.totalPrice * item.quantity,
          address: address,
          phone: contact,
          weight: item.weight,
          pricePerGram: item.totalPrice,
          paymentMethod: paymentMethod,
          khaltiTransactionId: transactionId
        };
        
        await createBooking(bookingData);
      }
      
      clearCart();
      onSuccess();
      navigate("/success");
    } catch (err) {
      console.error("Error creating booking:", err);
      
      // Check if it's a network error
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError("Network error: Please check if the server is running and try again.");
        toast.error("Network error: Please check if the server is running and try again.");
      } else {
        setError(err.message || "Failed to complete order");
        toast.error(err.message || "Failed to complete order");
      }
      setLoading(false);
    }
  };

  const handleCashOnDelivery = async () => {
    try {
      // Send each cart item as a separate booking
      for (const item of cart) {
        const bookingData = {
          coffee: item.id,
          quantity: item.quantity,
          totalPrice: item.totalPrice * item.quantity,
          address: address,
          phone: contact,
          weight: item.weight,
          pricePerGram: item.totalPrice,
          paymentMethod: 'cod'
        };
        
        await createBooking(bookingData);
      }
      
      clearCart();
      onSuccess();
      navigate("/success");
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(err.message || "Failed to complete order");
      toast.error(err.message || "Failed to complete order");
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    
    if (!contact || !address) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // ✅ Verify payment data integrity
    const paymentData = {
      contact,
      address,
      cart,
      paymentMethod,
      total
    };

    if (!verifyFormDataIntegrity(paymentData)) {
      toast.error("Invalid payment data detected.");
      return;
    }

    if (cart.length === 0) return;
    
    setLoading(true);
    
    if (paymentMethod === "khalti") {
      if (checkout) {
        checkout.show({ amount: total * 100 }); // Khalti expects amount in paisa (multiply by 100)
      } else {
        console.error("KhaltiCheckout is not initialized");
        setError("Payment system not ready. Please try again.");
        setLoading(false);
      }
    } else if (paymentMethod === "cod") {
      try {
        // Send each cart item as a separate booking
        for (const item of cart) {
          const bookingData = {
            products: [{
              productId: item._id,
              quantity: item.quantity,
              price: item.price
            }],
            totalAmount: item.price * item.quantity,
            shippingAddress: address,
            contact: contact,
            paymentMethod: "Cash on Delivery",
            paymentStatus: "Pending"
          };

          const response = await createBooking(bookingData);
          
          // ✅ Verify API response integrity
          if (!verifyAPIResponseIntegrity(response)) {
            toast.error("Invalid response from server");
            return;
          }
        }

        toast.success("Order placed successfully! Pay on delivery.");
        setCart([]);
        navigate("/success");
      } catch (error) {
        toast.error("Failed to place order. Please try again.");
      }
    } else if (paymentMethod === "esewa") {
      handleEsewaPayment();
    }
  };

  const handleEsewaPayment = async () => {
    try {
      // First, create bookings for all cart items
      for (const item of cart) {
        const bookingData = {
          coffee: item.id,
          quantity: item.quantity,
          totalPrice: item.totalPrice * item.quantity,
          address: address,
          phone: contact,
          weight: item.weight,
          pricePerGram: item.totalPrice,
          paymentMethod: 'esewa'
        };
        
        await createBooking(bookingData);
      }
      
      clearCart();
      onSuccess();
      navigate("/success");
    } catch (err) {
      console.error("Error creating booking for eSewa:", err);
      setError(err.message || "Failed to prepare eSewa payment");
      toast.error(err.message || "Failed to prepare eSewa payment");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleConfirmOrder}
        className="text-xs bg-black text-white py-2 px-3 border border-black rounded-[2px] font-semibold w-full hover:text-black hover:bg-white transition ease-linear"
        disabled={cart.length === 0}
      >
        {paymentMethod === "khalti" ? "Pay with Khalti" : 
         paymentMethod === "esewa" ? "Pay with eSewa" : 
         "Complete Order (Cash on Delivery)"}
      </button>
    </div>
  );
};

export default Payment; 