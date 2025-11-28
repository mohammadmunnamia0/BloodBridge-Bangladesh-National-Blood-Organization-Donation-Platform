import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Get user from localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
        } else {
          // If invalid data, clear it
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Clear invalid data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Left Side - Logo/Website Name */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent hover:from-red-400 hover:to-red-500 transition-all duration-300"
            >
              BloodBridge
            </Link>
          </div>

          {/* Center - Navigation Links (Desktop) */}
          <div className="hidden xl:flex space-x-6">
            <Link
              to="/"
              className={`text-sm transition-colors duration-300 relative group ${
                location.pathname === "/" 
                  ? "text-red-500 font-semibold" 
                  : "text-gray-600 hover:text-red-500"
              }`}
            >
              Home
              <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300 ${
                location.pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            <Link
              to="/hospitals"
              className={`text-sm transition-colors duration-300 relative group ${
                location.pathname === "/hospitals" 
                  ? "text-red-500 font-semibold" 
                  : "text-gray-600 hover:text-red-500"
              }`}
            >
              Hospitals
              <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300 ${
                location.pathname === "/hospitals" ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            <Link
              to="/organizations"
              className={`text-sm transition-colors duration-300 relative group ${
                location.pathname === "/organizations" 
                  ? "text-red-500 font-semibold" 
                  : "text-gray-600 hover:text-red-500"
              }`}
            >
              Organizations
              <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300 ${
                location.pathname === "/organizations" ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            <Link
              to="/blood-requests"
              className={`text-sm transition-colors duration-300 relative group ${
                location.pathname === "/blood-requests" 
                  ? "text-red-500 font-semibold" 
                  : "text-red-500 hover:text-red-600"
              }`}
            >
              <span className="inline-flex">
                {"Blood Requests".split("").map((char, index) => (
                  <span
                    key={index}
                    className="inline-block animate-wave-bold"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>
              <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300 ${
                location.pathname === "/blood-requests" ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            <Link
              to="/buy-blood"
              className={`text-sm transition-colors duration-300 relative group ${
                location.pathname === "/buy-blood" 
                  ? "text-red-500 font-semibold" 
                  : "text-gray-600 hover:text-red-500"
              }`}
            >
              Buy Blood
              <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300 ${
                location.pathname === "/buy-blood" ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            <Link
              to="/price-comparison"
              className={`text-sm transition-colors duration-300 relative group ${
                location.pathname === "/price-comparison" 
                  ? "text-red-500 font-semibold" 
                  : "text-gray-600 hover:text-red-500"
              }`}
            >
              Price Compare
              <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300 ${
                location.pathname === "/price-comparison" ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            {user && (
              <Link
                to="/profile"
                className={`text-sm transition-colors duration-300 relative group ${
                  location.pathname === "/profile" 
                    ? "text-red-500 font-semibold" 
                    : "text-gray-600 hover:text-red-500"
                }`}
              >
                My Profile
                <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300 ${
                  location.pathname === "/profile" ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </Link>
            )}
            {localStorage.getItem("isAdminLoggedIn") === "true" && (
              <Link
                to="/admin"
                className={`text-sm transition-colors duration-300 relative group ${
                  location.pathname.startsWith("/admin") 
                    ? "text-purple-700 font-semibold" 
                    : "text-purple-600 hover:text-purple-700"
                }`}
              >
                Admin
                <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                  location.pathname.startsWith("/admin") ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </Link>
            )}
          </div>

          {/* Right Side - Auth Buttons/User Menu (Desktop) */}
          <div className="hidden xl:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome,</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg hover:shadow-red-500/30 transform hover:scale-105 transition-all duration-300">
                    <span className="text-white text-sm font-medium">
                      {user.fullName?.charAt(0) || user.email?.charAt(0)}
                    </span>
                  </div>
                </div>
                <Link
                  to="/request-blood"
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white text-sm px-4 py-2 rounded-full hover:from-red-500 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/30"
                >
                  Request Blood
                </Link>
                <button
                  onClick={handleLogout}
                  className="relative inline-flex items-center justify-center px-4 py-2 overflow-hidden text-sm font-medium text-red-600 transition duration-300 ease-out border-2 border-red-500 rounded-full shadow-md group"
                >
                  <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-red-500 group-hover:translate-x-0 ease">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      ></path>
                    </svg>
                  </span>
                  <span className="absolute flex items-center justify-center w-full h-full text-red-500 transition-all duration-300 transform group-hover:translate-x-full ease">
                    Logout
                  </span>
                  <span className="relative invisible">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/register-donor"
                  className="text-sm text-gray-600 hover:text-red-500 transition-colors duration-300 relative group"
                >
                  Register
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/login"
                  className="relative inline-flex items-center justify-center px-4 py-2 overflow-hidden text-sm font-medium text-white transition duration-300 ease-out rounded-full shadow-md group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-red-600 group-hover:translate-x-0 ease">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      ></path>
                    </svg>
                  </span>
                  <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease">
                    Login
                  </span>
                  <span className="relative invisible">Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-red-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } xl:hidden transition-all duration-300 ease-in-out`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.pathname === "/" 
                  ? "text-red-500 bg-red-50 font-semibold border-l-4 border-red-500" 
                  : "text-gray-600 hover:text-red-500 hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/hospitals"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.pathname === "/hospitals" 
                  ? "text-red-500 bg-red-50 font-semibold border-l-4 border-red-500" 
                  : "text-gray-600 hover:text-red-500 hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Hospitals
            </Link>
            <Link
              to="/organizations"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.pathname === "/organizations" 
                  ? "text-red-500 bg-red-50 font-semibold border-l-4 border-red-500" 
                  : "text-gray-600 hover:text-red-500 hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Organizations
            </Link>
            <Link
              to="/blood-requests"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.pathname === "/blood-requests" 
                  ? "text-red-500 bg-red-50 font-semibold border-l-4 border-red-500" 
                  : "text-red-500 hover:text-red-600 hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="inline-flex flex-wrap">
                {"Blood Requests".split("").map((char, index) => (
                  <span
                    key={index}
                    className="inline-block animate-wave-bold"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>
            </Link>
            <Link
              to="/buy-blood"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.pathname === "/buy-blood" 
                  ? "text-red-500 bg-red-50 font-semibold border-l-4 border-red-500" 
                  : "text-gray-600 hover:text-red-500 hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Buy Blood
            </Link>
            <Link
              to="/price-comparison"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.pathname === "/price-comparison" 
                  ? "text-red-500 bg-red-50 font-semibold border-l-4 border-red-500" 
                  : "text-gray-600 hover:text-red-500 hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Price Comparison
            </Link>
            {user && (
              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === "/profile" 
                    ? "text-red-500 bg-red-50 font-semibold border-l-4 border-red-500" 
                    : "text-gray-600 hover:text-red-500 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Profile
              </Link>
            )}
            {user ? (
              <>
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">Welcome,</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.fullName?.charAt(0) || user.email?.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/request-blood"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Request Blood
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-500 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register-donor"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-red-500 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register as Donor
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
