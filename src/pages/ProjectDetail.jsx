import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "../hooks/useProjects";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  calculateROI,
  calculateProfit,
} from "../utils/formatters";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import ContactForm from "../components/ContactForm";
import { projectStatus } from "../types/project";
import {
  Home,
  Bed,
  Bath,
  Ruler,
  Calendar,
  TrendingUp,
  Euro,
  ArrowLeft,
  MapPin,
  Check,
  Star,
  Share2,
  Heart,
  Phone,
  Mail,
  Globe,
  Car,
  Wifi,
  Shield,
  TreePine,
  Dumbbell,
  Waves,
  ShoppingBag,
  GraduationCap,
  Plane,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Expand,
  Download,
  ExternalLink,
} from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const galleryRef = useRef(null);

  // Parse images from project data
  const getProjectImages = () => {
    try {
      if (project?.images_data) {
        const parsedImages = JSON.parse(project.images_data);
        if (parsedImages && parsedImages.length > 0) {
          return parsedImages;
        }
      }
      // Fallback to single image_url or default
      if (project?.image_url) {
        return [{ url: project.image_url, tag: '', isMain: true }];
      }
      return [{ 
        url: `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop`,
        tag: '',
        isMain: true
      }];
    } catch (error) {
      console.error('Error parsing project images:', error);
      const fallbackUrl = project?.image_url 
        ? project.image_url 
        : `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop`;
      return [{ url: fallbackUrl, tag: '', isMain: true }];
    }
  };

  const imageData = getProjectImages();
  const imageGallery = imageData.map(img => img.url);

  // Mock amenities data
  const amenities = [
    { icon: Car, label: "Parking Space", available: true },
    { icon: Wifi, label: "High Speed Internet", available: true },
    { icon: Shield, label: "24/7 Security", available: true },
    { icon: TreePine, label: "Garden & Terrace", available: true },
    { icon: Dumbbell, label: "Gym & Fitness", available: false },
    { icon: Waves, label: "Swimming Pool", available: false },
    { icon: ShoppingBag, label: "Shopping Center", available: true },
    { icon: GraduationCap, label: "Schools Nearby", available: true },
    { icon: Plane, label: "Airport Access", available: true },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageGallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: `Check out this amazing property: ${project.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced loading skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-200 rounded"></div>)}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-red-50 border-red-200">
          <CardContent className="pt-6 text-center">
            <div className="text-red-600 mb-4">
              <Home className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Property Not Found</h3>
            <p className="text-red-700 mb-4">The property you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/projects")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate financial metrics safely
  const purchasePrice = project.purchase_price || project.price || 0;
  const transferFees = project.transfer_fees || 0;
  const renovationCost = project.renovation_cost || 0;
  const sellingPrice = project.selling_price || 0;
  
  const totalInvestment = purchasePrice + transferFees + renovationCost;
  const totalProfit = calculateProfit(purchasePrice, sellingPrice, transferFees + renovationCost);
  const roi = calculateROI(purchasePrice, sellingPrice, transferFees + renovationCost);

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case projectStatus.AVAILABLE:
        return "bg-green-100 text-green-800 border-green-200";
      case projectStatus.SOLD:
        return "bg-red-100 text-red-800 border-red-200";
      case projectStatus.RESERVED:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "details", label: "Property Details", icon: Ruler },
    { id: "financials", label: "Investment Analysis", icon: TrendingUp },
    { id: "location", label: "Location & Amenities", icon: MapPin },
    { id: "documents", label: "Documents", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb & Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/projects")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? "text-red-600 hover:text-red-700" : ""}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-600' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={imageGallery[currentImageIndex]}
                  alt={`${project.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-96 object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />
                
                {/* Image Navigation */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {imageGallery.length}
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute bottom-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <Expand className="h-4 w-4" />
                </button>

                {/* Badges - Status on main image, Custom tags on others */}
                <div className="absolute top-4 left-4 space-y-2">
                  {currentImageIndex === 0 ? (
                    // Show status badges only on main (first) image
                    <>
                      {project.golden_visa && (
                        <span className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          🏆 Golden Visa Eligible
                        </span>
                      )}
                      <span
                        className={`block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeClasses(project.status)}`}
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </>
                  ) : (
                    // Show custom tag on secondary images (if it exists)
                    imageData[currentImageIndex]?.tag && (
                      <span className="inline-block bg-black/80 text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg">
                        {imageData[currentImageIndex].tag}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {imageGallery.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Property Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span className="text-lg">{project.area}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {formatCurrency(project.price)}
                    </div>
                    {sellingPrice > 0 && roi > 0 && (
                      <div className="text-sm text-green-600 font-semibold">
                        Expected ROI: {formatPercentage(roi)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Bed className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold text-lg">{project.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Bath className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold text-lg">{project.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Ruler className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold text-lg">{formatNumber(project.size)}</div>
                    <div className="text-sm text-gray-600">sqm</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold text-lg">{project.completion_year}</div>
                    <div className="text-sm text-gray-600">Built</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Card>
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <CardContent className="pt-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Property Description</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {project.description || 
                          "This exceptional property offers modern living in a prime location. With carefully designed spaces and high-quality finishes, it represents an excellent investment opportunity in today's real estate market. The property combines comfort, style, and strategic location to deliver outstanding value for discerning investors."
                        }
                      </p>
                    </div>

                    {project.golden_visa && (
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                          <Star className="h-5 w-5 mr-2" />
                          Golden Visa Benefits
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                          <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Minimum investment: €250,000
                          </div>
                          <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            5-year renewable residency permit
                          </div>
                          <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Family members included
                          </div>
                          <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Visa-free travel within Schengen
                          </div>
                          <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Path to citizenship after 7 years
                          </div>
                          <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            No residency requirement
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Property Specifications</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Property Type</span>
                            <span className="font-medium">Apartment</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Area</span>
                            <span className="font-medium">{formatNumber(project.size)} sqm</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Bedrooms</span>
                            <span className="font-medium">{project.bedrooms}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Bathrooms</span>
                            <span className="font-medium">{project.bathrooms}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Year Built</span>
                            <span className="font-medium">{project.completion_year}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Condition</span>
                            <span className="font-medium">New/Renovated</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Orientation</span>
                            <span className="font-medium">South-West</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Floor</span>
                            <span className="font-medium">3rd Floor</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "financials" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Investment Analysis</h3>
                      
                      {/* Cost Breakdown */}
                      <div className="mb-6">
                        <h4 className="font-medium mb-3 text-gray-900">Investment Breakdown</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Purchase Price</span>
                            <span className="font-semibold">{formatCurrency(purchasePrice)}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Transfer Fees</span>
                            <span className="font-semibold">{formatCurrency(transferFees)}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Renovation Cost</span>
                            <span className="font-semibold">{formatCurrency(renovationCost)}</span>
                          </div>
                          <div className="flex justify-between py-2 pt-3 border-t border-gray-200 font-semibold text-lg">
                            <span>Total Investment</span>
                            <span className="text-blue-600">{formatCurrency(totalInvestment)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Profit Analysis */}
                      {sellingPrice > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 text-gray-900">Projected Returns</h4>
                          <div className="bg-green-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between py-2">
                              <span className="text-gray-600">Selling Price</span>
                              <span className="font-semibold">{formatCurrency(sellingPrice)}</span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="text-gray-600">Total Investment</span>
                              <span className="font-semibold">{formatCurrency(totalInvestment)}</span>
                            </div>
                            <div className="flex justify-between py-2 pt-3 border-t border-green-200 font-semibold text-lg">
                              <span>Profit</span>
                              <span className="text-green-600">{formatCurrency(totalProfit)}</span>
                            </div>
                            <div className="flex justify-between py-2 font-semibold text-xl">
                              <span>ROI</span>
                              <span className="text-green-600">{formatPercentage(roi)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "location" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Location & Amenities</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Available Amenities</h4>
                          <div className="space-y-2">
                            {amenities.map((amenity, index) => {
                              const Icon = amenity.icon;
                              return (
                                <div key={index} className={`flex items-center space-x-3 p-2 rounded ${amenity.available ? 'text-green-700' : 'text-gray-400'}`}>
                                  <Icon className="h-4 w-4" />
                                  <span className={amenity.available ? '' : 'line-through'}>{amenity.label}</span>
                                  {amenity.available && <Check className="h-4 w-4 text-green-600 ml-auto" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Neighborhood Highlights</h4>
                          <div className="space-y-3 text-sm text-gray-600">
                            <p>• 5 minutes walk to metro station</p>
                            <p>• Shopping center within 1km</p>
                            <p>• 15 minutes to city center</p>
                            <p>• International schools nearby</p>
                            <p>• Beautiful parks and recreation areas</p>
                            <p>• Easy access to major highways</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Available Documents</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { name: "Property Brochure", type: "PDF", size: "2.4 MB" },
                        { name: "Floor Plans", type: "PDF", size: "1.8 MB" },
                        { name: "Legal Documents", type: "ZIP", size: "5.2 MB" },
                        { name: "Investment Analysis", type: "PDF", size: "1.1 MB" },
                      ].map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <Download className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="text-sm text-gray-500">{doc.type} • {doc.size}</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    RA
                  </div>
                  <div>
                    <div className="font-semibold">Rigel Agents</div>
                    <div className="text-sm text-gray-600">Premium Property Specialist</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
                
                <Button className="w-full">
                  Schedule Viewing
                </Button>
              </CardContent>
            </Card>

            {/* Investment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Price</span>
                    <span className="font-semibold">{formatCurrency(project.price)}</span>
                  </div>
                  {sellingPrice > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Value</span>
                        <span className="font-semibold">{formatCurrency(sellingPrice)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Expected ROI</span>
                        <span className="font-semibold">{formatPercentage(roi)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <ContactForm projectId={project.id} projectTitle={project.title} />
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={imageGallery[currentImageIndex]}
              alt={`${project.title} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {imageGallery.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;