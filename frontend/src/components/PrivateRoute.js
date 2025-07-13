import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/useAuth";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  console.log("PrivateRoute - user:", user, "loading:", loading);
  
  if (loading) {
    console.log("PrivateRoute - still loading");
    return null;
  }
  
  if (!user) {
    console.log("PrivateRoute - no user, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  console.log("PrivateRoute - user authenticated, rendering children");
  return children;
}

export default PrivateRoute; 