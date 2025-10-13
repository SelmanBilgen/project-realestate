import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects'
import AdminTable from '../components/AdminTable'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/textarea'
import { formatCurrency, calculateROI } from '../utils/formatters'
import { useToast } from '../components/ui/toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'

const Admin = () => {
  const navigate = useNavigate()
  const { data: projects, isLoading, error } = useProjects()
  const { mutate: createProject } = useCreateProject()
  const { mutate: updateProject } = useUpdateProject()
  const { mutate: deleteProject } = useDeleteProject()
  const { toast } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    area: '',
    price: '',
    size: '',
    bedrooms: '',
    bathrooms: '',
    status: 'available',
    golden_visa: false,
    completion_year: new Date().getFullYear(),
    image_url: '',
    description: '',
    purchase_price: '',
    transfer_fees: '',
    renovation_cost: '',
    selling_price: '',
  })

  const handleEdit = (project) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        title: project.title || '',
        area: project.area || '',
        price: project.price || '',
        size: project.size || '',
        bedrooms: project.bedrooms || '',
        bathrooms: project.bathrooms || '',
        status: project.status || 'available',
        golden_visa: project.golden_visa || false,
        completion_year: project.completion_year || new Date().getFullYear(),
        image_url: project.image_url || '',
        description: project.description || '',
        purchase_price: project.purchase_price || '',
        transfer_fees: project.transfer_fees || '',
        renovation_cost: project.renovation_cost || '',
        selling_price: project.selling_price || '',
      })
    } else {
      setEditingProject(null)
      setFormData({
        title: '',
        area: '',
        price: '',
        size: '',
        bedrooms: '',
        bathrooms: '',
        status: 'available',
        golden_visa: false,
        completion_year: new Date().getFullYear(),
        image_url: '',
        description: '',
        purchase_price: '',
        transfer_fees: '',
        renovation_cost: '',
        selling_price: '',
      })
    }
    setShowModal(true)
  }

  const handleDelete = (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      deleteProject(project.id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Project deleted successfully",
          })
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete project",
            variant: "destructive",
          })
        },
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Calculate ROI if all financial data is provided
    let roi = null
    if (formData.purchase_price && formData.selling_price) {
      const totalInvestment = 
        (parseFloat(formData.purchase_price) || 0) + 
        (parseFloat(formData.transfer_fees) || 0) + 
        (parseFloat(formData.renovation_cost) || 0)
      const profit = (parseFloat(formData.selling_price) || 0) - totalInvestment
      roi = ((profit / totalInvestment) * 100) || null
    }

    const projectData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      size: parseInt(formData.size) || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      completion_year: parseInt(formData.completion_year) || new Date().getFullYear(),
      purchase_price: parseFloat(formData.purchase_price) || 0,
      transfer_fees: parseFloat(formData.transfer_fees) || 0,
      renovation_cost: parseFloat(formData.renovation_cost) || 0,
      selling_price: parseFloat(formData.selling_price) || 0,
      roi,
    }

    if (editingProject) {
      updateProject(
        { id: editingProject.id, updates: projectData },
        {
          onSuccess: () => {
            setShowModal(false)
            toast({
              title: "Success",
              description: "Project updated successfully",
            })
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update project",
              variant: "destructive",
            })
          },
        }
      )
    } else {
      createProject(projectData, {
        onSuccess: () => {
          setShowModal(false)
          toast({
            title: "Success",
            description: "Project created successfully",
          })
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create project",
            variant: "destructive",
          })
        },
      })
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Calculate financial summary
  const totalValue = projects?.reduce((sum, p) => sum + p.price, 0) || 0
  const goldenVisaCount = projects?.filter(p => p.golden_visa).length || 0
  const availableCount = projects?.filter(p => p.status === 'available').length || 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage properties, track investments, and monitor inquiries.
        </p>
      </div>

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
              <div className="text-gray-600">Golden Visa</div>
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

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProject ? 'Edit Property' : 'Add New Property'}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    
                    <div>
                      <Label>Title *</Label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>

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
                    <h3 className="text-lg font-semibold">Financial Details</h3>
                    
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
                      <Label>Expected Selling Price (€)</Label>
                      <Input
                        name="selling_price"
                        type="number"
                        value={formData.selling_price}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  
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
                    <Label>Image URL</Label>
                    <Input
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
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
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProject ? 'Update Property' : 'Create Property'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin