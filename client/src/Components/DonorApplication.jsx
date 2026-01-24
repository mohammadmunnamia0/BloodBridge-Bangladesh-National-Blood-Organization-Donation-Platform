import { useState, useEffect } from "react";
import axios from "../utils/axios";

const DonorApplication = () => {
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [wantToApply, setWantToApply] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchApplicationStatus();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/auth/profile");
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchApplicationStatus = async () => {
    try {
      const response = await axios.get("/donors/application-status");
      setApplicationStatus(response.data.application);
    } catch (error) {
      console.error("Error fetching application status:", error);
    } finally {
      setLoading(false);
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
        medicalConditions: user.medicalConditions || "",
      };

      const response = await axios.post("/donors/apply", applicationData);
      setSuccessMessage(response.data.message || "Application submitted successfully!");
      setApplicationStatus(response.data.application);
      setWantToApply(false);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
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

      {/* Application Status - If Already Applied */}
      {applicationStatus ? (
        <>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3">Your Donor Application</h3>
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

            {applicationStatus.status === "rejected" && (
              <button
                onClick={() => setWantToApply(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Reapply
              </button>
            )}
          </div>

          {/* Show Application Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Application Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Blood Type</p>
                <p className="text-lg font-semibold text-gray-800">{applicationStatus.bloodType || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="text-lg font-semibold text-gray-800">
                  {applicationStatus.dateOfBirth
                    ? new Date(applicationStatus.dateOfBirth).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-lg font-semibold text-gray-800">
                  {applicationStatus.age ? `${applicationStatus.age} years` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="text-lg font-semibold text-gray-800">
                  {applicationStatus.weight ? `${applicationStatus.weight} kg` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {applicationStatus.gender || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="text-lg font-semibold text-gray-800">{applicationStatus.city || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">State</p>
                <p className="text-lg font-semibold text-gray-800">{applicationStatus.state || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Zip Code</p>
                <p className="text-lg font-semibold text-gray-800">{applicationStatus.zipCode || "N/A"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-lg font-semibold text-gray-800">{applicationStatus.address || "N/A"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Medical Conditions</p>
                <p className="text-lg font-semibold text-gray-800">
                  {applicationStatus.medicalConditions || "None reported"}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* No application yet - Show checkbox prompt */
        <>
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
            /* Confirmation - Show user data and Apply button */
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Your Registration Information</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We'll use your registration information for your donor application. Please confirm the details below are
                  correct.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
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
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
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

              <p className="text-sm text-gray-500 text-center">
                Your application will be reviewed by our team. You'll receive an email notification once a decision has been made.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DonorApplication;
