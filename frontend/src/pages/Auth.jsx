import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Auth = ({ mode }) => {
  const { login, signup, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError(null);
    setFormErrors({});
  }, [mode, setError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: '',
      });
    }
  };

  const validate = () => {
    const errors = {};
    if (mode === 'signup' && !formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.userId.trim()) {
      errors.userId = 'User ID is required';
    } else if (formData.userId.length < 3) {
      errors.userId = 'User ID must be at least 3 characters';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    let success = false;

    if (mode === 'signup') {
      success = await signup(formData.name, formData.userId, formData.password);
    } else {
      success = await login(formData.userId, formData.password);
    }

    setIsSubmitting(false);

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            {mode === 'signup' ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {mode === 'signup'
              ? 'Get started with Current Affairs Knowledge Manager'
              : 'Enter your credentials to access your workspace'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                placeholder="Full Name"
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              User ID
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
              placeholder="User ID"
            />
            {formErrors.userId && (
              <p className="mt-1 text-xs text-red-400">{formErrors.userId}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
              placeholder="••••••••"
            />
            {formErrors.password && (
              <p className="mt-1 text-xs text-red-400">{formErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-zinc-100 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 transition"
          >
            {isSubmitting
              ? 'Please wait...'
              : mode === 'signup'
                ? 'Sign Up'
                : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-zinc-400">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <Link
              to={mode === 'signup' ? '/login' : '/signup'}
              className="font-medium text-zinc-100 underline underline-offset-4 hover:text-zinc-300"
            >
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
