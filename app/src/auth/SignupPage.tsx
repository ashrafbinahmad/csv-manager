import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { signup } from 'wasp/client/auth';
import { Link } from "wasp/client/router";
import { AuthPageLayout } from './AuthPageLayout';
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom';

type SignupInputs = {
  username: string;
  password: string;
  repeatPassword: string;
};

export function Signup() {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<SignupInputs>();

  const password = watch('password');
  const navigate = useNavigate()
  const onSubmit: SubmitHandler<SignupInputs> = async (data) => {
    try {
      const { repeatPassword, ...signupData } = data;
      await signup(signupData);
      navigate("/login")
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <AuthPageLayout>
      <div className="w-full space-y-8">
        <div>
          <h2 className="mt-6 text-2xl sm:text-3xl font-semibold text-gray-900">
            Get Started
          </h2>
          <h2 className="text-lg sm:text-xl font-semibold text-[#D3D1CB]">
            Create your CSV Manager account
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
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <Input
                id="username"
                className="w-full"
                {...register("username", {
                  required: "Username is required",
                })}
                type="text"
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
                autoComplete="new-password"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="repeatPassword" className="sr-only">
                Repeat Password
              </label>
              <Input
                id="repeatPassword"
                className="w-full"
                {...register("repeatPassword", {
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
                type="password"
                autoComplete="new-password"
                placeholder="Repeat Password"
              />
              {errors.repeatPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.repeatPassword.message}
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
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="font-medium text-gray-600 hover:text-gray-500">
            Sign in
          </Link>
        </div>
      </div>
    </AuthPageLayout>
  );
}
