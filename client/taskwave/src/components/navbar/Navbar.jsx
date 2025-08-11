import React from "react";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center p-4 bg-white shadow-sm border-b border-gray-200">
      <Logo /> 
      <div className="flex items-center space-x-4">
        <NotificationBell />
        <UserMenu />
      </div>
    </nav>
  );
};

export default Navbar;