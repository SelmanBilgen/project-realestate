import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../components/ui/toast";
import { Loader2, Lock } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle auth flow when component mounts
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get auth tokens from URL (Supabase uses hash fragments)
        const hashFragment = window.location.hash;
        console.log('Full URL:', window.location.href);
        console.log('Hash fragment:', hashFragment);

        if (hashFragment.includes('access_token')) {
          // Extract tokens from hash
          const params = new URLSearchParams(hashFragment.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          console.log('Found tokens:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken, 
            type 
          });

          if (accessToken && type === 'recovery') {
            // Set the session
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              console.error('Error setting session:', error);
              throw error;
            }

            if (data.session && mounted) {
              console.log('Session established successfully');
              setHasValidSession(true);
              setSessionLoading(false);
              // Clean URL
              window.history.replaceState({}, document.title, '/reset-password');
              return;
            }
          }
        }

        // If no tokens in URL, check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          throw error;
        }

        if (session && mounted) {
          console.log('Found existing session');
          setHasValidSession(true);
          setSessionLoading(false);
        } else {
          console.log('No session found');
          // No valid session found
          setTimeout(() => {
            if (mounted) {
              toast({
                title: "Invalid reset link",
                description: "This reset link is invalid or has expired. Please request a new password reset.",
                variant: "destructive",
              });
              navigate("/forgot-password");
            }
          }, 2000);
        }

      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          toast({
            title: "Authentication error",
            description: "There was an error processing your reset link. Please try again.",
            variant: "destructive",
          });
          navigate("/forgot-password");
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both fields match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Verify we still have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Session expired",
          description: "Your reset link has expired. Please request a new one.",
          variant: "destructive",
        });
        navigate("/forgot-password");
        return;
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        console.error('Password update error:', error);
        toast({
          title: "Error resetting password",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated successfully",
          description: "You can now sign in with your new password.",
        });
        
        // Sign out to ensure clean state
        await supabase.auth.signOut();
        navigate("/login");
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Unexpected error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold mb-2">Setting up password reset</h2>
          <p className="text-gray-600">Please wait while we verify your reset link...</p>
        </div>
      </div>
    );
  }

  // Only render the form if we have a valid session
  if (!hasValidSession) {
    return null; // Component will redirect to forgot-password
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rigel Premium Homes
          </h1>
          <p className="text-gray-600">Set a new password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Update password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
