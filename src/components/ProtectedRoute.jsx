// components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../actions/creds";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ children }) => {
   const [isLoading, setIsLoading] = useState(true);
   const [isAuthorized, setIsAuthorized] = useState(false);
   const navigate = useNavigate();

   useEffect(() => {
      const validate = async () => {
         const auth = await checkAuth();
         if (auth) {
            setIsAuthorized(true);
         } else {
            navigate("/");
         }
         setIsLoading(false);
      };
      validate();
   }, [navigate]);

   if (isLoading) {
      return <LoadingScreen />;
   }

   return isAuthorized ? children : null;
};

export default ProtectedRoute;
