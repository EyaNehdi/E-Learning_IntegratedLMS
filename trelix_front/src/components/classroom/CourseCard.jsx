import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div 
        className="h-2"
        style={{ backgroundColor: course.courseState === 'ACTIVE' ? '#4CAF50' : '#9E9E9E' }}
      ></div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{course.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{course.section || 'Aucune section'}</p>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">
          {course.description || 'Aucune description disponible'}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {course.courseState === 'ACTIVE' ? 'Actif' : 'Archivé'}
          </span>
          <Link 
            to={`/profile/classroom/courses/${course.id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded"
          >
            Voir le cours
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;