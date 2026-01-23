import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Crown, Mail, CheckCircle, ArrowRight, Loader2, Lock, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function SignUp({ defaultMode = 'signup' }: { defaultMode?: 'signup' | 'login' }) {
	const [mode, setMode] = useState<'signup' | 'login'>(defaultMode);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [pendingLogin, setPendingLogin] = useState(false);
	const { signUp, signIn, user, subscriptionStatus } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const redirectAttempted = useRef(false);

	// Check if user just confirmed their email
	const searchParams = new URLSearchParams(location.search);
	const justConfirmed = searchParams.get('confirmed') === 'true';
		const signupSuccess = searchParams.get('signup') === 'success';
		const emailFromQuery = searchParams.get('email') || '';

		// Prefill email when we land on /login from /signup
		useEffect(() => {
			if (emailFromQuery && !email) setEmail(emailFromQuery);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [emailFromQuery]);

	// Redirect when user becomes logged in after login attempt
	useEffect(() => {
			const PAID_STATUSES = ['pro', 'active', 'trialing', 'enterprise'];
			const statusLower = (subscriptionStatus || '').toLowerCase();
			const isPaid = PAID_STATUSES.includes(statusLower);

			if (pendingLogin && user && !redirectAttempted.current) {
				redirectAttempted.current = true;
				// Paid users go straight to the app. Everyone else goes to payment.
				if (isPaid) {
					navigate('/app', { replace: true });
				} else {
					navigate('/pricing?startCheckout=true', { replace: true });
				}
			}
		}, [pendingLogin, user, subscriptionStatus, navigate]);

	// Redirect if user is already logged in with active subscription
	useEffect(() => {
			const PAID_STATUSES = ['pro', 'active', 'trialing', 'enterprise'];
			const statusLower = (subscriptionStatus || '').toLowerCase();
			if (user && statusLower && PAID_STATUSES.includes(statusLower) && !loading && !pendingLogin && !redirectAttempted.current) {
			redirectAttempted.current = true;
			navigate('/app', { replace: true });
		}
	}, [user, subscriptionStatus, loading, pendingLogin, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (mode === 'signup') {
			if (password !== confirmPassword) {
				setError('Passwords do not match');
				return;
			}
			if (password.length < 6) {
				setError('Password must be at least 6 characters');
				return;
			}
		}

		setLoading(true);
		setError('');

		if (mode === 'signup') {
			const result = await signUp(email, password);
			if (result.ok) {
				navigate(`/login?signup=success&email=${encodeURIComponent(email)}`, { replace: true });
			} else {
				setError(result.error || 'Something went wrong. Please try again.');
			}
			setLoading(false);
		} else {
			// For login, set pendingLogin and call signIn
			// The useEffect will redirect when user becomes available
			setPendingLogin(true);
			signIn(email, password).then(result => {
				if (!result.ok) {
					setPendingLogin(false);
					setLoading(false);
					setError(result.error || 'Something went wrong. Please try again.');
				}
				// If ok, the useEffect will handle redirect when user is set
			});
		}
	};

	return (
		<div className="min-h-[80vh] flex items-center justify-center px-6 py-24">
			<div className="max-w-md w-full">
					{/* Signup success banner */}
					{signupSuccess && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
						>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
									<CheckCircle className="w-6 h-6 text-green-400" />
								</div>
								<div>
									<h3 className="text-lg font-bold text-white">Congrats! Your account is created.</h3>
									<p className="text-green-300/80 text-sm">Log in below to continue to payment.</p>
								</div>
							</div>
							<div className="mt-4 flex items-center gap-2 text-green-300">
								<CreditCard className="w-5 h-5" />
								<span className="font-medium">We'll send you straight to checkout after login</span>
							</div>
						</motion.div>
					)}

				{/* Email confirmed banner */}
				{justConfirmed && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
					>
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
								<CheckCircle className="w-6 h-6 text-green-400" />
							</div>
							<div>
								<h3 className="text-lg font-bold text-white">Email Confirmed!</h3>
								<p className="text-green-300/80 text-sm">Log in below to complete payment and unlock all features</p>
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 text-green-300">
							<CreditCard className="w-5 h-5" />
							<span className="font-medium">You're one step away from your royalties</span>
						</div>
					</motion.div>
				)}

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="glass-card rounded-3xl p-10"
				>
					<div className="text-center mb-8">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-royal-600/30 to-gold-500/20 flex items-center justify-center mx-auto mb-4">
							<Crown className="w-8 h-8 text-gold-400" />
						</div>
						<h1 className="text-3xl font-bold text-white mb-2">
									{(justConfirmed || signupSuccess) ? 'Log in to continue' : (mode === 'signup' ? 'Create your account' : 'Welcome back')}
						</h1>
						<p className="text-white/60">
									{(justConfirmed || signupSuccess)
										? 'Enter your password to continue to payment.'
								: (mode === 'signup'
									? 'Start claiming your royalties for just $35/month.'
									: 'Log in to access your dashboard and royalty tools.')}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
								Email address
							</label>
							<div className="relative">
								<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
								<input
									type="email"
									id="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									required
									className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500 focus:ring-1 focus:ring-royal-500 transition-colors"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-white/70 mb-2">Password</label>
							<div className="relative">
								<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="At least 6 characters"
									required
									className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500"
								/>
							</div>
						</div>

						{mode === 'signup' && (
							<div>
								<label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
								<div className="relative">
									<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
									<input
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500"
									/>
								</div>
							</div>
						)}

						{error && (
							<p className="text-sm text-red-500">{error}</p>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
						>
							{loading ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<>
									{mode === 'signup' ? 'Create account' : 'Log in'}
									<ArrowRight className="w-5 h-5" />
								</>
							)}
						</button>
					</form>

					<div className="mt-6 flex items-center justify-between text-sm text-white/60">
						<span>
							{mode === 'signup' ? 'Already have an account?' : "Don't have an account yet?"}
						</span>
						<button
							type="button"
							onClick={() => {
								setMode(mode === 'signup' ? 'login' : 'signup');
								setError('');
						}}
							className="text-royal-400 hover:underline"
						>
							{mode === 'signup' ? 'Log in' : 'Create account'}
						</button>
					</div>

					<div className="mt-8 pt-6 border-t border-white/10">
						<div className="space-y-3 text-sm">
							{['Full dashboard access', 'All royalty tools', 'Cancel anytime'].map((item, i) => (
								<div key={i} className="flex items-center gap-2 text-white/60">
									<CheckCircle className="w-4 h-4 text-red-500" />
									{item}
								</div>
							))}
						</div>
					</div>

					<p className="mt-6 text-center text-sm text-white/40">
						By using Royally Tuned, you agree to our{' '}
						<Link to="/terms" className="text-royal-400 hover:underline">Terms</Link>
						{' '}and{' '}
						<Link to="/privacy" className="text-royal-400 hover:underline">Privacy Policy</Link>
					</p>
				</motion.div>
			</div>
		</div>
	);
}

