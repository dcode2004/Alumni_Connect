import React from 'react';

const PostSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="ml-4">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton; 