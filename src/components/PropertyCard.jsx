import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, formatNumber, calculateROI, formatPercentage } from '../utils/formatters'
import { projectStatus } from '../types/project'

const PropertyCard = ({ project, isBlurred = false, isAccessible = true, userType = 'visitor', index }) => {
  const navigate = useNavigate()
  
  // Calculate ROI dynamically
  const calculateProjectROI = () => {
    if (!project.selling_price || (!project.purchase_price && !project.price)) {
      return null;
    }
    
    const purchasePrice = project.purchase_price || project.price;
    const additionalCosts = (project.transfer_fees || 0) + (project.renovation_cost || 0);
    return calculateROI(purchasePrice, project.selling_price, additionalCosts);
  }
  
  const roi = calculateProjectROI();
  
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
    <Card className={`overflow-hidden transition-all duration-500 ease-out transform 
      shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] 
      ${isBlurred ? 'filter blur-[2px] grayscale-[30%]' : ''}
      relative group cursor-pointer
    `} 
    style={{
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.1)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.1)';
    }}
    >
      <div className="relative overflow-hidden">
        <img 
          src={project.image_url || `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop`} 
          alt={project.title}
          className="w-full h-48 object-cover transition-transform duration-700 ease-out group-hover:scale-110"
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
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-white text-center px-4">
              {userType === 'visitor' ? (
                <>
                  <div className="mb-3">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold mb-2">Private Property</p>
                  <p className="text-sm mb-3">Sign up to view this exclusive listing</p>
                  <button 
                    className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/signup');
                    }}
                  >
                    Sign Up to View
                  </button>
                </>
              ) : userType === 'regular' ? (
                <>
                  <div className="mb-3">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold mb-2">Premium Property</p>
                  <p className="text-sm mb-3">Upgrade to premium to view exclusive listings</p>
                  <button 
                    className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/premium');
                    }}
                  >
                    Upgrade to Premium
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold mb-2">Access Required</p>
                  <p className="text-sm">Contact admin for property access</p>
                </>
              )}
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
            <p className="font-semibold">{formatNumber(project.size)} sqm</p>
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
        
        {roi !== null && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expected ROI:</span>
              <span className="font-semibold text-blue-600">{formatPercentage(roi)}</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full"
          onClick={() => {
            if (isAccessible) {
              navigate(`/projects/${project.id}`)
            }
          }}
          disabled={isBlurred}
          variant={isBlurred ? "outline" : "default"}
        >
          {isBlurred ? 
            (userType === 'visitor' ? 'Sign Up to View' : 
             userType === 'regular' ? 'Upgrade to View' : 'Access Required') 
            : 'View Details'
          }
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PropertyCard