import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexte/useAuth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!token || !user) {
        navigate('/');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'SUPER_ADMIN') {
          navigate('/dashboard-super-admin');
        } else if (user.role === 'ADMIN') {
          navigate('/dashboard-admin');
        } else if (user.role === 'CAISSIER') {
          navigate('/dashboard-caissier');
        } else {
          navigate('/');
        }
      }
    }
  }, [isLoading, token, user, allowedRoles, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-twitterBlue" />
      </div>
    );
  }

  if (!token || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null; // Redirect en cours
  }

  return children;
}
