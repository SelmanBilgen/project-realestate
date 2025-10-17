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
        if (mounted) {
          setIsAdmin(false);
          setIsPremium(false);
          setIsAdminLoading(false);
          setHasChecked(true);
        }
        return;
      }

      if (mounted) {
        setIsAdminLoading(true);
      }
      
      // Simple email-based check as fallback
      const isAdminByEmail = session.user.email === 'admin@rigelhomes.com';
      const isPremiumByEmail = session.user.email === 'premium@rigelhomes.com';
      
      try {
        // Query the profile
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin, is_premium, email")
          .eq("id", session.user.id)
          .single();

        if (!mounted) return;

        if (error) {
          // Fallback to email-based check if database fails
          setIsAdmin(isAdminByEmail);
          setIsPremium(isAdminByEmail || isPremiumByEmail);
        } else if (data) {
          const adminStatus = data.is_admin || isAdminByEmail;
          // Check is_premium from database OR admin status OR hardcoded premium email
          const premiumStatus = data.is_premium || adminStatus || isPremiumByEmail;
          
          setIsAdmin(adminStatus);
          setIsPremium(premiumStatus);
        } else {
          setIsAdmin(isAdminByEmail);
          setIsPremium(isAdminByEmail || isPremiumByEmail);
        }
      } catch (error) {
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
