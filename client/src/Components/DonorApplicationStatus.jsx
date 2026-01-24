import { useState, useEffect } from "react";
import axios from "../utils/axios";

const DonorApplicationStatus = ({ onStatusChange }) => {
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationStatus();
    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchApplicationStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      const response = await axios.get("/donors/application-status");
      const application = response.data.application;
      
      // If status changed to approved, refresh user data
      if (application && application.status === "approved") {
        try {
          const userResponse = await axios.get("/auth/profile");
          localStorage.setItem("user", JSON.stringify(userResponse.data.user));
          if (onStatusChange) {
            onStatusChange(userResponse.data.user);
          }
        } catch (error) {
          console.error("Error refreshing user profile:", error);
        }
      }
      
      setApplicationStatus(application);
    } catch (error) {
      console.error("Error fetching application status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!applicationStatus) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-semibold">
          No application found. Please go to "Donor Application Request" tab to apply.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Application Status */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">Your Donor Application Status</h3>
        <div className="space-y-2">
          <p className="text-blue-800">
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                applicationStatus.status === "approved"
                  ? "bg-green-200 text-green-800"
                  : applicationStatus.status === "rejected"
                  ? "bg-red-200 text-red-800"
                  : "bg-yellow-200 text-yellow-800"
              }`}
            >
              {applicationStatus.status.charAt(0).toUpperCase() + applicationStatus.status.slice(1)}
            </span>
          </p>
          <p className="text-blue-800">
            <span className="font-semibold">Submitted on:</span>{" "}
            {new Date(applicationStatus.appliedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {applicationStatus.status === "approved" && (
            <p className="text-green-700 font-semibold mt-2">
              ✓ You are now a Verified Donor! You can access the Donor List and view other donors.
            </p>
          )}
          {applicationStatus.status === "rejected" && applicationStatus.rejectionReason && (
            <p className="text-red-700 mt-2">
              <span className="font-semibold">Reason for Rejection:</span> {applicationStatus.rejectionReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorApplicationStatus;
