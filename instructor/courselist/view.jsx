import React, { useState } from "react";
import { Plus, Trash2, Edit, BookOpen, Search } from "lucide-react";
import { FaFileAlt, FaVideo } from "react-icons/fa";

const CourseListView = ({
  loading,
  courses,
  selectedCourse,
  onOpenCourse,
  onBack,
  onEdit,
  onDelete,
  onCreate,
  searchTerm = "",
  setSearchTerm,
  searchResults = [],
  searchLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState("courses");

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "rejected":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-medium animate-pulse">
        Loading library...
      </div>
    );
  if (selectedCourse) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <button
          onClick={onBack}
          className="mb-4 text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← Back to Courses
        </button>

        <h2 className="text-xl font-bold mb-4">{selectedCourse.title}</h2>
        {selectedCourse.modules.length === 0 ? (
          <div className="empty-state-container">No modules added yet.</div>
        ) : (
          selectedCourse.modules.map((m, idx) => (
            <div
              key={m.module_id}
              className="file-list-item clickable"
              onClick={() =>
                window.open(m.content_url, "_blank", "noopener,noreferrer")
              }
            >
              <div className="file-index-circle">{idx + 1}</div>

              <div className="file-info">
                {m.type === "video" ? (
                  <FaVideo className="file-icon-sm video" />
                ) : (
                  <FaFileAlt className="file-icon-sm pdf" />
                )}

                <span className="file-name-row">{m.title}</span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 font-sans text-primary-900 flex flex-col">
      <div className="w-full space-y-4 flex-1 flex flex-col">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 border-b border-slate-200 pb-4 shrink-0 bg-white px-6 py-4 rounded-lg shadow-sm border">
          <div>
            <h1 className="text-2xl font-bold text-primary-900 tracking-tight">
              Course Library
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage and update your published content.
            </p>
          </div>
          <button
            className="bg-primary-900 hover:bg-slate-800 text-white font-semibold py-2 px-6 rounded-md shadow-sm flex items-center gap-2 text-sm"
            onClick={onCreate}
          >
            <Plus size={16} /> Create New Course
          </button>
        </div>

        {/* --- Data Table Section --- */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white shrink-0">
            <div>
              <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">
                {activeTab === "search" ? `Search Results (${searchResults.length})` : `My Courses (${courses.length})`}
              </h3>
              {activeTab === "courses" && (
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => setActiveTab("courses")}
                    className={`text-sm font-medium pb-1 border-b-2 transition-all ${activeTab === "courses" ? "text-indigo-600 border-b-indigo-600" : "text-slate-500 border-b-transparent hover:text-slate-700"}`}
                  >
                    All Courses
                  </button>
                  {searchTerm && (
                    <button
                      onClick={() => setActiveTab("search")}
                      className={`text-sm font-medium pb-1 border-b-2 transition-all ${activeTab === "search" ? "text-indigo-600 border-b-indigo-600" : "text-slate-500 border-b-transparent hover:text-slate-700"}`}
                    >
                      Search Results
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search courses & modules..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value) setActiveTab("search");
                }}
                className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none transition-colors"
              />
            </div>
          </div>

          {activeTab === "search" ? (
            // Search Results View
            <div className="overflow-auto flex-1 p-4">
              {searchLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div key={result.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="text-indigo-600" size={20} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm text-slate-900 truncate">
                              {result.title}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${result.type === 'module' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {result.type === 'module' ? 'Module' : 'Course'}
                            </span>
                          </div>
                          
                          {result.type === 'module' && result.course_title && (
                            <p className="text-xs text-slate-500 font-medium mb-1">
                              📚 In Course: {result.course_title}
                            </p>
                          )}
                          
                          <p className="text-xs text-slate-600 line-clamp-1">
                            {result.description || 'No description available'}
                          </p>
                          
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>No courses or modules found for "{searchTerm}"</p>
                </div>
              )}
            </div>
          ) : (
            // Courses Table View
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse h-full">
                <thead className="bg-[#f8fafc] border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Course Title
                    </th>
                    <th className="px-6 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide h-hidden md:table-cell">
                      Category
                    </th>
                    <th className="px-6 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Modules
                    </th>
                    <th className="px-6 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide text-right">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        <BookOpen
                          size={48}
                          className="mx-auto mb-4 text-slate-300"
                          strokeWidth={1}
                        />
                        <p className="text-sm">
                          No courses found. Create one to get started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr
                        key={course.courses_id}
                        onClick={() => onOpenCourse(course)}
                        className="hover:bg-[#f8fafc] cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-primary-900 text-sm">
                            {course.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 md:hidden">
                            {course.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                          {course.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">
                          {course.modules ? course.modules.length : 0}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(course.status)}`}
                          >
                            {course.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 text-right tabular-nums">
                          {course.created_at
                            ? new Date(course.created_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(course);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(course.courses_id);
                              }}
                              disabled={course.status === "approved"}
                              className={`p-1.5 rounded transition-colors ${course.status === "approved" ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"}`}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseListView;
