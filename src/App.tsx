import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { ThemeProvider } from "@/context/ThemeContext";

import Home from "./pages/Home";
import FandomPage from "./pages/FandomPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import Register from "./pages/Register";
import ThankstoRegister from "./pages/ThankstoRegister";
import Categories from "./pages/Categories";
import Role from "./pages/Role";
import CreatePost from "./components/CreatePost";
import ProtectedRoute from "./pages/ProtectedRoute";
import EditProfile from "./pages/EditProfile";
import CreateCommunity from "./components/CreateCommunity";
import Profile from "./pages/Profile";
import SearchPage from "./pages/SearchPage";
import Layout from "./pages/Layout";
import PostDetail from "./pages/PostDetail";
import ChatList from "./pages/ChatList";
import ChatConversation from "./pages/ChatConversation";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user && window.location.pathname === "/") {
      navigate("/home");
    }
  }, [navigate]);

  return (
  <Routes>
    {/* Public pages — no header */}
    <Route path="/" element={<Welcome />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/thankyou" element={<ThankstoRegister />} />
    <Route path="/role" element={<Role />} />
    <Route path="/categories" element={<Categories />} />

    {/* App pages — Layout provides the header */}
    <Route element={<Layout />}>
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/post/:postId" element={<PostDetail />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/profile/:username/edit" element={<EditProfile />} />
      <Route path="/f/:id" element={<FandomPage />} />
      <Route path="/create" element={<CreatePost />} />
      <Route path="/createcommunity" element={<CreateCommunity />} />
      <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
      <Route path="/chat/:otherId" element={<ProtectedRoute><ChatConversation /></ProtectedRoute>} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);
};

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;