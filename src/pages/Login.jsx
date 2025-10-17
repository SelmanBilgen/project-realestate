import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSignIn, useSession } from "../hooks/useAuth";
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
import { Loader2, LogIn } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useSession();
  const { mutate: signIn, isPending } = useSignIn();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [session, navigate, location]);

  const handleSubmit = (e) => {
    e.preventDefault();

    signIn(formData, {
      onSuccess: () => {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      },
      onError: (error) => {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      },
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rigel Premium Homes
          </h1>
          <p className="text-gray-600">Admin Login</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Sign in to your account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="admin@rigelhomes.com"
                />
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot your password?
                  </Button>
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Demo Credentials
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Admin:</strong> admin@rigelhomes.com / admin123
                </p>
                <p>
                  <strong>Premium:</strong> premium@rigelhomes.com / premium123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p>
            Don't have an account?{" "}
            {/* <a href="#" className="font-medium text-primary hover:text-primary/80">
              Contact support
            </a> */}
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/signup")}
          >
            Create an account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
