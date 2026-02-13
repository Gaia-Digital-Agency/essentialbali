// import { useEffect, useState } from "react";


// // const getAuthToken = () => localStorage.getItem("authToken"); 

// export function useAuth() {
//   // Siapkan state untuk handle authentication
//   // const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!false);

//   // Check authentication, apakah ada token di localStorage
//   const checkAuthentication = () => {
//     // const token = getAuthToken();
//     // setIsAuthenticated(!!token);
//   };

//   useEffect(() => {
    
//     checkAuthentication()

//     // Listen Perubahan Storage
//     const handleStorage = () => {
//       checkAuthentication();
//     };

//     window.addEventListener("storage", handleStorage);

//     return () => {
//       window.removeEventListener("storage", handleStorage);
//     };
//   }, []);

//   return { isAuthenticated, checkAuthentication }

// }