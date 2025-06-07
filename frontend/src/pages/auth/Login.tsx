import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';

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
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    setIsLoading(true);
    
    try {
      console.group('🔐 Login Process');
      console.log('Attempting login with email:', data.email);
      
      // Make the login request (this will handle CSRF internally)
      console.log('1. Initiating login request...');
      const response = await login(data.email, data.password);
      
      console.log('2. Login successful, processing response...');
      console.log('User ID:', response.user?.id);
      console.log('User role:', response.user?.role || 'not specified');
      
      // Ensure we have a valid user and token
      if (!response.user || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      // Extract user data from response
      const userData = processUserResponse(response);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update Redux store with user data
      dispatch(setCredentials({
        user: userData,
        token: response.token
      }));
      
      // Redirect based on role
      console.log('3. Redirecting to dashboard for role:', userData.role);
      
      if (userData.role === 'admin') {
        navigate('/dashboard');
      } else if (userData.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/cashier');
      }
      
      const backendUser = response.user || {};
      
      // Debug: Log the backend user object
      console.group('Backend User Object');
      console.log('User ID:', backendUser.id);
      console.log('Email:', backendUser.email);
      console.log('Role ID:', backendUser.role_id);
      console.log('Role Object:', backendUser.role);
      console.groupEnd();
      
      // Validate required fields
      if (!backendUser.id) {
        console.error('❌ Invalid user data: Missing user ID');
        throw new Error('Invalid user data received from server');
      }

      // Extract role with comprehensive fallbacks
      let userRole = 'cashier'; // Default role
      
      console.group('Role Extraction');
      try {
        // Case 1: Role is a string
        if (typeof backendUser.role === 'string') {
          userRole = backendUser.role.toLowerCase();
          console.log('Role from string:', userRole);
        } 
        // Case 2: Role is an object with name
        else if (backendUser.role?.name) {
          userRole = backendUser.role.name.toLowerCase();
          console.log('Role from object name:', userRole);
        }
        // Case 3: Only role_id is available
        else if (backendUser.role_id) {
          const roleMap: Record<number, string> = {
            1: 'admin',
            2: 'manager',
            3: 'cashier',
            4: 'administrator'
          };
          userRole = roleMap[backendUser.role_id] || 'cashier';
          console.log('Role from role_id mapping:', userRole);
        } else {
          console.warn('No role information found, using default role');
        }
        
        // Normalize role name
        userRole = userRole.toLowerCase().trim();
        
        // Map variations to standard roles
        if (userRole === 'administrator') userRole = 'admin';
        
        // Validate against allowed roles
        const validRoles = ['admin', 'manager', 'cashier'];
        if (!validRoles.includes(userRole)) {
          console.warn(`Role '${userRole}' not in valid roles, defaulting to 'cashier'`);
          userRole = 'cashier';
        }
        
        console.log('Final role:', userRole);
      } catch (roleError) {
        console.error('Error extracting role:', roleError);
        userRole = 'cashier';
      }
      console.groupEnd();

      // Create user object with all required fields
      const user = {
        id: backendUser.id.toString(),
        username: backendUser.name || backendUser.email?.split('@')[0] || 'user',
        email: backendUser.email || '',
        role: userRole
      };
      
      console.log('Dispatching credentials:', { user, hasToken: !!response.token });
      
      // Ensure we have a token before proceeding
      if (!response.token) {
        throw new Error('No authentication token received');
      }
      
      try {
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', response.token);
        
        // Dispatch credentials to Redux store
        dispatch(setCredentials({ user, token: response.token }));
        
        console.log('Authentication successful, redirecting...');
        console.log('User role:', user.role);
        
        // Redirect based on role
        if (['admin', 'administrator'].includes(user.role)) {
          navigate('/dashboard', { replace: true });
        } else if (user.role === 'manager') {
          navigate('/manager', { replace: true });
        } else if (user.role === 'cashier') {
          navigate('/cashier', { replace: true });
        } else {
          console.warn(`Unknown role '${user.role}', redirecting to login`);
          navigate('/login', { replace: true });
        }
      } catch (storageError) {
        console.error('Error storing user data:', storageError);
        throw new Error('Failed to store user session');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during login. Please try again.';
      setLoginError(errorMessage);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
      console.groupEnd();
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
          disabled={isLoading}
          className={`w-full bg-[#4a1c0a] text-[#ffe2a9] font-semibold py-2 px-12 rounded-full text-lg hover:bg-[#2d1206] transition ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

// Helper function to process user response into standardized format
function processUserResponse(response: any) {
  // Extract role from response
  let userRole = 'cashier';
  if (response.user.role) {
    if (typeof response.user.role === 'string') {
      userRole = response.user.role.toLowerCase();
    } else if (response.user.role.name) {
      userRole = response.user.role.name.toLowerCase();
    }
  }
  
  // Normalize role names
  if (userRole === 'administrator') userRole = 'admin';
  
  // Create user object matching the User type
  return {
    id: response.user.id.toString(),
    username: response.user.username || response.user.email.split('@')[0],
    name: response.user.name || response.user.username || response.user.email.split('@')[0],
    email: response.user.email,
    role: userRole
  };
}

export default Login; 