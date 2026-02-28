import { useCallback } from "react";

// Dynamically injects the Razorpay checkout script once
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const API_URL = import.meta.env.VITE_API_URL || "";

const useRazorpay = () => {
  const initiatePayment = useCallback(async ({
    listingId,
    checkIn,
    checkOut,
    guests,
    user,          // { name, email, phone }
    onSuccess,
    onFailure,
    onCancel,
  }) => {
    // 1. Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      return onFailure?.("Razorpay failed to load. Check your internet connection.");
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      return onFailure?.("You must be logged in to book.");
    }

    try {
      // 2. Create order on your backend
      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId, checkIn, checkOut, guests }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        return onFailure?.(orderData.message || "Could not create order");
      }

      const { order, bookingId, breakdown } = orderData;

      // 3. Open Razorpay modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,         // in paise, from backend
        currency: order.currency,
        name: "WanderLust",
        description: `${breakdown.nights} night${breakdown.nights > 1 ? "s" : ""} · ₹${breakdown.pricePerNight.toLocaleString()}/night`,
        image: "/logo.png",           // optional: your logo
        order_id: order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: { bookingId: bookingId.toString() },
        theme: { color: "#E11D48" },  // WanderLust brand red

        handler: async (response) => {
          // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
          try {
            // 4. Verify payment on your backend
            const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ ...response, bookingId }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              onSuccess?.(verifyData.booking);
            } else {
              onFailure?.(verifyData.message || "Payment verification failed");
            }
          } catch {
            onFailure?.("Network error during verification. Contact support.");
          }
        },

        modal: {
          ondismiss: () => onCancel?.(),
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        onFailure?.(response.error.description || "Payment failed");
      });

      rzp.open();
    } catch (err) {
      onFailure?.(err.message || "Something went wrong");
    }
  }, []);

  return { initiatePayment };
};

export default useRazorpay;