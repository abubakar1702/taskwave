import React from 'react';
import { ClipLoader } from 'react-spinners';

const LogOutModal = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 flex flex-col items-center space-y-4 shadow-xl">
        <ClipLoader color="#3b82f6" size={40} />
        <p className="text-gray-800 text-lg font-medium">Logging out...</p>
      </div>
    </div>
  );
};

export default LogOutModal;
