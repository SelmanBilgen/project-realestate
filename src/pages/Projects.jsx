import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useProjectAccess } from '../hooks/useUserManagement'
import PropertyCard from '../components/PropertyCard'
import Filters from '../components/Filters'
import { useIsAdmin } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Lock, Eye } from 'lucide-react'
import { supabase } from '../api/supabaseClient'

const Projects = () => {
  const navigate = useNavigate()
  const { data: projects, isLoading, error } = useProjects()
  const { isPremium, isAdmin, isAdminLoading } = useIsAdmin()
  const { getUserProjectAccess } = useProjectAccess()
  const [filters, setFilters] = useState({})
  const [userProjectIds, setUserProjectIds] = useState([])
  const [accessLoading, setAccessLoading] = useState(false)

  // Load user's project access if they are premium (but not admin)
  useEffect(() => {
    const loadUserAccess = async () => {
      console.log('=== LOADING USER ACCESS ===')
      console.log('isPremium:', isPremium)
      console.log('isAdmin:', isAdmin)
      console.log('isAdminLoading:', isAdminLoading)
      
      if (isPremium && !isAdmin && !isAdminLoading) {
        try {
          console.log('Loading project access for premium non-admin user')
          setAccessLoading(true)
          const { data: { user } } = await supabase.auth.getUser()
          console.log('Current user:', user?.email, user?.id)
          
          if (user) {
            const userAccess = await getUserProjectAccess(user.id)
            const projectIds = userAccess.map(access => access.project_id)
            console.log('Raw user project access:', userAccess)
            console.log('Extracted project IDs:', projectIds)
            setUserProjectIds(projectIds)
          }
        } catch (err) {
          console.error('Error loading user project access:', err)
          setUserProjectIds([]) // Set empty array on error
        } finally {
          setAccessLoading(false)
        }
      } else {
        console.log('Not loading access - user is either not premium, is admin, or admin loading')
        setUserProjectIds([]) // Clear for non-premium or admin users
      }
    }

    loadUserAccess()
  }, [isPremium, isAdmin, isAdminLoading, getUserProjectAccess])

  // Debug logging
  console.log('Projects Debug:', {
    isPremium,
    isAdmin,
    isAdminLoading,
    projectsCount: projects?.length,
    userProjectIds: userProjectIds.length
  });

  // Get unique areas for filter
  const areas = useMemo(() => {
    if (!projects) return []
    return [...new Set(projects.map(p => p.area))]
  }, [projects])

  // Filter projects based on filters AND user access
  const filteredProjects = useMemo(() => {
    if (!projects) return []
    
    console.log('=== FILTERING PROJECTS ===')
    console.log('Total projects:', projects.length)
    console.log('isPremium:', isPremium, 'isAdmin:', isAdmin)
    console.log('userProjectIds:', userProjectIds)
    console.log('accessLoading:', accessLoading)
    
    const filtered = projects.filter(project => {
      // User access filter for premium non-admin users
      if (isPremium && !isAdmin) {
        console.log(`Checking access for project ${project.title} (${project.id})`)
        
        // If we're still loading access, don't show any projects to avoid showing wrong ones
        if (accessLoading) {
          console.log('Still loading access, filtering out all projects')
          return false
        }
        
        // If user has no project access, don't show any projects
        if (userProjectIds.length === 0) {
          console.log('User has no project access, filtering out project')
          return false
        }
        
        // Check if user has access to this specific project
        if (!userProjectIds.includes(project.id)) {
          console.log('User does not have access to this project')
          return false
        }
        
        console.log('User has access to this project')
      }
      
      // Area filter
      if (filters.area && filters.area !== "" && project.area !== filters.area) return false
      
      // Status filter  
      if (filters.status && filters.status !== "" && project.status !== filters.status) return false
      
      // Min price filter
      if (filters.minPrice && filters.minPrice !== "" && project.price < parseFloat(filters.minPrice)) return false
      
      // Max price filter
      if (filters.maxPrice && filters.maxPrice !== "" && project.price > parseFloat(filters.maxPrice)) return false
      
      // Golden visa filter
      if (filters.goldenVisa !== undefined && project.golden_visa !== filters.goldenVisa) return false
      
      return true
    })
    
    console.log('Filtered projects count:', filtered.length)
    console.log('Filtered projects:', filtered.map(p => ({ id: p.id, title: p.title })))
    
    return filtered
  }, [projects, filters, isPremium, isAdmin, userProjectIds, accessLoading])

  if (isLoading || isAdminLoading || accessLoading) {
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
              <Button 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/login')}
              >
                Get Premium Access
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => {
          // Determine if this project should be blurred
          let isBlurred = false
          
          if (!isPremium) {
            // Non-premium users: blur projects after index 3
            isBlurred = index >= 3
          } else if (isPremium && !isAdmin && userProjectIds.length > 0) {
            // Premium users with specific access: don't blur (they only see their projects)
            isBlurred = false
          }
          
          return (
            <PropertyCard
              key={project.id}
              project={project}
              isBlurred={isBlurred}
              index={index}
            />
          )
        })}
      </div>

      {/* No Results */}
      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <Lock className="h-12 w-12 mx-auto" />
            </div>
            {isPremium && !isAdmin && userProjectIds.length === 0 && !accessLoading ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No project access granted
                </h3>
                <p className="text-gray-600">
                  Please contact the administrator to get access to specific projects.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new listings.
                </p>
              </>
            )}
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