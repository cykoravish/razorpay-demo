"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://razorpay-demo-api.onrender.com";

function App() {
  const [formData, setFormData] = useState({
    amount: "",
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait time

    const checkRazorpay = () => {
      if (window.Razorpay) {
        console.log("Razorpay loaded successfully");
        setRazorpayLoaded(true);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkRazorpay, 100);
      } else {
        console.error("Razorpay failed to load after 5 seconds");
        setMessage("Failed to load payment gateway. Please refresh the page.");
      }
    };

    // Start checking immediately
    checkRazorpay();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.name || !formData.email) {
      setMessage("Please fill in all required fields");
      return;
    }

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      setMessage(
        "Razorpay SDK not loaded. Please refresh the page and try again."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Create order on backend
      const orderResponse = await axios.post(
        `${API_BASE_URL}/api/create-order`,
        {
          amount: Number.parseFloat(formData.amount),
          currency: "INR",
        }
      );

      const { order } = orderResponse.data;

      // Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Demo Store",
        description: "UPI Payment - Scan QR or use UPI apps",
        order_id: order.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          location: formData.location,
          payment_type: "upi_with_qr",
        },
        theme: {
          color: "#00D4AA",
          backdrop_color: "rgba(0, 0, 0, 0.5)",
        },
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
          emi: false,
          paylater: false,
          cardless_emi: false,
          bank_transfer: false,
        },
        config: {
          display: {
            blocks: {
              utib: {
                name: "UPI",
                instruments: [
                  {
                    method: "upi",
                    flows: ["qr", "collect", "intent"],
                  },
                ],
              },
            },
            sequence: ["block.utib"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        upi: {
          flow: ["qr", "collect", "intent"], // QR first
          apps: ["phonepe", "googlepay", "paytm", "bhim", "amazonpay"],
          qr: {
            show: true,
            size: "medium",
          },
        },
        display: {
          language: "en",
        },
        readonly: {
          email: false,
          contact: false,
        },
        modal: {
          confirm_close: true,
          escape: false,
          animation: true,
          backdropclose: false,
          ondismiss: () => {
            setMessage("Payment cancelled");
            setLoading(false);
          },
        },
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(
              `${API_BASE_URL}/api/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (verifyResponse.data.success) {
              setMessage("Payment successful! Thank you for your purchase.");
              setFormData({
                amount: "",
                name: "",
                email: "",
                phone: "",
                location: "",
              });
            } else {
              setMessage(
                "Payment verification failed. Please contact support."
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setMessage("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
      };

      // Create Razorpay instance with error handling
      try {
        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", (response) => {
          setMessage(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });

        rzp.open();
      } catch (razorpayError) {
        console.error("Razorpay initialization error:", razorpayError);
        setMessage("Failed to initialize payment gateway. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Razorpay Demo</h1>
          <p className="mt-2 text-gray-600">Complete your payment securely</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amount (₹) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="1"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your location"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !razorpayLoaded}
              className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                loading || !razorpayLoaded
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {!razorpayLoaded
                ? "Loading Payment Gateway..."
                : loading
                ? "Processing..."
                : "Pay Now"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-md ${
                message.includes("successful")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This is a demo application. Use test card details for payments.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
