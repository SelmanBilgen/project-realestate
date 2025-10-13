import React, { useState, useMemo } from 'react'
import { useProjects } from '../hooks/useProjects'
import PropertyCard from '../components/PropertyCard'
import Filters from '../components/Filters'
import { useIsAdmin } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Lock, Eye } from 'lucide-react'

const Projects = () => {
  const { data: projects, isLoading, error } = useProjects()
  const { isPremium } = useIsAdmin()
  const [filters, setFilters] = useState({})

  // Get unique areas for filter
  const areas = useMemo(() => {
    if (!projects) return []
    return [...new Set(projects.map(p => p.area))]
  }, [projects])

  // Filter projects based on filters
  const filteredProjects = useMemo(() => {
    if (!projects) return []
    
    return projects.filter(project => {
      if (filters.area && project.area !== filters.area) return false
      if (filters.status && project.status !== filters.status) return false
      if (filters.minPrice && project.price < filters.minPrice) return false
      if (filters.maxPrice && project.price > filters.maxPrice) return false
      if (filters.goldenVisa !== undefined && project.golden_visa !== filters.goldenVisa) return false
      return true
    })
  }, [projects, filters])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-800">Error loading projects. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Premium Real Estate Investments
        </h1>
        <p className="text-gray-600">
          Discover exceptional properties with Golden Visa eligibility and outstanding ROI potential.
        </p>
      </div>

      {/* Filters */}
      <Filters areas={areas} onFilterChange={setFilters} />

      {/* Premium Access Banner */}
      {!isPremium && (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Unlock Premium Access
                  </h3>
                  <p className="text-blue-700">
                    View all {projects?.length || 0} properties and get detailed investment analysis
                  </p>
                </div>
              </div>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                Get Premium Access
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <PropertyCard
            key={project.id}
            project={project}
            isBlurred={!isPremium && index >= 3}
            index={index}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <Lock className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new listings.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {filteredProjects.length}
              </div>
              <div className="text-gray-600">Available Properties</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {filteredProjects.filter(p => p.golden_visa).length}
              </div>
              <div className="text-gray-600">Golden Visa Eligible</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(filteredProjects.reduce((acc, p) => acc + (p.roi || 0), 0) / filteredProjects.length)}%
              </div>
              <div className="text-gray-600">Average ROI</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Projects