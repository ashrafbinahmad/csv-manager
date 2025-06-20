import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { login } from 'wasp/client/auth';
import { Link, routes } from "wasp/client/router";
import { AuthPageLayout } from './AuthPageLayout';
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom';

type LoginInputs = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInputs>();
  const navigate = useNavigate()
  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    try {
      await login(data.username, data.password);
      navigate("/")
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <AuthPageLayout>
      <div className="w-full space-y-8">
        <div>
          <h2 className="mt-6 text-2xl sm:text-3xl font-semibold text-gray-900">
            Welcome
          </h2>
          <h2 className="text-lg sm:text-xl font-semibold text-[#D3D1CB]">
            Login to CSV Manager
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Username
              </label>

              <Input
                id="username"
                className="w-full"
                {...register("username", {
                  required: "Username is required",
                })}
                type="username"
                autoComplete="username"
                placeholder="Username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                className="w-full"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
                type="password"
                autoComplete="current-password"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/signup" className="font-medium text-gray-600 hover:text-gray-500">
            Sign up
          </Link>
        </div>
      </div>
    </AuthPageLayout>
  );
}




