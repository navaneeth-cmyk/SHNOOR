import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import StudentCoursesView from "./view";

const StudentCourses = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("my-learning");
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // 🔑 derive enrolledIds for the VIEW
  const enrolledIds = myCourses.map(
    (c) => c.courses_id || c.id
  );

  // Fetch courses (My Learning + Explore)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!auth.currentUser) return;

        setLoading(true);
        const token = await auth.currentUser.getIdToken(true);

        const [myRes, exploreRes] = await Promise.all([
          api.get("/api/student/my-courses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/courses/explore", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setMyCourses(myRes.data || []);
        setAllCourses(exploreRes.data || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Search for courses and modules
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const token = await auth.currentUser.getIdToken(true);
        const res = await api.get("/api/student/search-courses", {
          params: { query: searchTerm },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(res.data || []);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    performSearch();
  }, [searchTerm]);

  // Pick active list
  const displayCourses =
    activeTab === "search" ? searchResults :
    activeTab === "my-learning" ? myCourses : allCourses;

  // Apply filters (not for search results)
  const filteredCourses = activeTab === "search" ? displayCourses : displayCourses.filter((course) => {
    const matchesSearch = course.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      course.category === selectedCategory;

    const matchesLevel =
      selectedLevel === "All" || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Enroll handler
  const handleEnroll = async (courseId) => {
    try {
      const token = await auth.currentUser.getIdToken(true);

      await api.post(
        `/api/student/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh both lists after enroll
      const [myRes, exploreRes] = await Promise.all([
        api.get("/api/student/my-courses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/api/courses/explore", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMyCourses(myRes.data || []);
      setAllCourses(exploreRes.data || []);
      setActiveTab("my-learning");
    } catch (err) {
      console.error("Enroll failed:", err);
      alert("Failed to enroll.");
    }
  };

  // Categories for filter dropdown
  const categories = [
    ...new Set(allCourses.map((c) => c.category).filter(Boolean)),
  ];

  return (
    <StudentCoursesView
      loading={loading}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedLevel={selectedLevel}
      setSelectedLevel={setSelectedLevel}
      displayCourses={filteredCourses}
      enrolledIds={enrolledIds}        
      categories={categories}
      handleEnroll={handleEnroll}
      navigate={navigate}
      searchLoading={searchLoading}
    />
  );
};

export default StudentCourses;