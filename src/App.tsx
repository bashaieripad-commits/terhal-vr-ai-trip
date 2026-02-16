import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import TripPlanner from "./pages/TripPlanner";
import Auth from "./pages/Auth";
import HotelDetails from "./pages/HotelDetails";
import Checkout from "./pages/Checkout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Flights from "./pages/Flights";
import SeatSelection from "./pages/SeatSelection";
import ActivityDetails from "./pages/ActivityDetails";
import CreateAdmin from "./pages/CreateAdmin";
import MyTickets from "./pages/MyTickets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/activity/:id" element={<ActivityDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/flight/:id/seats" element={<SeatSelection />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/create-admin" element={<CreateAdmin />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
