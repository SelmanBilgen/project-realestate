import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { Edit, Trash2, Eye, Plus } from 'lucide-react'

const AdminTable = ({ 
  projects, 
  onEdit, 
  onDelete, 
  onView,
  loading = false,
  error = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.area.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || project.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'sold':
        return 'bg-red-100 text-red-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <p className="text-red-800">Error loading projects: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Property Management</CardTitle>
          <Button onClick={() => onEdit(null)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Property
          </Button>
        </div>
        
        {/* Filters */}
        <div className="mt-4 flex space-x-4">
          <Input
            placeholder="Search by title or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Property</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Area</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Golden Visa</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-gray-500">
                        {project.bedrooms} bed, {project.bathrooms} bath • {project.size}m²
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{project.area}</td>
                  <td className="py-3 px-4 font-medium">
                    {formatCurrency(project.price)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {project.golden_visa ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {formatDate(project.created_at)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(project.id)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(project)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(project)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No projects found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminTable