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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [activeTab, setActiveTab] = useState('properties');
  const [showProjectAccessModal, setShowProjectAccessModal] = useState(false);
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
      await togglePremium(user.id, !user.is_premium);
      toast({
        title: "Success",
        description: `${user.email} ${user.is_premium ? 'premium access revoked' : 'granted premium access'}`,
      });
      refetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update premium status",
        variant: "destructive",
      });
    }
  };

  const handleToggleAdmin = async (user) => {
    try {
      await toggleAdminRole(user.id, !user.is_admin);
      toast({
        title: "Success",
        description: `${user.email} ${user.is_admin ? 'admin role revoked' : 'granted admin role'}`,
      });
      refetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update admin role",
        variant: "destructive",
      });
    }
  };

  const handleManageProjectAccess = async (user) => {
    try {
      // Run diagnostic test
      await testProjectAccess(user.id);
      
      const userProjectAccess = await getUserProjectAccess(user.id);
      console.log('User project access loaded:', userProjectAccess);
      setSelectedUser(user);
      setSelectedProjects(userProjectAccess.map(access => access.project_id));
      setShowProjectAccessModal(true);
    } catch (error) {
      console.error('Error loading project access:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load project access",
        variant: "destructive",
      });
    }
  };

  const handleSaveProjectAccess = async () => {
    try {
      console.log('Saving project access for user:', selectedUser.id);
      console.log('Selected projects:', selectedProjects);
      
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
      console.error('Error saving project access:', error);
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
                    {users?.filter(u => u.is_premium).length || 0}
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
                  {projects?.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`project-${project.id}`}
                        checked={selectedProjects.includes(project.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjects([...selectedProjects, project.id]);
                          } else {
                            setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`project-${project.id}`} className="text-sm cursor-pointer">
                        <span className="font-medium">{project.title}</span>
                        <span className="text-gray-500 ml-2">({project.area})</span>
                      </label>
                    </div>
                  ))}
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

export default Admin;
