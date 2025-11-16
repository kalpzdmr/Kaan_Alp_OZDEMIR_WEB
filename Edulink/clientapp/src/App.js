// clientapp/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// 🔹 Bileşenler
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import SubmitAssignment from "./components/SubmitAssignment";
import ParentDashboard from "./components/ParentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import AssignmentsList from "./components/AssignmentsList";
import AssignmentNew from "./components/AssignmentNew";
import AddAssignment from "./components/AddAssignment";
import SubmissionList from "./components/SubmissionList";
import StudentAssignments from "./components/StudentAssignments"; // (öğrenciler için ayrı sayfa varsa)

// 🔐 Yetkilendirme kontrolü
function RequireAuth({ children, roles }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(role))
        return <Navigate to={`/${role}-dashboard`} replace />;

    return children;
}

export default function App() {
    return (
        <Router>
            <Routes>
                {/* 🔹 Genel */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* 🔹 Öğrenci */}
                <Route
                    path="/dashboard"
                    element={
                        <RequireAuth roles={["öğrenci"]}>
                            <Dashboard />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/submit-assignment"
                    element={
                        <RequireAuth roles={["öğrenci"]}>
                            <SubmitAssignment />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/student-assignments"
                    element={
                        <RequireAuth roles={["öğrenci"]}>
                            <StudentAssignments />
                        </RequireAuth>
                    }
                />

                {/* 🔹 Öğretmen */}
                <Route
                    path="/teacher-dashboard"
                    element={
                        <RequireAuth roles={["öğretmen"]}>
                            <TeacherDashboard />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/assignments"
                    element={
                        <RequireAuth roles={["öğretmen"]}>
                            <AssignmentsList />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/assignments/new"
                    element={
                        <RequireAuth roles={["öğretmen"]}>
                            <AssignmentNew />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/add-assignment"
                    element={
                        <RequireAuth roles={["öğretmen"]}>
                            <AddAssignment />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/submissions"
                    element={
                        <RequireAuth roles={["öğretmen"]}>
                            <SubmissionList />
                        </RequireAuth>
                    }
                />

                {/* 🔹 Veli */}
                <Route
                    path="/parent-dashboard"
                    element={
                        <RequireAuth roles={["veli"]}>
                            <ParentDashboard view="students" />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/parent-submissions"
                    element={
                        <RequireAuth roles={["veli"]}>
                            <ParentDashboard view="submissions" />
                        </RequireAuth>
                    }
                />

                {/* 🔹 Yakalanmayan yönlendirmeler */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}
