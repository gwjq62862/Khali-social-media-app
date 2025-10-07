
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/Home";
import Signup from "./pages/auth/sign-up/Singup";
import Login from "./pages/auth/login/Login";
import toast, { Toaster } from "react-hot-toast";

import { useQuery } from "@tanstack/react-query";
import UserProfile from "./pages/profile/Proifle";
import NotificationsPage from "./pages/notification/Notification";
import Sidebar from "./components/SIdebar";



function App() {
  const {
    isError,
    isLoading,
    data: authUser,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/Me", {
          method: "GET",
          credentials: "include",
        });
        const resData = await res.json();

        if (res.status === 401) return null;
        if (!res.ok)
          throw new Error(resData.message || "Failed to fetch user data");
        return resData;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    retry: 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex container mx-auto">
      {authUser && (
        <div className="lg:w-60 lg:flex-shrink-0 lg:fixed lg:h-screen z-50 p-4">
          <Sidebar user={authUser} />
        </div>
      )}

      <div className={`flex-grow ${authUser ? "lg:ml-60" : ""}`}>
        <Routes>
          <Route
            path="/"
            element={
              authUser ? <Home user={authUser} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/signup"
            element={!authUser ? <Signup /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/profile/:username"
            element={
              authUser ? (
                <UserProfile authUser={authUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/notification"
            element={
              authUser ? <NotificationsPage /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>

      <Toaster />
    </div>
  );
}

export default App;
