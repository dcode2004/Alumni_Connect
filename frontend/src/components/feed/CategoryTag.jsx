import React from 'react';

const CategoryTag = ({ category }) => {
  const getTagStyle = (category) => {
    switch (category) {
      case 'Interview Experience':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Job Posting':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Project Showcase':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Academic Query':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default: // General
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTagStyle(category)}`}>
      {category}
    </span>
  );
};

export default CategoryTag; 