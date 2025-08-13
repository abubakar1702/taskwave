import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";

const FormAction = ({ isCreating, onCancel }) => {
  const navigate = useNavigate();

  return (
    <div className="px-12 py-8 bg-gray-50 text-right rounded-none">
      <button
        type="button"
        onClick={() => onCancel ? onCancel() : navigate(-1)}
        className="inline-flex justify-center py-3 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isCreating}
        className="ml-4 inline-flex items-center justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreating ? (
          <>
            <ClipLoader
              size={16}
              color="white"
              className="mr-2"
            />
            Creating...
          </>
        ) : (
          "Create Task"
        )}
      </button>
    </div>
  );
};

export default FormAction;