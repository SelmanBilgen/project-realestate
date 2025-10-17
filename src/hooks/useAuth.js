import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../api/supabaseClient";

export const useSession = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
};

export const useIsAdmin = () => {
  const { session, loading: sessionLoading } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async () => {
      // Don't check if session is still loading or if we've already checked for this session
      if (sessionLoading || hasChecked) return;

      if (!session?.user) {
        console.log('No session or user found');
        if (mounted) {
          setIsAdmin(false);
          setIsPremium(false);
          setIsAdminLoading(false);
          setHasChecked(true);
        }
        return;
      }

      console.log('Checking admin status for user:', session.user.id, 'email:', session.user.email);
      if (mounted) {
        setIsAdminLoading(true);
      }
      
      // Simple email-based check as fallback
      const isAdminByEmail = session.user.email === 'admin@rigelhomes.com';
      const isPremiumByEmail = session.user.email === 'premium@rigelhomes.com';
      
      console.log('Email-based check:', { 
        email: session.user.email, 
        isAdminByEmail, 
        isPremiumByEmail 
      });
      
      try {
        // Start with basic query that should always work
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin, email")
          .eq("id", session.user.id)
          .single();

        console.log('Database check result:', { data, error, userId: session.user.id });

        if (!mounted) return;

        if (error) {
          console.error('Error checking admin status:', error);
          // Fallback to email-based check if database fails
          console.log('Using email-based fallback');
          setIsAdmin(isAdminByEmail);
          setIsPremium(isAdminByEmail || isPremiumByEmail);
        } else if (data) {
          const adminStatus = data.is_admin || isAdminByEmail;
          // Admin users and premium@rigelhomes.com get premium access
          const premiumStatus = adminStatus || isPremiumByEmail;
          
          console.log('Setting admin status to:', adminStatus);
          console.log('Setting premium status to:', premiumStatus);
          setIsAdmin(adminStatus);
          setIsPremium(premiumStatus);
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        if (mounted) {
          setIsAdmin(false);
          setIsPremium(false);
        }
      } finally {
        if (mounted) {
          setIsAdminLoading(false);
          setHasChecked(true);
        }
      }
    };

    checkAdminStatus();

    return () => {
      mounted = false;
    };
  }, [session, sessionLoading, hasChecked]);

  // Reset hasChecked when session changes
  useEffect(() => {
    if (!sessionLoading) {
      setHasChecked(false);
    }
  }, [session?.user?.id, sessionLoading]);

  return { isAdmin, isPremium, isAdminLoading };
};

// Convenience hook for checking premium access
export const usePremiumAccess = () => {
  const { isPremium, isAdminLoading } = useIsAdmin();
  return { isPremium, isLoading: isAdminLoading };
};

export const useSignOut = () => {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  });
};

export const useSignIn = () => {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return data;
    },
  });
};
