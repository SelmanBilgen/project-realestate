import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "../hooks/useProjects";
import {
  useUsers,
  useGrantPremium,
  useAdminRole,
  useProjectAccess,
  usePublicProjectAccess,
} from "../hooks/useUserManagement";
import AdminTable from "../components/AdminTable";
import UserTable from "../components/UserTable";
import ImageUpload from "../components/ImageUpload";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { formatCurrency, calculateROI } from "../utils/formatters";
import { useToast } from "../components/ui/toast";
import { X } from "lucide-react";

// import { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   useProjects,
//   useCreateProject,
//   useUpdateProject,
//   useDeleteProject,
// } from "../hooks/useProjects";
// import { useToast } from "../components/ui/use-toast";
// import { Button } from "../components/ui/button";
// import { Input } from "../components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../components/ui/select";
//import { Checkbox } from "../components/ui/checkbox";
//import { X } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading, error } = useProjects();
  const { mutate: createProject } = useCreateProject();
  const { mutate: updateProject } = useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject();
  
  // User management hooks
  const { users, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers();
  const { togglePremium } = useGrantPremium();
  const { toggleAdminRole } = useAdminRole();
  const { getUserProjectAccess, grantProjectAccess, testProjectAccess } = useProjectAccess();
  const { getAllProjectsWithPublicStatus, toggleProjectPublicAccess } = usePublicProjectAccess();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [activeTab, setActiveTab] = useState('properties');
  const [showProjectAccessModal, setShowProjectAccessModal] = useState(false);
  const [projectsWithPublicStatus, setProjectsWithPublicStatus] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    type: "",
    bedrooms: "",
    bathrooms: "",
    size_sqft: "",
    images_data: "[]",
    rental_price: "",
    purchase_price: "",
    renovation_costs: "",
    other_costs: "",
    holding_period: "",
    rental_income_monthly: "",
    occupancy_rate: "",
    property_taxes_annual: "",
    insurance_annual: "",
    maintenance_annual: "",
    property_management_fee: "",
    other_expenses_annual: "",
    exit_strategy: "",
    projected_sale_price: "",
    selling_costs: "",
  });
  const [errors, setErrors] = useState({});

  const handleEdit = (project) => {
    setEditingProject(project);
    if (project) {
      // Editing existing project - handle both new images_data and legacy image_url
      let images = [];
      try {
        if (project.images_data) {
          images = JSON.parse(project.images_data);
        } else if (project.image_url) {
          images = [{ url: project.image_url, tag: '', isMain: true }];
        }
      } catch (error) {
        console.error('Error parsing images_data:', error);
        if (project.image_url) {
          images = [{ url: project.image_url, tag: '', isMain: true }];
        }
      }
      
      setCurrentImages(images);
      setFormData({
        ...project,
        price: project.price?.toString() || "",
        size: project.size?.toString() || "",
        bedrooms: project.bedrooms?.toString() || "",
        bathrooms: project.bathrooms?.toString() || "",
        purchase_price: project.purchase_price?.toString() || "",
        transfer_fees: project.transfer_fees?.toString() || "",
        renovation_cost: project.renovation_cost?.toString() || "",
        selling_price: project.selling_price?.toString() || "",
        completion_year: project.completion_year?.toString() || new Date().getFullYear().toString(),
        images_data: JSON.stringify(images),
      });
    } else {
      // Adding new project - reset to initial form state
      setCurrentImages([]);
      setFormData({
        title: "",
        area: "",
        price: "",
        size: "",
        bedrooms: "",
        bathrooms: "",
        status: "available",
        golden_visa: false,
        completion_year: new Date().getFullYear(),
        images_data: "[]",
        description: "",
        purchase_price: "",
        transfer_fees: "",
        renovation_cost: "",
        selling_price: "",
      });
    }
    setErrors({}); // Clear any previous errors
    setShowModal(true);
  };

  const handleDelete = (project) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        deleteProject(project.id);
        toast({
          title: "Success",
          description: "Project deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive",
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.size) newErrors.size = "Size is required";
    if (!formData.area.trim()) newErrors.area = "Area is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      size: parseFloat(formData.size),
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      completion_year: parseInt(formData.completion_year) || new Date().getFullYear(),
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      transfer_fees: formData.transfer_fees ? parseFloat(formData.transfer_fees) : null,
      renovation_cost: formData.renovation_cost ? parseFloat(formData.renovation_cost) : null,
      selling_price: formData.selling_price ? parseFloat(formData.selling_price) : null,
      // For backward compatibility, set image_url to the main image or first image
      image_url: currentImages.find(img => img.isMain)?.url || currentImages[0]?.url || "",
      // Store the full images array as JSON
      images_data: JSON.stringify(currentImages),
    };

      if (editingProject) {
        updateProject({ id: editingProject.id, ...payload }, {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Project updated successfully",
            });
            setShowModal(false);
            setCurrentImages([]);
            setFormData({
              title: "",
              area: "",
              price: "",
              size: "",
              bedrooms: "",
              bathrooms: "",
              status: "available",
              golden_visa: false,
              completion_year: new Date().getFullYear(),
              images_data: "[]",
              description: "",
              purchase_price: "",
              transfer_fees: "",
              renovation_cost: "",
              selling_price: "",
            });
            setEditingProject(null);
            setIsSubmitting(false);
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to update project",
              variant: "destructive",
            });
            setIsSubmitting(false);
          }
        });
      } else {
        createProject(payload, {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Project created successfully",
            });
            setShowModal(false);
            setCurrentImages([]);
            setFormData({
              title: "",
              area: "",
              price: "",
              size: "",
              bedrooms: "",
              bathrooms: "",
              status: "available",
              golden_visa: false,
              completion_year: new Date().getFullYear(),
              images_data: "[]",
              description: "",
              purchase_price: "",
              transfer_fees: "",
              renovation_cost: "",
              selling_price: "",
            });
            setEditingProject(null);
            setIsSubmitting(false);
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to create project",
              variant: "destructive",
            });
            setIsSubmitting(false);
          }
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // User management handlers
  const handleTogglePremium = async (user) => {
    try {
      const willBePremium = !user.is_premium;
      console.log(`Toggling premium for ${user.email}: ${user.is_premium} -> ${willBePremium}`);
      
      // Toggle premium status
      const result = await togglePremium(user.id, willBePremium);
      console.log('Toggle premium result:', result);
      
      // If granting premium access, give access to all projects by default
      if (willBePremium && projects && projects.length > 0) {
        const allProjectIds = projects.map(p => p.id);
        console.log('Granting access to all projects:', allProjectIds);
        await grantProjectAccess(user.id, allProjectIds);
      }
      
      toast({
        title: "Success",
        description: willBePremium 
          ? `${user.email} granted premium access with full project access`
          : `${user.email} premium access revoked - now has visitor-level access to public projects only`,
      });
      
      // Refresh users list to update UI
      console.log('Refreshing users...');
      await refetchUsers();
      console.log('Users refreshed');
    } catch (error) {
      console.error('Premium toggle error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update premium status",
        variant: "destructive",
      });
    }
  };

  const handleToggleAdmin = async (user) => {
    try {
      const willBeAdmin = !user.is_admin;
      console.log(`Toggling admin for ${user.email}: ${user.is_admin} -> ${willBeAdmin}`);
      
      // Toggle admin role
      const result = await toggleAdminRole(user.id, willBeAdmin);
      console.log('Toggle admin result:', result);
      
      // If granting admin role, also grant premium access
      if (willBeAdmin && !user.is_premium) {
        console.log('Also granting premium access for new admin');
        await togglePremium(user.id, true);
      }
      
      toast({
        title: "Success",
        description: willBeAdmin 
          ? `${user.email} granted admin role with premium access`
          : `${user.email} admin role revoked - access level adjusted accordingly`,
      });
      
      // Refresh users list to update UI
      console.log('Refreshing users...');
      await refetchUsers();
      console.log('Users refreshed');
    } catch (error) {
      console.error('Admin toggle error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update admin role",
        variant: "destructive",
      });
    }
  };

  const handleManageProjectAccess = async (user) => {
    // Don't allow project access management for admin users
    if (user.is_admin) {
      toast({
        title: "Info",
        description: "Admin users have access to all projects by default",
        variant: "default",
      });
      return;
    }
    
    try {
      // Run diagnostic test
      await testProjectAccess(user.id);
      
      const userProjectAccess = await getUserProjectAccess(user.id);
      const projectIds = userProjectAccess.map(access => access.project_id);
      
      setSelectedUser(user);
      setSelectedProjects(projectIds);
      setShowProjectAccessModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load project access",
        variant: "destructive",
      });
    }
  };

  const handleSaveProjectAccess = async () => {
    try {
      await grantProjectAccess(selectedUser.id, selectedProjects);
      
      // Verify the save by fetching the data again
      const updatedAccess = await getUserProjectAccess(selectedUser.id);
      console.log('Updated project access after save:', updatedAccess);
      
      toast({
        title: "Success",
        description: `Project access updated for ${selectedUser.email}`,
      });
      setShowProjectAccessModal(false);
      setSelectedUser(null);
      setSelectedProjects([]);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update project access",
        variant: "destructive",
      });
    }
  };

  const financialSummary = useMemo(
    () => ({
      totalValue: projects?.reduce((sum, p) => sum + p.price, 0) || 0,
      goldenVisaCount: projects?.filter((p) => p.golden_visa).length || 0,
      availableCount:
        projects?.filter((p) => p.status === "available").length || 0,
      averagePrice: projects?.length
        ? projects.reduce((sum, p) => sum + p.price, 0) / projects.length
        : 0,
    }),
    [projects]
  );

  // Replace individual calculations with memoized values
  const { totalValue, goldenVisaCount, availableCount, averagePrice } =
    financialSummary;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your property listings, users, and view analytics.
        </p>
        
        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'properties'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('public-access')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'public-access'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visitor Access
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'properties' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {projects?.length || 0}
                  </div>
                  <div className="text-gray-600">Total Properties</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {availableCount}
                  </div>
                  <div className="text-gray-600">Available</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {goldenVisaCount}
                  </div>
                  <div className="text-gray-600">Golden Visa Eligible</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {formatCurrency(totalValue)}
                  </div>
                  <div className="text-gray-600">Total Value</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Table */}
          <AdminTable
            projects={projects}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={(id) => navigate(`/projects/${id}`)}
            loading={isLoading}
            error={error}
          />
        </>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {users?.length || 0}
                  </div>
                  <div className="text-gray-600">Total Users</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {users?.filter(u => u.is_premium && !u.is_admin).length || 0}
                  </div>
                  <div className="text-gray-600">Premium Users</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {users?.filter(u => u.is_admin).length || 0}
                  </div>
                  <div className="text-gray-600">Admin Users</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management Table */}
          <UserTable
            users={users}
            onTogglePremium={handleTogglePremium}
            onToggleAdmin={handleToggleAdmin}
            onManageProjectAccess={handleManageProjectAccess}
            loading={usersLoading}
            error={usersError}
          />
        </div>
      )}

      {/* Public Access Management Tab */}
      {activeTab === 'public-access' && (
        <PublicAccessManagement 
          projects={projects}
          getAllProjectsWithPublicStatus={getAllProjectsWithPublicStatus}
          toggleProjectPublicAccess={toggleProjectPublicAccess}
          projectsWithPublicStatus={projectsWithPublicStatus}
          setProjectsWithPublicStatus={setProjectsWithPublicStatus}
          toast={toast}
        />
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal if clicking outside the modal content
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              onClick={() => setShowModal(false)}
              aria-label="Close modal"
              className="absolute right-2 top-2 z-10 w-8 h-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6 pr-8">
                <h2 className="text-2xl font-bold">
                  {editingProject ? "Edit Property" : "Add New Property"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>

                    <div>
                      <Label>Property Title *</Label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Area *</Label>
                        <Input
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <Label>Price (€) *</Label>
                        <Input
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <Label>Size (m²) *</Label>
                        <Input
                          name="size"
                          type="number"
                          value={formData.size}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Bedrooms *</Label>
                          <Input
                            name="bedrooms"
                            type="number"
                            value={formData.bedrooms}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                          <Label>Bathrooms *</Label>
                          <Input
                            name="bathrooms"
                            type="number"
                            value={formData.bathrooms}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Financial Details
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Fill in purchase and selling prices to calculate ROI automatically.
                        </p>
                      </div>

                      <div>
                        <Label>Purchase Price (€)</Label>
                        <Input
                          name="purchase_price"
                          type="number"
                          value={formData.purchase_price}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <Label>Transfer Fees (€)</Label>
                        <Input
                          name="transfer_fees"
                          type="number"
                          value={formData.transfer_fees}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <Label>Renovation Cost (€)</Label>
                        <Input
                          name="renovation_cost"
                          type="number"
                          value={formData.renovation_cost}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <Label>Expected Selling Price (€) *</Label>
                        <Input
                          name="selling_price"
                          type="number"
                          value={formData.selling_price}
                          onChange={handleChange}
                          placeholder="Required for ROI calculation"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Required for ROI calculation and display
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Additional Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Status</Label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="available">Available</option>
                          <option value="sold">Sold</option>
                          <option value="reserved">Reserved</option>
                        </select>
                      </div>

                      <div>
                        <Label>Completion Year</Label>
                        <Input
                          name="completion_year"
                          type="number"
                          value={formData.completion_year}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="golden_visa"
                            checked={formData.golden_visa}
                            onChange={handleChange}
                          />
                          <span>Golden Visa Eligible</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label>Property Images</Label>
                      <ImageUpload
                        images={currentImages}
                        onChange={(images) => {
                          setCurrentImages(images);
                          setFormData(prev => ({ ...prev, images_data: JSON.stringify(images) }));
                        }}
                        maxImages={10}
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowModal(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting 
                        ? "Saving..." 
                        : editingProject ? "Update Property" : "Create Property"
                      }
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Project Access Modal */}
      {showProjectAccessModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProjectAccessModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto relative">
            <Button
              variant="ghost"
              onClick={() => setShowProjectAccessModal(false)}
              aria-label="Close modal"
              className="absolute right-2 top-2 z-10 w-8 h-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6 pr-8">
                <h2 className="text-2xl font-bold">
                  Manage Project Access for {selectedUser.email}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="mb-4">
                  <Label className="text-sm font-medium">Select Projects to Grant Access</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose specific projects this premium user can access, or leave empty for no access.
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    Currently selected: {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {projects?.map((project) => {
                    const isChecked = selectedProjects.includes(project.id);
                    return (
                      <div key={project.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`project-${project.id}`}
                          checked={isChecked}
                          onChange={(e) => {
                            console.log(`Toggling project ${project.title} (${project.id}):`, e.target.checked);
                            if (e.target.checked) {
                              const newSelected = [...selectedProjects, project.id];
                              console.log('New selected projects:', newSelected);
                              setSelectedProjects(newSelected);
                            } else {
                              const newSelected = selectedProjects.filter(id => id !== project.id);
                              console.log('New selected projects:', newSelected);
                              setSelectedProjects(newSelected);
                            }
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor={`project-${project.id}`} className="text-sm cursor-pointer">
                          <span className="font-medium">{project.title}</span>
                          <span className="text-gray-500 ml-2">({project.area})</span>
                          <span className={`ml-2 text-xs px-2 py-1 rounded ${isChecked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {isChecked ? '✓ Selected' : 'Not Selected'}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowProjectAccessModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProjectAccess}>
                    Save Access
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Public Access Management Component
const PublicAccessManagement = ({ 
  projects, 
  getAllProjectsWithPublicStatus, 
  toggleProjectPublicAccess, 
  projectsWithPublicStatus, 
  setProjectsWithPublicStatus, 
  toast 
}) => {
  const [setupError, setSetupError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPublicStatus = async () => {
      try {
        setIsLoading(true);
        setSetupError(false);
        const projectsWithStatus = await getAllProjectsWithPublicStatus();
        setProjectsWithPublicStatus(projectsWithStatus);
      } catch (error) {
        console.error('Error loading public project status:', error);
        
        // Check if it's a table doesn't exist error
        if (error.message?.includes('relation "public_project_access" does not exist') || 
            error.message?.includes('table "public_project_access" does not exist')) {
          setSetupError(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to load project public status",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (projects && projects.length > 0) {
      loadPublicStatus();
    }
  }, [projects, getAllProjectsWithPublicStatus, setProjectsWithPublicStatus, toast]);

  const handleTogglePublicAccess = async (projectId, currentStatus) => {
    try {
      await toggleProjectPublicAccess(projectId, !currentStatus);
      
      // Update local state
      setProjectsWithPublicStatus(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, is_public: !currentStatus }
            : project
        )
      );

      toast({
        title: "Success",
        description: `Project ${!currentStatus ? 'made public' : 'made private'} for visitors`,
        variant: "success",
      });
    } catch (error) {
      console.error('Error toggling public access:', error);
      toast({
        title: "Error",
        description: "Failed to update project visibility",
        variant: "destructive",
      });
    }
  };

  const publicProjectsCount = projectsWithPublicStatus.filter(p => p.is_public).length;

  // Show setup error if database table doesn't exist
  if (setupError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">Database Setup Required</h3>
              <p className="text-red-700 text-sm mt-1">
                The visitor access feature requires a database table that hasn't been created yet.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-red-200 mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Quick Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Open your <strong>Supabase Dashboard</strong></li>
              <li>Go to <strong>SQL Editor</strong></li>
              <li>Click <strong>New Query</strong></li>
              <li>Copy the SQL from <code>VISITOR_ACCESS_SETUP.md</code> file</li>
              <li>Run the query, then refresh this page</li>
            </ol>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="bg-white"
            >
              🔄 Refresh Page After Setup
            </Button>
            <p className="text-xs text-red-600">
              Check the <code>VISITOR_ACCESS_SETUP.md</code> file in your project root for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Visitor Project Access</h3>
        <p className="text-blue-700 text-sm">
          Select which projects should be visible to visitors who are not logged in. 
          Currently <strong>{publicProjectsCount}</strong> project(s) are visible to visitors.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Visitor Project Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Loading projects...
            </div>
          ) : projectsWithPublicStatus.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No projects found.
            </div>
          ) : (
            <div className="space-y-4">
              {projectsWithPublicStatus.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.title}</h4>
                    <p className="text-sm text-gray-600">
                      {project.area} • {formatCurrency(project.price)}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        City: {project.city || 'N/A'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Type: {project.property_type || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.is_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {project.is_public ? 'Public' : 'Private'}
                    </div>
                    
                    <Button
                      size="sm"
                      variant={project.is_public ? "destructive" : "default"}
                      onClick={() => handleTogglePublicAccess(project.id, project.is_public)}
                    >
                      {project.is_public ? 'Make Private' : 'Make Public'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
