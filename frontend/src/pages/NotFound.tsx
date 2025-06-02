import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
    <p className="text-2xl font-semibold mb-2">Page Not Found</p>
    <p className="text-gray-500 mb-6">Sorry, the page you are looking for does not exist.</p>
    <Link to="/dashboard" className="btn">Go to Dashboard</Link>
  </div>
);

export default NotFound; 