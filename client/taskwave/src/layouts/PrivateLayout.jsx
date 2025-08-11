import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";

const PrivateLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
      />

      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/5 bg-opacity-50 z-10 mt-20"
          onClick={() => setCollapsed(true)}
        />
      )}

      <main
        className={`${
          isMobile ? "ml-20" : collapsed ? "ml-20" : "ml-64"
        } pt-20 min-h-screen transition-all duration-300`}
      >
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PrivateLayout;
