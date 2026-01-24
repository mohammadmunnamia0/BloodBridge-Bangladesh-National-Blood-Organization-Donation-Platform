import { useState, useEffect } from "react";
import axios from "../utils/axios";

const DonorApplicationRequest = ({ onApplicationApproved }) => {
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [wantToApply, setWantToApply] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [medicalConditions, setMedicalConditions] = useState("");
  const [lastBloodDonationDate, setLastBloodDonationDate] = useState("");

  useEffect(() => {
    fetchUserData();
    checkApplicationStatus();
    // Auto-refresh application status every 5 seconds
    const interval = setInterval(checkApplicationStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/auth/profile");
      setUser(response.data.user);
      setMedicalConditions(response.data.user.medicalConditions || "");
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await axios.get("/donors/application-status");
      if (response.data.application) {
        setAlreadyApplied(true);
        
        // If application was approved, refresh user profile
        if (response.data.application.status === "approved") {
          try {
            const userResponse = await axios.get("/auth/profile");
            const updatedUser = userResponse.data.user;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            if (onApplicationApproved) {
              onApplicationApproved(updatedUser);
            }
          } catch (error) {
            console.error("Error refreshing user profile:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleApplyDonor = async () => {
    if (!user) {
      setErrorMessage("User data not loaded. Please refresh the page.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const applicationData = {
        bloodType: user.bloodType || "",
        age: user.dateOfBirth ? calculateAge(user.dateOfBirth) : "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth || "",
        weight: user.weight || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        gender: user.gender || "",
        medicalConditions: medicalConditions,
        lastBloodDonationDate: lastBloodDonationDate || null,
      };

      const response = await axios.post("/donors/apply", applicationData);
      setSuccessMessage(response.data.message || "Application submitted successfully!");
      setWantToApply(false);
      setAlreadyApplied(true);

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      console.error("Error submitting application:", error);
      setErrorMessage(
        error.response?.data?.message || "Error submitting application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyApplied) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800 font-semibold">
          ✓ You have already submitted a donor application. Please check the "Donor Application Status" tab for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{errorMessage}</p>
        </div>
      )}

      {!wantToApply ? (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-900 mb-4">Become a Verified Donor</h3>
          <p className="text-gray-700 mb-4">
            Help save lives by registering as a blood donor. Once approved, you'll gain access to the Donor List and
            be able to view other donors in your area.
          </p>

          <label className="flex items-center gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={wantToApply}
              onChange={(e) => setWantToApply(e.target.checked)}
              className="w-5 h-5 accent-red-600 cursor-pointer"
            />
            <span className="text-gray-800 font-medium">Yes, I want to apply for becoming a donor</span>
          </label>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Your Application</h3>
            <p className="text-sm text-gray-600 mb-4">
              We will use your registration information to process your donor application.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg mb-6">
              <div>
                <p className="text-sm text-gray-600">Blood Type</p>
                <p className="text-lg font-semibold text-gray-800">{user?.bloodType || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user?.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user?.dateOfBirth ? `${calculateAge(user.dateOfBirth)} years` : "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="text-lg font-semibold text-gray-800">{user?.weight ? `${user.weight} kg` : "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">{user?.gender || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="text-lg font-semibold text-gray-800">{user?.city || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">State</p>
                <p className="text-lg font-semibold text-gray-800">{user?.state || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Zip Code</p>
                <p className="text-lg font-semibold text-gray-800">{user?.zipCode || "Not provided"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-lg font-semibold text-gray-800">{user?.address || "Not provided"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Medical Conditions</p>
                <p className="text-lg font-semibold text-gray-800">{user?.medicalConditions || "None reported"}</p>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4 mb-6">
              <h4 className="font-bold text-blue-900 mb-4">📋 Additional Information</h4>
              
              {/* Medical Conditions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medical Conditions / Allergies
                </label>
                <textarea
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="List any medical conditions, allergies, or medications (e.g., Diabetes, Hypertension, Penicillin allergy)..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-vertical min-h-24"
                />
                <p className="text-xs text-gray-500 mt-1">This helps medical professionals assess your donation eligibility</p>
              </div>

              {/* Last Blood Donation Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Blood Donation Date
                </label>
                <input
                  type="date"
                  value={lastBloodDonationDate}
                  onChange={(e) => setLastBloodDonationDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if you have never donated before</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleApplyDonor}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
              <button
                onClick={() => setWantToApply(false)}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorApplicationRequest;
