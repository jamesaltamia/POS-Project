import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../../store/slices/authSlice';
import { getCsrfCookie, login } from '../../api/auth';
import { useState } from 'react';

interface LoginFormData {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
}).required();

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    try {
      await getCsrfCookie();
      const response = await login(data.email, data.password);
      if (!response || !response.user) {
        setLoginError(
          response?.message ||
          'Login failed. Please check your credentials and try again.'
        );
        return;
      }
      const backendUser = response.user;
      const user = {
        id: backendUser.id,
        username: backendUser.name,
        email: backendUser.email,
        role: typeof backendUser.role === 'string'
          ? backendUser.role
          : backendUser.role?.name || 'cashier',
      };
      dispatch(setCredentials({ user, token: response.token }));
      if (user.role === 'admin' || user.role === 'administrator') {
        navigate('/dashboard');
      } else if (user.role === 'manager') {
        navigate('/manager');
      } else if (user.role === 'cashier') {
        navigate('/cashier');
      } else {
        navigate('/login');
      }
    } catch (error: any) {
      setLoginError(
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please check your credentials and try again.'
      );
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: '#f7ecd7',
        backgroundImage: 'url(/img/background.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center bg-transparent p-8 rounded-lg w-full max-w-md"
      >
        {/* Logo */}
        <img src="/img/logo.png" alt="MeowMart Logo" className="w-72 mb-2" />
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-[#4a1c0a] mb-6 tracking-wide">LOGIN</h1>

        {loginError && (
          <div className="text-red-600 text-sm text-center mb-2">{loginError}</div>
        )}

        {/* Username/Email */}
        <div className="relative w-full mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a1c0a]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
            </svg>
          </span>
          <input
            type="email"
            placeholder="username or email"
            {...register('email')}
            className={`pl-12 pr-4 py-3 w-full rounded-lg bg-[#ffe2a9] text-[#4a1c0a] placeholder-[#4a1c0a] border-none focus:ring-2 focus:ring-[#4a1c0a] ${errors.email ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative w-full mb-6">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a1c0a]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75A4.5 4.5 0 008 6.75v3.75m8.25 0a2.25 2.25 0 012.25 2.25v3.75a2.25 2.25 0 01-2.25 2.25H7.5a2.25 2.25 0 01-2.25-2.25v-3.75a2.25 2.25 0 012.25-2.25m8.25 0h-8.25" />
            </svg>
          </span>
          <input
            type="password"
            placeholder="password"
            {...register('password')}
            className={`pl-12 pr-4 py-3 w-full rounded-lg bg-[#ffe2a9] text-[#4a1c0a] placeholder-[#4a1c0a] border-none focus:ring-2 focus:ring-[#4a1c0a] ${errors.password ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#4a1c0a] text-[#ffe2a9] font-semibold py-2 px-12 rounded-full text-lg hover:bg-[#2d1206] transition disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login; 