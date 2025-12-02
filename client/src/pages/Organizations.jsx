import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { organizationsData } from "../utils/organizationsData";

const Organizations = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: "all", name: "All Organizations", icon: "🏢" },
    { id: "national", name: "National", icon: "🏥" },
    { id: "hospital", name: "Hospital", icon: "🏨" },
    { id: "digital", name: "Digital", icon: "💻" },
  ];

  // Get demo data based on category
  const getDemoData = () => {
    if (activeCategory === "all") {
      return [...organizationsData.national, ...organizationsData.hospital, ...organizationsData.digital];
    }
    return organizationsData[activeCategory] || [];
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const demoData = getDemoData();
        
        const url = activeCategory === "all" 
          ? "/public/organizations"
          : `/public/organizations?category=${activeCategory}`;
        
        const response = await axiosInstance.get(url);
        
        // Merge demo data with database data
        const dbData = response.data || [];
        const mergedData = [...demoData, ...dbData];
        
        setOrganizations(mergedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        // Even if API fails, show demo data
        const demoData = getDemoData();
        setOrganizations(demoData);
        setError(null); // Don't show error if we have demo data
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [activeCategory]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-red-600">
          Blood Donation Organizations
        </h1>
        <button
          onClick={() => alert('🚧 Under Construction\n\nThis feature is currently under development. Please check back later!')}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Register Your Organization
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 flex items-center gap-2
              ${
                activeCategory === category.id
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(organizations) && organizations.map((org) => (
            <div
              key={org._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{org.icon}</span>
                  <h2 className="text-xl font-bold text-gray-800">{org.name}</h2>
                </div>
                <p className="text-gray-600 mb-4">{org.description}</p>
                {org.contact && (
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Contact:</span> {org.contact}
                  </p>
                )}
                <div className="mt-auto pt-4">
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Organizations;
