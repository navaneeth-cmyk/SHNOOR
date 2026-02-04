import { useEffect, useState } from "react";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import AssignCourseView from "./view";

const AssignCourse = () => {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchGroup, setSearchGroup] = useState("");
  const [searchStudent, setSearchStudent] = useState("");

  /* =========================
     FETCH STUDENTS + COURSES
  ========================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth.currentUser) throw new Error("Not authenticated");

        await auth.currentUser.getIdToken(); // token validated via axios interceptor

        const [groupsRes, studentsRes, coursesRes] = await Promise.all([
          api.get("/api/admin/groups"),
          api.get("/api/admin/students"),
          api.get("/api/admin/courses?status=approved"),
        ]);

        setGroups(groupsRes.data || []);
        setStudents(studentsRes.data || []);
        setCourses(coursesRes.data.courses || []);
      } catch (err) {
        console.error("AssignCourse fetch error:", err);
        setError("Failed to load students or courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================
     TOGGLE SELECTION
  ========================= */
  const toggleGroup = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  }; 

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const toggleCourse = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  /* =========================
     ASSIGN COURSES
  ========================= */
  const handleAssign = async () => {
    if ((selectedGroups.length === 0 && selectedStudents.length === 0) || selectedCourses.length === 0) {
      throw new Error("Select at least one group or student and one course");
    }

    try {
      await auth.currentUser.getIdToken();

      await api.post("/api/admin/assign-courses", {
        groupIds: selectedGroups,
        studentIds: selectedStudents,
        courseIds: selectedCourses,
      });

      setSelectedGroups([]);
      setSelectedStudents([]);
      setSelectedCourses([]);
    } catch (err) {
      console.error("Assign course error:", err);
      throw err;
    }
  }; 

  /* =========================
     FILTERED DATA
  ========================= */
  const filteredGroups = groups.filter(
    (g) => (g.group_name || "").toLowerCase().includes(searchGroup.toLowerCase())
  );

  const filteredStudents = students.filter(
    (s) => (s.name || "").toLowerCase().includes(searchStudent.toLowerCase()) ||
           (s.email || "").toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <AssignCourseView
      loading={loading}
      error={error}
      groups={filteredGroups}
      students={filteredStudents}
      courses={courses}
      selectedGroups={selectedGroups}
      selectedStudents={selectedStudents}
      selectedCourses={selectedCourses}
      searchGroup={searchGroup}
      searchStudent={searchStudent}
      setSearchGroup={setSearchGroup}
      setSearchStudent={setSearchStudent}
      toggleGroup={toggleGroup}
      toggleStudent={toggleStudent}
      toggleCourse={toggleCourse}
      handleAssign={handleAssign}
    />
  );
};

export default AssignCourse;
