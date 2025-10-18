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

  // Filter and sort projects based on filters and access control
  const filteredProjects = useMemo(() => {
    if (!projects) return []
    
    const filtered = projects.filter(project => {
      // Only filter by search/filter criteria, not access control
      // Access control is now handled in the rendering with blur effects
      
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
    
    // Sort projects to show accessible ones first
    const sorted = filtered.sort((a, b) => {
      let aIsAccessible = true
      let bIsAccessible = true
      
      if (!session) {
        // For visitors: prioritize public projects
        aIsAccessible = publicProjectIds.includes(a.id)
        bIsAccessible = publicProjectIds.includes(b.id)
      } else if (isPremium && !isAdmin) {
        // For premium users: prioritize projects they have access to
        aIsAccessible = userProjectIds.includes(a.id)
        bIsAccessible = userProjectIds.includes(b.id)
      } else if (!isPremium && !isAdmin && session) {
        // For regular logged-in users: prioritize public projects
        aIsAccessible = publicProjectIds.includes(a.id)
        bIsAccessible = publicProjectIds.includes(b.id)
      }
      // Admin users see all projects in original order
      
      // Sort accessible projects first, then by creation date or title
      if (aIsAccessible && !bIsAccessible) return -1
      if (!aIsAccessible && bIsAccessible) return 1
      
      // If both have same access level, sort by title
      return a.title.localeCompare(b.title)
    })
    
    return sorted
  }, [projects, filters, session, isPremium, isAdmin, publicProjectIds, userProjectIds])

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

      {/* Access Information Banner */}
      {!session && (
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full blur-[1px]"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    {publicProjectIds.length > 0 ? 'Free Preview Available' : 'Sign Up for Full Access'}
                  </h3>
                  <p className="text-green-700 text-sm">
                    {publicProjectIds.length > 0 
                      ? `🟢 ${publicProjectIds.length} public properties available • ⚫ ${(projects?.length || 0) - publicProjectIds.length} exclusive properties (blurred)`
                      : `View all ${projects?.length || 0} properties and get detailed investment analysis`
                    }
                  </p>
                </div>
              </div>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/signup')}
              >
                Sign Up Free
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!isPremium && session && (
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    Unlock Premium Properties
                  </h3>
                  <p className="text-purple-700">
                    Access exclusive premium listings and detailed investment analysis
                  </p>
                </div>
              </div>
              <Button 
                variant="default" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate('/premium')}
              >
                Upgrade to Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => {
          // Determine if this project should be blurred based on access control
          let isBlurred = false
          let isAccessible = true
          
          if (!session) {
            // Non-logged-in visitors: blur private projects, show public ones clearly
            if (accessLoading) {
              isBlurred = true // Blur while loading access info
              isAccessible = false
            } else {
              isAccessible = publicProjectIds.includes(project.id)
              isBlurred = !isAccessible // Blur if not in public access list
            }
          } else if (isPremium && !isAdmin) {
            // Premium non-admin users: blur projects they don't have access to
            if (accessLoading) {
              isBlurred = true
              isAccessible = false
            } else {
              isAccessible = userProjectIds.includes(project.id)
              isBlurred = !isAccessible
            }
          } else if (!isPremium && !isAdmin && session) {
            // Regular logged-in users: same as visitors - blur private projects
            if (accessLoading) {
              isBlurred = true
              isAccessible = false
            } else {
              isAccessible = publicProjectIds.includes(project.id)
              isBlurred = !isAccessible
            }
          }
          // Admin users: see all projects clearly (isBlurred stays false)
          
          return (
            <PropertyCard
              key={project.id}
              project={project}
              isBlurred={isBlurred}
              isAccessible={isAccessible}
              userType={!session ? 'visitor' : (isPremium ? 'premium' : 'regular')}
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
              <div className="text-gray-600">
                {!session 
                  ? `Properties (${publicProjectIds.length} public)` 
                  : 'Available Properties'
                }
              </div>
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
                {filteredProjects.length > 0 
                  ? Math.round(filteredProjects.reduce((acc, p) => acc + (p.roi || 0), 0) / filteredProjects.length)
                  : 0
                }%
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