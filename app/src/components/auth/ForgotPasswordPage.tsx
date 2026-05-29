// Forgot Password Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEOHead } from '@/components/seo/SEOHead';
import arcoraLogo from '../../assets/branding/arcora-logo.png';

export const ForgotPasswordPage = () => {
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Reset Password | Arcora"
        description="Reset your Arcora password and regain access to your bills, subscriptions, reminders, and household records."
        path="/forgot-password"
        robots="noindex,nofollow"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#586174] transition-colors hover:text-primary dark:text-muted-foreground dark:hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </motion.div>

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
          <h1 className="text-2xl font-bold text-[#17164d] dark:gradient-text dark:text-transparent">Reset Password</h1>
          <p className="mt-2 text-sm font-medium text-[#586174] dark:text-muted-foreground">
            We&apos;ll send you a link to reset your password
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="glass-card rounded-[1.75rem] border-[#d9ddf3] bg-white/95 p-6 shadow-[0_28px_80px_rgba(59,72,130,0.18)] dark:border-border/70 dark:bg-card/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.24)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {!isSent ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="btn-hover-lift h-12 w-full rounded-2xl bg-primary font-semibold text-primary-foreground shadow-[0_16px_35px_rgba(59,130,246,0.30)] hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-500/20 dark:bg-success/10"
              >
                <CheckCircle className="w-8 h-8 text-success" />
              </motion.div>
              <h3 className="mb-2 text-lg font-semibold text-[#17164d] dark:text-foreground">Check your email</h3>
              <p className="mb-6 text-[#586174] dark:text-muted-foreground">
                We&apos;ve sent a password reset link to{' '}
                <span className="text-foreground font-medium">{email}</span>
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setIsSent(false)}
                  className="h-11 w-full rounded-2xl border-[#cfd8f3] bg-white text-[#17164d] hover:bg-[#eef1ff]/70 dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted"
                >
                  Try another email
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="h-11 w-full rounded-2xl text-[#586174] hover:bg-[#eef1ff]/70 hover:text-[#17164d] dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground">
                    Back to login
                  </Button>
                </Link>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Help Text */}
        <motion.p
          className="mt-6 text-center text-sm font-medium text-[#586174] dark:text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Didn&apos;t receive the email?{' '}
          <button
            onClick={() => setIsSent(false)}
            className="text-primary hover:underline font-medium"
          >
            Try again
          </button>
        </motion.p>
      </motion.div>
    </>
  );
};
