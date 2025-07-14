import React from "react";
import { Navigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useAuth } from "../firebase/useAuth";
import Loader from "./Loader";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  console.log("PrivateRoute - user:", user, "loading:", loading);
  
  if (loading) {
    return (
      <Loader fullScreen />
    );
  }
  
  if (!user) {
    console.log("PrivateRoute - no user, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  console.log("PrivateRoute - user authenticated, rendering children");
  return children;
}

export default PrivateRoute; 