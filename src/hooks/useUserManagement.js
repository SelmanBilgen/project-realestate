import { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

// Hook for fetching all users (admin only)
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the RPC function to get all users (bypasses RLS issues)
      const { data, error: fetchError } = await supabase
        .rpc('get_all_users_for_admin');

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
  };
};

// Hook for updating user roles and status
export const useUpdateUser = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateUser = async (userId, updates) => {
    try {
      setIsLoading(true);

      // Check admin permission
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!currentProfile?.is_admin) {
        throw new Error('Access denied: Admin privileges required');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select();

      if (error) throw error;

      return data[0];
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUser,
    isLoading,
  };
};

// Hook for managing premium access
export const useGrantPremium = () => {
  const [isLoading, setIsLoading] = useState(false);

  const togglePremium = async (userId, isPremium) => {
    try {
      setIsLoading(true);

      // Check admin permission
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!currentProfile?.is_admin) {
        throw new Error('Access denied: Admin privileges required');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ is_premium: isPremium })
        .eq('id', userId)
        .select();

      if (error) throw error;

      return data[0];
    } catch (err) {
      console.error('Error updating premium status:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    togglePremium,
    isLoading,
  };
};

// Hook for managing project access
export const useProjectAccess = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getUserProjectAccess = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_project_access')
        .select(`
          id,
          project_id,
          granted_at,
          projects (
            id,
            title,
            area
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching user project access:', err);
      throw err;
    }
  };

  const grantProjectAccess = async (userId, projectIds) => {
    try {
      setIsLoading(true);

      // Get current user for granted_by field
      const { data: { user } } = await supabase.auth.getUser();

      // First, remove all existing access for the user
      await supabase
        .from('user_project_access')
        .delete()
        .eq('user_id', userId);

      // Then add new access
      if (projectIds.length > 0) {
        const accessData = projectIds.map(projectId => ({
          user_id: userId,
          project_id: projectId,
          granted_by: user?.id
        }));

        const { data, error } = await supabase
          .from('user_project_access')
          .insert(accessData)
          .select();

        if (error) throw error;
        return data;
      }

      return [];
    } catch (err) {
      console.error('Error granting project access:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const revokeProjectAccess = async (userId, projectId = null) => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('user_project_access')
        .delete()
        .eq('user_id', userId);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { error } = await query;

      if (error) throw error;
    } catch (err) {
      console.error('Error revoking project access:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const testProjectAccess = async (userId) => {
    try {
      console.log('Testing project access for user:', userId);
      
      // Check current access
      const currentAccess = await getUserProjectAccess(userId);
      console.log('Current access:', currentAccess);
      
      // Check if user_project_access table is accessible
      const { data: allAccess, error } = await supabase
        .from('user_project_access')
        .select('*')
        .limit(5);
      
      console.log('Sample user_project_access data:', allAccess);
      if (error) console.error('Error accessing user_project_access:', error);
      
      return { currentAccess, allAccess, error };
    } catch (err) {
      console.error('Test failed:', err);
      return { error: err };
    }
  };

  return {
    getUserProjectAccess,
    grantProjectAccess,
    revokeProjectAccess,
    testProjectAccess,
    isLoading,
  };
};

// Hook for managing admin roles
export const useAdminRole = () => {
  const [isLoading, setIsLoading] = useState(false);

  const toggleAdminRole = async (userId, isAdmin) => {
    try {
      setIsLoading(true);

      // Check admin permission
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!currentProfile?.is_admin) {
        throw new Error('Access denied: Admin privileges required');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId)
        .select();

      if (error) throw error;

      return data[0];
    } catch (err) {
      console.error('Error updating admin role:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toggleAdminRole,
    isLoading,
  };
};