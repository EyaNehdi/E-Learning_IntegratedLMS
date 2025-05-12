// components/classroom/CourseCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const CourseCard = ({ course }) => {
  const [expanded, setExpanded] = useState(false);

  const headerColor =
    course.courseState === "ARCHIVED"
      ? "bg-gray-400"
      : course.courseThemeId
        ? `bg-green-500`
        : "bg-blue-500";

  const { name, section, description, courseState } = course;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col h-full">
      <div className={`${headerColor} h-2 w-full`}></div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-1 text-gray-800">{name}</h3>
        {section && <p className="text-gray-600 mb-3">{section}</p>}
        <div className="mb-4 flex-grow">
          {description ? (
            <div>
              <p className={`text-gray-700 ${!expanded && "line-clamp-3"}`}>{description}</p>
              {description.length > 150 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-blue-500 hover:text-blue-700 text-sm mt-1 focus:outline-none"
                >
                  {expanded ? "See less" : "See more"}
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">Aucune description disponible</p>
          )}
        </div>
        {courseState === "ARCHIVED" && (
          <div className="mb-3">
            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Archivé</span>
          </div>
        )}
        <div className="mt-auto pt-3 flex justify-between items-center">
          <Link
            to={`/classroom/courses/${course.id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
          >
            Voir le cours
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;