import { supabase } from './supabaseClient'

// Fetch all projects
export const fetchProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Fetch single project by ID
export const fetchProjectById = async (id) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Create new project
export const createProject = async (project) => {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Update project
export const updateProject = async (id, updates) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Delete project
export const deleteProject = async (id) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Filter projects
export const filterProjects = async (filters) => {
  let query = supabase.from('projects').select('*')
  
  if (filters.area) {
    query = query.eq('area', filters.area)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.minPrice) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }
  if (filters.goldenVisa !== undefined) {
    query = query.eq('golden_visa', filters.goldenVisa)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}