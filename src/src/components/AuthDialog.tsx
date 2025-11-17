import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, ArrowLeft, Check, Mail } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getSupabaseClient } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (user: any) => void;
}

type AuthView = 'initial' | 'login' | 'signup' | 'forgot-password' | 'reset-success';

export function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<AuthView>('initial');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');

  const supabase = getSupabaseClient();

  const resetForm = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setResetEmail('');
    setError('');
    setView('initial');
  };

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/auth/user`, {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          onAuthSuccess({ ...userData.user, accessToken: data.session.access_token });
          handleDialogChange(false);
        } else {
          setError('Failed to fetch user data');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          name: signupName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        setIsLoading(false);
        return;
      }

      // Auto-login after signup
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: signupEmail,
        password: signupPassword,
      });

      if (loginError) {
        setError('Account created, but login failed. Please try logging in manually.');
        setIsLoading(false);
        return;
      }

      if (loginData.session) {
        const userResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/auth/user`, {
          headers: {
            'Authorization': `Bearer ${loginData.session.access_token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          onAuthSuccess({ ...userData.user, accessToken: loginData.session.access_token });
          handleDialogChange(false);
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setView('reset-success');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 border-0 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Accessible title and description for screen readers */}
        <DialogTitle className="sr-only">
          {view === 'initial' && 'Welcome to GameHub'}
          {view === 'login' && 'Log in to GameHub'}
          {view === 'signup' && 'Sign up for GameHub'}
          {view === 'forgot-password' && 'Reset your password'}
          {view === 'reset-success' && 'Password reset email sent'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {view === 'initial' && 'Join the gaming community. Choose a login method to continue.'}
          {view === 'login' && 'Enter your email and password to log in to your account.'}
          {view === 'signup' && 'Create your account by entering your name, email and password.'}
          {view === 'forgot-password' && 'Enter your email address to receive a password reset link.'}
          {view === 'reset-success' && 'Check your email for a link to reset your password.'}
        </DialogDescription>

        {/* Header */}
        <div className="relative p-8 pb-6">
          {view !== 'initial' && view !== 'reset-success' && (
            <button
              onClick={() => setView(view === 'forgot-password' ? 'login' : 'initial')}
              className="absolute left-6 top-8 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              disabled={isLoading}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          )}
          
          <div className="flex justify-center mb-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              view === 'reset-success' 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gradient-to-br from-purple-600 to-pink-600'
            }`}>
              {view === 'reset-success' ? (
                <Check className="w-7 h-7 text-green-600 dark:text-green-400" />
              ) : view === 'forgot-password' ? (
                <Mail className="w-7 h-7 text-white" />
              ) : (
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              )}
            </div>
          </div>
          
          <h2 className="text-center text-slate-900 dark:text-white mb-1">
            {view === 'initial' && 'Welcome to GameHub'}
            {view === 'login' && 'Log in to GameHub'}
            {view === 'signup' && 'Sign up for GameHub'}
            {view === 'forgot-password' && 'Reset your password'}
            {view === 'reset-success' && 'Check your email'}
          </h2>
          
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {view === 'initial' && 'Join the gaming community'}
            {view === 'login' && 'Enter your details to continue'}
            {view === 'signup' && 'Create your account to get started'}
            {view === 'forgot-password' && "We'll send you a link to reset your password"}
            {view === 'reset-success' && `We've sent a password reset link to ${resetEmail}`}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {view === 'initial' && (
            <div className="space-y-3">
              <Button
                onClick={() => setView('signup')}
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
              >
                Create account
              </Button>

              <div className="pt-4 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => setView('login')}
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Log in
                  </button>
                </p>
              </div>

              <div className="pt-6 text-xs text-center text-slate-500 dark:text-slate-500">
                By continuing, you agree to GameHub's{' '}
                <a href="#" className="underline hover:text-slate-700 dark:hover:text-slate-300">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="underline hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</a>
              </div>
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label htmlFor="login-email" className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Log in'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(loginEmail);
                    setView('forgot-password');
                  }}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          {view === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label htmlFor="signup-name" className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                    Full name
                  </label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a password (min. 6 characters)"
                    className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>

              <div className="pt-2 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Log in
                  </button>
                </p>
              </div>
            </form>
          )}

          {view === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm mb-1.5 text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
                  required
                  autoFocus
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Enter the email address associated with your account
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  disabled={isLoading}
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          {view === 'reset-success' && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  If an account exists for <span className="font-medium text-slate-900 dark:text-white">{resetEmail}</span>, you'll receive a password reset link shortly.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  The link will expire in 1 hour.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setView('forgot-password')}
                  variant="outline"
                  className="w-full h-11"
                >
                  Resend email
                </Button>

                <Button
                  onClick={() => setView('login')}
                  className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                  Back to login
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}