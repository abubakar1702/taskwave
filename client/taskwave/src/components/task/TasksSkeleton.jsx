import React from "react";

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-auto min-h-[200px]">
    {/* Header badges */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex gap-2">
        <div className="h-7 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-7 w-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-7 w-24 bg-gray-200 rounded-full"></div>
    </div>

    {/* Title area */}
    <div className="mb-4">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>

    {/* Due date box */}
    <div className="mb-4">
      <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
    </div>

    {/* Assignees */}
    <div className="mb-4">
      <div className="flex justify-end">
        <div className="flex -space-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-gray-200"></div>
          ))}
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
      <div className="flex gap-4">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

const TasksSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default TasksSkeleton;
