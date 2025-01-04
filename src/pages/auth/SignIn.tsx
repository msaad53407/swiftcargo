import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCustomToast } from '@/components/ui/custom-toast';
import { Lock, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface SignInForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function SignIn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm<SignInForm>();
  const { signIn } = useAuth();
  const toast = useCustomToast();

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true);
    setError('');
    try {
      await signIn(data.email, data.password);
      toast.success("Login successfully!");
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      toast.error('Invalid email or password')
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-1/2 flex flex-col p-8">
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold">
            Swift<span className="text-[#40B093]">cargo</span>.
          </h1>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-12 w-full max-w-2xl">
            {/* Text section */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <h1 className="text-5xl font-bold tracking-tight leading-tight">
                WELCOME TO SWIFTCARGO
              </h1>
              <p className="text-gray-500 text-lg text-center">
                Welcome to Swiftcargo dashboard system
              </p>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form section */}
            <div className="max-w-xl mx-auto">

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="Email"
                      className="pl-10 h-12 text-lg"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...register('password')}
                      type="password"
                      placeholder="Password"
                      className="pl-10 h-12 text-lg"
                      required
                    />
                  </div>
                </div>

                {/* <div className="flex items-center">
                  <Checkbox
                    {...register('rememberMe')}
                    id="remember"
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-3 block text-sm text-gray-600"
                  >
                    Remember me
                  </label>
                </div> */}

                <Button
                  type="submit"
                  className="w-full rounded-full h-12 text-lg text-black"
                  disabled={isLoading}
                  style={{
                    background:
                      "linear-gradient(129.49deg, #FFEEAD 0%, #C8B056 97.89%)",
                  }}
                >
                  {isLoading ? "Signing in..." : "Log in"}
                </Button>
              </form>
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
    </div>

  );
}