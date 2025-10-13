import { supabase } from './supabaseClient'

// Create new inquiry
export const createInquiry = async (inquiry) => {
  const { data, error } = await supabase
    .from('inquiries')
    .insert([inquiry])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Fetch inquiries for a specific project
export const fetchProjectInquiries = async (projectId) => {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Fetch all inquiries (admin only)
export const fetchAllInquiries = async () => {
  const { data, error } = await supabase
    .from('inquiries')
    .select(`*, projects(title)`)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}