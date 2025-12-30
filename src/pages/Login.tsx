import SignUp from './SignUp';

// Reuse the existing SignUp component, but default it to login mode.
// We keep this wrapper so we can route /login separately and create a clean post-confirm flow.
export default function Login() {
	return <SignUp defaultMode="login" />;
}
