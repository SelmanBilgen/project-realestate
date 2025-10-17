import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useProjectAccess, usePublicProjectAccess } from '../hooks/useUserManagement'
import PropertyCard from '../components/PropertyCard'
import Filters from '../components/Filters'
import { useIsAdmin, useSession } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Lock, Eye } from 'lucide-react'
import { supabase } from '../api/supabaseClient'

const Projects = () => {
  const navigate = useNavigate()
  const { data: projects, isLoading, error } = useProjects()
  const { session } = useSession()
  const { isPremium, isAdmin, isAdminLoading } = useIsAdmin()
  const { getUserProjectAccess } = useProjectAccess()
  const { getPublicProjects } = usePublicProjectAccess()
  const [filters, setFilters] = useState({})
  const [userProjectIds, setUserProjectIds] = useState([])
  const [publicProjectIds, setPublicProjectIds] = useState([])
  const [accessLoading, setAccessLoading] = useState(false)

    // Load user's project access if they are premium (but not admin)
  useEffect(() => {
    const loadUserAccess = async () => {
      if (isPremium && !isAdmin && !isAdminLoading) {
        try {
          setAccessLoading(true)
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            const userAccess = await getUserProjectAccess(user.id)
            const projectIds = userAccess.map(access => access.project_id)
            setUserProjectIds(projectIds)
          }
        } catch (err) {
          setUserProjectIds([]) // Set empty array on error
        } finally {
          setAccessLoading(false)
        }
      } else {
        setUserProjectIds([]) // Clear for non-premium or admin users
      }
    }

    loadUserAccess()
  }, [isPremium, isAdmin, isAdminLoading, getUserProjectAccess])

  // Load public projects for non-logged-in users
  useEffect(() => {
    const loadPublicAccess = async () => {
      if (!session) {
        try {
          setAccessLoading(true)
          const publicAccess = await getPublicProjects()
          const projectIds = publicAccess.map(access => access.project_id)
          setPublicProjectIds(projectIds)
        } catch (err) {
          setPublicProjectIds([]) // Set empty array on error
        } finally {
          setAccessLoading(false)
        }
      } else {
        setPublicProjectIds([]) // Clear for logged-in users
      }
    }

    loadPublicAccess()
  }, [session, getPublicProjects])

  // Get unique areas for filter
  const areas = useMemo(() => {
    if (!projects) return []
    return [...new Set(projects.map(p => p.area))]
  }, [projects])

  // Filter projects based on filters AND user access
  const filteredProjects = useMemo(() => {
    if (!projects) return []
    
    const filtered = projects.filter(project => {
      // Access control logic based on user type
      if (!session) {
        // Non-logged-in visitors: show only public projects
        if (accessLoading) {
          return false // Still loading, don't show any projects
        }
        
        if (publicProjectIds.length === 0) {
          return false // No public projects available
        }
        
        if (!publicProjectIds.includes(project.id)) {
          return false // Project is not marked as public
        }
      } else if (isPremium && !isAdmin) {
        // Premium non-admin users: show their specific project access
        if (accessLoading) {
          return false
        }
        
        if (userProjectIds.length === 0) {
          return false
        }
        
        if (!userProjectIds.includes(project.id)) {
          return false
        }
      } else if (!isPremium && !isAdmin && session) {
        // Regular logged-in users: show public projects (same as visitors)
        if (accessLoading) {
          return false
        }
        
        if (publicProjectIds.length === 0) {
          return false
        }
        
        if (!publicProjectIds.includes(project.id)) {
          return false
        }
      }
      // Admin users: see all projects (no filtering)
      // This logic automatically allows admins to see everything
      
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