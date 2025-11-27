import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PurchaseSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    if (location.state) {
      setTrackingNumber(location.state.trackingNumber);
      setPurchase(location.state.purchase);
    } else {
      // If no state, redirect to dashboard
      navigate("/blood-purchase-dashboard");
    }
  }, [location, navigate]);

  const handleTrackOrder = () => {
    navigate("/profile", { state: { tab: "shipping" } });
  };

  const handleViewDashboard = () => {
    navigate("/blood-purchase-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 animate-bounce">
              <svg
                className="w-12 h-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Purchase Successful!
            </h1>
            <p className="text-green-100 text-lg">
              Your blood purchase request has been submitted successfully
            </p>
          </div>

          {/* Tracking Number Section */}
          <div className="px-8 py-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Your Tracking Number
                </p>
                <div className="bg-white px-6 py-4 rounded-lg shadow-sm inline-block">
                  <p className="text-3xl font-bold text-blue-600 font-mono tracking-wider">
                    {trackingNumber}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Save this tracking number to check your order status
                </p>
              </div>
            </div>

            {/* Order Summary */}
            {purchase && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>
                <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Blood Type:</span>
                    <span className="font-bold text-red-600 text-lg">
                      {purchase.bloodType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Units:</span>
                    <span className="font-semibold text-gray-900">
                      {purchase.units}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Source:</span>
                    <span className="font-semibold text-gray-900">
                      {purchase.sourceName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Patient Name:</span>
                    <span className="font-semibold text-gray-900">
                      {purchase.patientName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Urgency:</span>
                    <span
                      className={`font-semibold px-3 py-1 rounded-full text-sm ${
                        purchase.urgency === "emergency"
                          ? "bg-red-100 text-red-800"
                          : purchase.urgency === "urgent"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {purchase.urgency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3 mt-3">
                    <span className="text-gray-900 font-semibold text-lg">
                      Total Cost:
                    </span>
                    <span className="font-bold text-green-600 text-2xl">
                      ৳{purchase.pricing?.totalCost?.toLocaleString()}
                    </span>
                  </div>
                  {purchase.expiryDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Blood Expiry Date:</span>
                      <span className="font-semibold text-orange-600">
                        {new Date(purchase.expiryDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Track Order Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Track Your Order
              </h3>
              <p className="text-gray-600 mb-4">
                Use your tracking number to monitor your order status in real-time
              </p>
              <button
                onClick={handleTrackOrder}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Track Order Now
              </button>
            </div>

            {/* Status Information */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">
                What happens next?
              </h4>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Your request will be reviewed by the source organization
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    You'll receive a confirmation once the order is approved
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Track your order status using the tracking number
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    You'll be notified when the blood is ready for pickup/delivery
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={handleViewDashboard}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-semibold"
              >
                View All Purchases
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
              >
                Back to Home
              </button>
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm mb-2">
                Need help with your order?
              </p>
              <p className="text-gray-800 font-semibold">
                Contact Support: <span className="text-red-600">09610-123456</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccess;
