import React, { useState } from "react";
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
} from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id);
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="pt-6">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-800">Project not found or failed to load.</p>
            <Button onClick={() => navigate("/projects")} className="mt-4">
              Back to Projects
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
        return "bg-green-100 text-green-800";
      case projectStatus.SOLD:
        return "bg-red-100 text-red-800";
      case projectStatus.RESERVED:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "financials", label: "Financial Analysis", icon: TrendingUp },
    { id: "features", label: "Features", icon: Check },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate("/projects")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Image */}
          <Card>
            <div className="relative">
              <img
                src={
                  project.image_url ||
                  `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=400&fit=crop`
                }
                alt={project.title}
                className="w-full h-64 md:h-96 object-cover rounded-t-lg"
              />
              <div className="absolute top-4 left-4 space-y-2">
                {project.golden_visa && (
                  <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Golden Visa Eligible
                  </span>
                )}
                <span
                  className={`block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClasses(
                    project.status
                  )}`}
                >
                  {project.status.charAt(0).toUpperCase() +
                    project.status.slice(1)}
                </span>
              </div>
            </div>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{project.title}</CardTitle>
              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                {project.area}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">{project.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">{project.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Ruler className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">
                    {formatNumber(project.size)}
                  </div>
                  <div className="text-sm text-gray-600">m²</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">{project.completion_year}</div>
                  <div className="text-sm text-gray-600">Built</div>
                </div>
              </div>

              {project.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{project.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700"
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Investment Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Asking Price</span>
                        <span className="font-semibold text-lg">
                          {formatCurrency(project.price)}
                        </span>
                      </div>
                    </div>
                    {sellingPrice > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Expected ROI</span>
                          <span className="font-semibold text-lg text-green-600">
                            {formatPercentage(roi)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {project.golden_visa && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-2">
                        Golden Visa Benefits
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Minimum investment: €250,000</li>
                        <li>• 5-year renewable residency permit</li>
                        <li>
                          • Family members included (spouse, children under 21)
                        </li>
                        <li>• Visa-free travel within Schengen Area</li>
                        <li>• Path to Greek citizenship after 7 years</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "financials" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Financial Analysis</h3>

                  {/* Cost Breakdown */}
                  <div>
                    <h4 className="font-medium mb-3">Investment Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span>Purchase Price</span>
                        <span>
                          {formatCurrency(purchasePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>Transfer Fees</span>
                        <span>
                          {formatCurrency(transferFees)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>Renovation Cost</span>
                        <span>
                          {formatCurrency(renovationCost)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 font-semibold border-b-2 border-primary">
                        <span>Total Investment</span>
                        <span>{formatCurrency(totalInvestment)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profit Analysis */}
                  <div>
                    <h4 className="font-medium mb-3">Profit Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span>Expected Selling Price</span>
                        <span>
                          {formatCurrency(sellingPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>Total Investment</span>
                        <span>{formatCurrency(totalInvestment)}</span>
                      </div>
                      <div className="flex justify-between py-2 font-semibold text-green-600 border-b-2 border-green-600">
                        <span>Net Profit</span>
                        <span>{formatCurrency(totalProfit)}</span>
                      </div>
                      <div className="flex justify-between py-2 font-semibold text-green-600">
                        <span>Return on Investment (ROI)</span>
                        <span>{formatPercentage(roi)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "features" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Property Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{project.bedrooms} Bedrooms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{project.bathrooms} Bathrooms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>
                          {formatNumber(project.size)} m² Living Space
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Built in {project.completion_year}</span>
                      </div>
                      {project.golden_visa && (
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Golden Visa Eligible</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Prime Location in {project.area}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Asking Price</span>
                <span className="font-semibold">
                  {formatCurrency(project.price)}
                </span>
              </div>
              {sellingPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected ROI</span>
                  <span className="font-semibold text-green-600">
                    {formatPercentage(roi)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
                    project.status
                  )}`}
                >
                  {project.status.charAt(0).toUpperCase() +
                    project.status.slice(1)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <ContactForm projectId={project.id} projectTitle={project.title} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
