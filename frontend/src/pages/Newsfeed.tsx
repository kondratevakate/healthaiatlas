import { Navigate } from 'react-router-dom';

// Newsfeed was merged into Discovery as the "Launches" tab.
export default function Newsfeed() {
  return <Navigate to="/discovery?tab=launches" replace />;
}
