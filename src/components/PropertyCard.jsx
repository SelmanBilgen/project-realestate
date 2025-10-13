import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, formatNumber } from '../utils/formatters'
import { projectStatus } from '../types/project'

const PropertyCard = ({ project, isBlurred = false, index }) => {
  const navigate = useNavigate()
  
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case projectStatus.AVAILABLE:
        return 'bg-green-100 text-green-800'
      case projectStatus.SOLD:
        return 'bg-red-100 text-red-800'
      case projectStatus.RESERVED:
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isBlurred ? 'filter blur-sm' : ''
    }`}>
      <div className="relative">
        <img 
          src={project.image_url || `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop`} 
          alt={project.title}
          className="w-full h-48 object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 space-y-2">
          {project.golden_visa && (
            <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Golden Visa
            </span>
          )}
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(project.status)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
        
        {isBlurred && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-lg font-semibold mb-2">Premium Access Required</p>
              <p className="text-sm">Login to view all properties</p>
            </div>
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl">{project.title}</CardTitle>
        <p className="text-sm text-gray-600">{project.area}</p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Price:</span>
            <p className="font-semibold text-lg">{formatCurrency(project.price)}</p>
          </div>
          <div>
            <span className="text-gray-600">Size:</span>
            <p className="font-semibold">{formatNumber(project.size)} m²</p>
          </div>
          <div>
            <span className="text-gray-600">Bedrooms:</span>
            <p className="font-semibold">{project.bedrooms}</p>
          </div>
          <div>
            <span className="text-gray-600">Bathrooms:</span>
            <p className="font-semibold">{project.bathrooms}</p>
          </div>
        </div>
        
        {project.roi && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expected ROI:</span>
              <span className="font-semibold text-blue-600">{project.roi}%</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full"
          onClick={() => navigate(`/projects/${project.id}`)}
          disabled={isBlurred}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PropertyCard