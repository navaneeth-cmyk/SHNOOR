import React from 'react';
import { BookOpen, Search, Filter, ArrowRight, Library } from 'lucide-react';

const StudentCoursesView = ({
    loading,
    activeTab, setActiveTab,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedLevel, setSelectedLevel,
    displayCourses,
    enrolledIds,
    categories,
    handleEnroll,
    navigate,
    searchLoading
}) => {

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium text-sm">Loading catalog...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 font-sans text-primary-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary-900 tracking-tight">Course Library</h1>
                    <div className="flex gap-6 mt-4">
                        <button
                            className={`pb-2 text-sm font-bold transition-all relative ${activeTab === 'my-learning'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                            onClick={() => setActiveTab('my-learning')}
                        >
                            My Learning
                        </button>
                        <button
                            className={`pb-2 text-sm font-bold transition-all relative ${activeTab === 'explore'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                            onClick={() => setActiveTab('explore')}
                        >
                            Explore Catalog
                        </button>
                        {searchTerm && (
                            <button
                                className={`pb-2 text-sm font-bold transition-all relative ${activeTab === 'search'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                onClick={() => setActiveTab('search')}
                            >
                                Search Results ({displayCourses.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none transition-all text-sm font-medium"
                        placeholder="Search courses, modules, and more..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab !== 'search' && (
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <select
                                className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 focus:border-indigo-500 outline-none cursor-pointer appearance-none min-w-[160px]"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <select
                            className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 focus:border-indigo-500 outline-none cursor-pointer"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                        >
                            <option value="All">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Search Results View */}
            {activeTab === 'search' && searchTerm && (
                <div className="space-y-3">
                    {searchLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : displayCourses.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {displayCourses.map((result) => (
                                <div key={result.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer" onClick={() => {
                                    if (result.type === 'module') {
                                        navigate(`/student/course/${result.course_id}`);
                                    } else {
                                        navigate(`/student/course/${result.id}`);
                                    }
                                }}>
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="text-indigo-600" size={24} />
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
                                            
                                            {result.instructor_name && (
                                                <p className="text-xs text-indigo-600 font-medium mb-1">
                                                    👤 {result.instructor_name}
                                                </p>
                                            )}
                                            
                                            {result.type === 'module' && result.course_title && (
                                                <p className="text-xs text-slate-500 font-medium mb-1">
                                                    📚 In Course: {result.course_title}
                                                </p>
                                            )}
                                            
                                            <p className="text-xs text-slate-600 line-clamp-2">
                                                {result.description || 'No description available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg">
                            <p>No courses or modules found for "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            )}

            {/* Grid */}
            {activeTab !== 'search' && (
                <>
                    {displayCourses.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-16 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 border border-slate-200">
                                <Library size={32} />
                            </div>
                            <h3 className="text-base font-bold text-primary-900 mb-1">No courses found</h3>
                            <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {displayCourses.map((courses) => {
                                const isEnrolled = enrolledIds.includes(courses.courses_id);
                                return (
                                    <div key={courses.courses_id} className="bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col h-full group">
                                        {/* Thumbnail (Placeholder) */}
                                        <div className="h-40 bg-slate-100 border-b border-slate-100 p-6 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-50 transition-colors">
                                            <BookOpen className="text-slate-300 w-16 h-16 group-hover:text-indigo-200 transition-colors" strokeWidth={1} />
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200 text-[10px] font-bold uppercase tracking-wide text-slate-800">
                                                {courses.category}
                                            </div>
                                            <div className="absolute top-3 right-3 bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                {courses.level || 'General'}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h4 className="text-base font-bold text-primary-900 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                                                {courses.title}
                                            </h4>
                                            <p className="text-xs text-slate-600 mb-4 font-bold flex items-center gap-1">
                                                By <span className="text-slate-800">{courses.instructor_name || 'Instructor'}</span>
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-slate-100">
                                                {isEnrolled ? (
                                                    <button
                                                        className="w-full bg-primary-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2"
                                                        onClick={() => navigate(`/student/course/${courses.courses_id}`)}
                                                    >
                                                        Resume <ArrowRight size={14} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="w-full bg-white border border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 font-bold py-2 px-4 rounded text-sm transition-all flex items-center justify-center gap-2"
                                                        onClick={() => handleEnroll(courses.courses_id)}
                                                    >
                                                        Enroll Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentCoursesView;