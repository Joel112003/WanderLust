import React, { useState, useEffect } from "react";
import {
  Shield,
  MapPin,
  Languages,
  Star,
  MessageCircle,
  Heart,
  Calendar,
  Award,
  Clock,
  Users,
  Phone,
  Mail,
  Copy,
  X,
} from "lucide-react";

const HostSection = ({ owner }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [listing, setListing] = useState([]);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [dialogAnimation, setDialogAnimation] = useState("enter");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Reset copied status after 2 seconds
  useEffect(() => {
    if (copiedField) {
      const timer = setTimeout(() => {
        setCopiedField(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedField]);

  // Handle dialog open/close with animations
  const handleOpenDialog = () => {
    setContactDialogOpen(true);
    setDialogAnimation("enter");
  };

  const handleCloseDialog = () => {
    setDialogAnimation("exit");
    setTimeout(() => {
      setContactDialogOpen(false);
    }, 300); // Match animation duration
  };

  // Get first letter of username for avatar fallback
  const getInitial = () => {
    if (!owner?.username) return "H";
    return owner.username.charAt(0).toUpperCase();
  };

  // Generate a background color based on the initial
  const getInitialBackgroundColor = () => {
    const colors = [
      "bg-rose-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-indigo-500",
    ];
    const initial = getInitial();
    const charCode = initial.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Calculate hosting duration based on createdAt
  const getHostingDuration = () => {
    if (!owner?.createdAt) return "New host";

    const joinDate = new Date(owner.createdAt);
    const currentDate = new Date();
    const yearsHosting = currentDate.getFullYear() - joinDate.getFullYear();

    if (yearsHosting <= 0) return "New host";
    return `Hosting for ${yearsHosting}+ years`;
  };

  // Format review display using reviews array
  const getReviewDisplay = () => {
    // Safely get reviews array (default to empty array if undefined)
    const reviews = listing?.reviews || [];
    const reviewCount = reviews.length;

    // Early return if no reviews
    if (reviewCount === 0) return "No reviews yet";

    // Calculate average rating (with safe fallbacks)
    const totalRating = reviews.reduce((sum, review) => {
      // Ensure each review has a valid rating (default to 0 if invalid)
      const rating = typeof review?.rating === "number" ? review.rating : 0;
      return sum + rating;
    }, 0);

    // Format to 1 decimal place (handles division automatically)
    const averageRating = (totalRating / reviewCount).toFixed(1);

    // Return appropriate string
    return `${averageRating} (${reviewCount} review${
      reviewCount !== 1 ? "s" : ""
    })`;
  };

  const responseRate = owner?.responseRate || "95%";
  const responseTime = owner?.responseTime || "within an hour";
  const totalGuests = owner?.totalGuests || 120;

  // Copy text to clipboard
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
  };

  // Contact information
  const contactInfo = {
    name: owner?.username || "Joel",
    email: owner?.email || "joel@example.com",
    phone: owner?.phone || "+1 (555) 123-4567",
    preferredContact: owner?.preferredContact || "Email"
  };

  return (
    <div
      className={`pb-8 border-t border-gray-200 pt-6 transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Top Section with Avatar and Name */}
      <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
        <div 
          className="relative mb-4 md:mb-0 md:mr-6 cursor-pointer"
          onClick={handleOpenDialog}
        >
          <div
            className={`
              h-28 w-28 rounded-full overflow-hidden shadow-lg 
              transform transition-all duration-500 ease-out
              ${isHovering ? "scale-110 shadow-xl" : "scale-100"}
              border-4 border-white
            `}
            style={{
              boxShadow: isHovering
                ? "0 10px 25px rgba(236, 72, 153, 0.3)"
                : "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {owner?.profilePic ? (
              <img
                src={owner.profilePic}
                alt={owner?.username || "Host"}
                className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-110"
              />
            ) : (
              <div
                className={`flex items-center justify-center h-full w-full ${getInitialBackgroundColor()} text-white`}
              >
                <span className="text-4xl font-bold">{getInitial()}</span>
              </div>
            )}
          </div>
          {owner?.superHost && (
            <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md transform rotate-12 animate-pulse">
              Superhost
            </div>
          )}
        </div>

        <div className="text-center md:text-left md:flex-1">
          <h2 
            className="text-3xl font-bold mb-3 relative inline-block group cursor-pointer"
            onClick={handleOpenDialog}
          >
            {/* Text with shimmer gradient */}
            <span
              style={{
                position: 'relative',
                color: 'transparent',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                backgroundImage: 'linear-gradient(to right, #111827, #f43f5e, #111827)',
                backgroundSize: '200% 100%',
                transition: 'background-position 2s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundPosition = '100% 0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundPosition = '0 0';
              }}
            >
              Hosted by {owner?.username || "Joel"}
            </span>

            {/* Underline that works */}
            <span
              className="
                absolute left-0 bottom-0 
                w-0 h-0.5 bg-rose-500 
                transition-all duration-300 ease-out 
                group-hover:w-full
              "
            ></span>
          </h2>
          <p className="text-gray-600 mb-2 flex items-center justify-center md:justify-start">
            <Calendar className="h-4 w-4 mr-2 text-rose-500" />
            <span className="font-medium">Joined:&nbsp;</span>{" "}
            {new Date(owner?.createdAt || Date.now()).toLocaleDateString(
              "en-US",
              {
                month: "long",
                year: "numeric",
              }
            )}
          </p>
          <div className="flex items-center justify-center md:justify-start text-gray-600 mb-3">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            <span className="font-medium">Verified Host</span>
          </div>

          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-blue-500" />
              Responds {responseTime}
            </span>
            <span className="flex items-center">
              <Award className="h-4 w-4 mr-1 text-purple-500" />
              {getHostingDuration()}
            </span>
          </div>
        </div>
      </div>

      {/* Host Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: <MapPin className="h-5 w-5 text-rose-500" />,
            title: "Location",
            value: owner?.location || "San Francisco, USA",
            delay: 100,
          },
          {
            icon: <Languages className="h-5 w-5 text-blue-500" />,
            title: "Languages",
            value: owner?.languages?.join(", ") || "English, Spanish",
            delay: 200,
          },
          {
            icon: <Clock className="h-5 w-5 text-green-500" />,
            title: "Response Rate",
            value: responseRate,
            delay: 300,
          },
          {
            icon: <Users className="h-5 w-5 text-amber-500" />,
            title: "Total Guests",
            value: totalGuests,
            delay: 400,
          },
        ].map((item, index) => (
          <div
            key={index}
            className={`
              bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-500
              transform hover:-translate-y-1 border border-gray-100
              ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }
            `}
            style={{ transitionDelay: `${item.delay}ms` }}
          >
            <div className="flex items-start">
              <div className="p-2 bg-gray-50 rounded-lg mr-3">{item.icon}</div>
              <div>
                <h3 className="font-medium text-gray-500 text-sm">
                  {item.title}
                </h3>
                <p className="font-semibold text-gray-800">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Host Bio */}
      <div
        className={`
          bg-gray-50 rounded-xl p-6 mb-8 transition-all duration-700 ease-out
          ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }
        `}
        style={{ transitionDelay: "500ms" }}
      >
        <h3 className="text-xl font-semibold mb-3">
          About {owner?.username || "Host"}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {owner?.bio ||
            "Hello! I'm a passionate host who loves to share my space with travelers from around the world. I enjoy hiking, photography, and exploring new cultures. I'm always available to help make your stay comfortable and memorable."}
        </p>
      </div>

      {/* Contact & Save Buttons */}
      <div
        className={`
          flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4
          transition-all duration-700 ease-out
          ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }
        `}
        style={{ transitionDelay: "600ms" }}
      >
        <button 
          className="flex-1 px-5 py-4 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1 active:translate-y-0 active:scale-95 shadow-md hover:shadow-xl"
          onClick={handleOpenDialog}
        >
          <MessageCircle className="h-5 w-5 mr-2 transition-transform duration-300 hover:rotate-12" />
          Contact Host
        </button>
        <button className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl hover:border-rose-300 hover:bg-rose-50 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1 active:translate-y-0 active:scale-95">
          <Heart className="h-5 w-5 mr-2 text-gray-500 transition-all duration-300 ease-in-out hover:text-rose-500 hover:scale-110" />
          Save to Favorites
        </button>
      </div>

      {/* Contact Host Dialog - Improved animation */}
      {contactDialogOpen && (
        <div 
          className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${dialogAnimation === "enter" ? "bg-opacity-50" : "bg-opacity-0"}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDialog();
          }}
        >
          <div 
            className={`
              bg-white rounded-2xl w-full max-w-md
              transition-all duration-300 ease-out
              ${dialogAnimation === "enter" 
                ? "opacity-100 scale-100 translate-y-0" 
                : "opacity-0 scale-95 translate-y-8"
              }
              shadow-2xl overflow-hidden
            `}
          >
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-5 border-b relative">
              <div className="absolute -top-32 left-0 right-0 h-32 bg-gradient-to-br from-rose-400 to-rose-600 opacity-20"></div>
              <h3 className="text-xl font-bold text-gray-800">Contact Host</h3>
              <button 
                onClick={handleCloseDialog}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Dialog Content */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {/* Host Avatar and Name */}
              <div className="flex items-center mb-6">
                <div className="mr-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-600 opacity-20 rounded-full animate-pulse"></div>
                  {owner?.profilePic ? (
                    <img
                      src={owner.profilePic}
                      alt={owner?.username || "Host"}
                      className="h-16 w-16 rounded-full object-cover border-2 border-white relative z-10 shadow-md"
                    />
                  ) : (
                    <div className={`flex items-center justify-center h-16 w-16 rounded-full ${getInitialBackgroundColor()} text-white shadow-md relative z-10`}>
                      <span className="text-xl font-bold">{getInitial()}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{contactInfo.name}</h4>
                  <p className="text-sm text-gray-500">
                    {owner?.superHost ? "Superhost • " : ""}{getHostingDuration()}
                  </p>
                </div>
              </div>
              
              {/* Contact Info List */}
              <div className="space-y-4">
                {/* Email */}
                <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-all duration-300 hover:border-blue-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-full mr-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Email</p>
                      <p className="font-medium">{contactInfo.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(contactInfo.email, 'email')}
                    className={`p-2 rounded-full transition-all duration-300 ${copiedField === 'email' ? 'bg-green-100' : 'hover:bg-gray-100'}`}
                  >
                    {copiedField === 'email' ? (
                      <span className="text-green-500 text-xs font-medium px-2">Copied!</span>
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                
                {/* Phone */}
                <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-all duration-300 hover:border-green-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-50 rounded-full mr-3">
                      <Phone className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Phone</p>
                      <p className="font-medium">{contactInfo.phone}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(contactInfo.phone, 'phone')}
                    className={`p-2 rounded-full transition-all duration-300 ${copiedField === 'phone' ? 'bg-green-100' : 'hover:bg-gray-100'}`}
                  >
                    {copiedField === 'phone' ? (
                      <span className="text-green-500 text-xs font-medium px-2">Copied!</span>
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                
                {/* Preferred Contact Method */}
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                  <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 text-rose-500 mr-2" />
                    <p className="text-sm">
                      <span className="font-medium">{contactInfo.name}</span> prefers to be contacted via <span className="font-semibold text-rose-600">{contactInfo.preferredContact}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Response Time */}
              <div className="mt-6 bg-blue-50 p-4 rounded-xl flex items-center border border-blue-100">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <p className="text-sm text-blue-700">
                  Usually responds {responseTime}
                </p>
              </div>
            </div>
            
            {/* Dialog Footer */}
            <div className="p-5 border-t">
              <button
                onClick={handleCloseDialog}
                className="w-full py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostSection;