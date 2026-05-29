// Register Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SEOHead } from '@/components/seo/SEOHead';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { calculatePasswordStrength } from '@/lib/crypto';
import arcoraLogo from '../../assets/branding/arcora-logo.png';
import googleLogo from '../../assets/google-logo.png';

export const RegisterPage = () => {
  const { register, loginWithGoogle } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    setIsLoading(true);
    try {
      await register(email, password, displayName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Create Account | Arcora"
        description="Create an Arcora account to organize bills, subscriptions, warranties, reminders, and household documents."
        path="/register"
        robots="noindex,nofollow"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {/* Logo */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mx-auto mb-4 grid h-24 w-24 place-items-center overflow-hidden rounded-[1.75rem] border border-sky-200/80 bg-[linear-gradient(145deg,#0f172a_0%,#1d4ed8_58%,#38bdf8_100%)] shadow-[0_22px_48px_rgba(37,99,235,0.28)] ring-1 ring-white/70 dark:h-32 dark:w-32 dark:border-transparent dark:bg-transparent dark:bg-none dark:shadow-none dark:ring-0">
            <img
              src={arcoraLogo}
              alt="Arcora logo"
              className="arcora-logo h-[6.9rem] w-[6.9rem] scale-125 object-contain drop-shadow-[0_14px_24px_rgba(8,15,33,0.28)] dark:h-32 dark:w-auto dark:scale-100 dark:drop-shadow-none"
            />
          </div>
          <h1 className="text-3xl font-semibold text-[#17164d] dark:text-white">Create Account</h1>
          <p className="mt-2 text-sm font-medium text-[#586174] dark:text-muted-foreground">
            Start organizing your life today
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="glass-card space-y-6 rounded-[1.75rem] border-[#d9ddf3] bg-white/95 p-6 shadow-[0_28px_80px_rgba(59,72,130,0.18)] dark:border-border/70 dark:bg-card/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.24)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-[#17164d] dark:text-foreground">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/80 dark:text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 rounded-2xl border-[#cfd8f3] bg-white/95 pl-10 text-[#17164d] shadow-sm placeholder:text-slate-400 focus-visible:ring-primary/20 dark:border-input dark:bg-background dark:text-foreground"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-[#17164d] dark:text-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/80 dark:text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-2xl border-[#cfd8f3] bg-white/95 pl-10 text-[#17164d] shadow-sm placeholder:text-slate-400 focus-visible:ring-primary/20 dark:border-input dark:bg-background dark:text-foreground"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-[#17164d] dark:text-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/80 dark:text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-2xl border-[#cfd8f3] bg-white/95 pl-10 pr-10 text-[#17164d] shadow-sm placeholder:text-slate-400 focus-visible:ring-primary/20 dark:border-input dark:bg-background dark:text-foreground"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#586174] transition-colors hover:text-[#17164d] dark:text-muted-foreground dark:hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength */}
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors duration-300',
                        passwordStrength.score >= level
                          ? passwordStrength.score <= 2
                            ? 'bg-destructive'
                            : passwordStrength.score === 3
                              ? 'bg-warning'
                              : 'bg-success'
                          : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                <p className={cn(
                  'text-xs',
                  passwordStrength.score <= 2 && 'text-destructive',
                  passwordStrength.score === 3 && 'text-warning',
                  passwordStrength.score >= 4 && 'text-success'
                )}>
                  {passwordStrength.feedback[0]}
                </p>
              </motion.div>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="terms" className="cursor-pointer text-sm font-medium leading-relaxed text-[#586174] dark:text-muted-foreground">
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="btn-hover-lift h-12 w-full rounded-2xl bg-primary font-semibold text-primary-foreground shadow-[0_16px_35px_rgba(59,130,246,0.30)] hover:bg-primary/90"
            disabled={isLoading || !agreeTerms}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs font-medium text-[#586174] dark:bg-card dark:text-muted-foreground">
              or continue with
            </span>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="h-12 gap-3 rounded-2xl border-[#cfd8f3] bg-white text-[#17164d] shadow-sm transition-colors hover:border-primary/35 hover:bg-[#eef1ff]/70 dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted"
            >
              {isGoogleLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <img
                    src={googleLogo}
                    alt="Google"
                    className="h-5 w-5 object-contain"
                  />
                  <span>Continue with Google</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Sign In Link */}
        <motion.p
          className="mt-6 text-center text-sm font-medium text-[#586174] dark:text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </>
  );
};
