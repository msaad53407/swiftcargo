import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface SignInForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ResetPasswordForm {
  email: string;
}

export default function SignIn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { register, handleSubmit } = useForm<SignInForm>();
  const { register: registerReset, handleSubmit: handleSubmitReset } = useForm<ResetPasswordForm>();
  const { signIn, resetPassword } = useAuth();

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true);
    setError('');
    try {
      await signIn(data.email, data.password);
      toast.success("Login successful!");
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Invalid email or password');
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordForm) => {
    setIsResetting(true);
    try {
      await resetPassword(data.email);
      toast.success("Password reset email sent! Please check your inbox.");
      setIsResetModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to send reset email. Please check your email address.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-4 sm:p-8">
        <div className="flex justify-between items-center mb-8 lg:mb-16">
          <h1 className="text-xl sm:text-2xl font-bold">
            Ummah<span className="text-[#40B093]"> Cargo</span>
          </h1>
        </div>

        <div className="flex-1 mt-52 lg:mt-0 flex items-center justify-center">
          <div className="space-y-8 lg:space-y-12 w-full max-w-md lg:max-w-2xl">
            {/* Text section */}
            <div className="space-y-2 sm:space-y-4 max-w-2xl mx-auto text-center">
              <h1 className="text-3xl sm:text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
                WELCOME TO Ummah Cargo
              </h1>
              <p className="text-gray-500 text-base sm:text-lg">
                Welcome to Ummah Cargo dashboard system
              </p>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form section */}
            <div className="max-w-sm sm:max-w-md lg:max-w-xl mx-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="Email"
                      className="pl-10 h-12 text-base sm:text-lg w-full"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      {...register('password')}
                      type="password"
                      placeholder="Password"
                      className="pl-10 h-12 text-base sm:text-lg w-full"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      {...register('rememberMe')}
                      id="rememberMe"
                    />
                    <label htmlFor="rememberMe" className="text-sm">
                      Remember me
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full bg-[#49B698] h-12 text-base sm:text-lg text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Log in"}
                </Button>
              </form>

              <button
                onClick={() => setIsResetModalOpen(true)}
                className="mt-4 text-sm text-[#49B698] hover:text-[#40B093] transition-colors w-full text-center"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div
        className="hidden lg:block w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/login_image.png)'
        }}
      />

      {/* Reset Password Modal */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitReset(handleResetPassword)}>
            <div className="grid gap-4 py-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  {...registerReset('email')}
                  type="email"
                  placeholder="Email"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetModalOpen(false)}
                disabled={isResetting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? "Sending..." : "Send Reset Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}