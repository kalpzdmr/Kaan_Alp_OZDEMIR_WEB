import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignments } from "../api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Dashboard() {
    const navigate = useNavigate();
    const [role, setRole] = useState("");
    const [fullName, setFullName] = useState("");
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");

        if (!token) {
            navigate("/login");
            return;
        }
        setRole(savedRole || "öğrenci");

        // 🔹 Kullanıcı adını al
        const savedUser = JSON.parse(localStorage.getItem("user"));
        if (savedUser && savedUser.fullName) {
            setFullName(savedUser.fullName);
        }

        // 🔹 Ödevleri çek
        const fetchAssignments = async () => {
            try {
                const data = await getAssignments();
                setAssignments(data);
            } catch (err) {
                console.error("Veriler alınamadı:", err);
                setAssignments([]);
            }
        };

        fetchAssignments();
    }, [navigate]);

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="d-flex" style={{ height: "100vh", background: "#f8f9fa" }}>
            {/* ---------- Sidebar ---------- */}
            <div
                className="d-flex flex-column flex-shrink-0 p-3 text-white"
                style={{
                    width: "260px",
                    background: "linear-gradient(160deg, #00c6ff, #0072ff)",
                    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                }}
            >
                <h3 className="text-center mb-4 fw-bold">Edulink</h3>

                <ul className="nav nav-pills flex-column mb-auto">

                    <li className="nav-item mb-2">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="btn text-white w-100 text-start"
                        >
                            Ödev Listesi
                        </button>
                    </li>

                    <li className="nav-item mb-2">
                        <button
                            onClick={() => navigate("/student-assignments")}
                            className="btn text-white w-100 text-start"
                        >
                            Ödevler
                        </button>
                    </li>

                    {role === "öğretmen" && (
                        <li className="nav-item mb-2">
                            <button
                                onClick={() => navigate("/add-assignment")}
                                className="btn text-white w-100 text-start"
                            >
                                Yeni Ödev
                            </button>
                        </li>
                    )}

                    {role === "öğrenci" && (
                        <li className="nav-item mb-2">
                            <button
                                onClick={() => navigate("/submit-assignment")}
                                className="btn text-white w-100 text-start"
                            >
                                Ödev Teslim Et
                            </button>
                        </li>
                    )}
                </ul>

                <hr />

                <button onClick={logout} className="btn btn-danger w-100">
                    Çıkış Yap
                </button>
            </div>

            {/* ---------- Main Content ---------- */}
            <div className="flex-grow-1 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold">
                        Hoş geldin,{" "}
                        <span className="text-primary">
                            {fullName || "Kullanıcı"}
                        </span>
                    </h3>
                </div>

                <div className="row g-4">
                    {assignments.length === 0 ? (
                        <div className="text-muted text-center mt-5">
                            Henüz ödev bulunamadı!
                        </div>
                    ) : (
                        assignments.map((a) => (
                            <div key={a.id} className="col-md-4">
                                <div
                                    className="card shadow-sm border-0"
                                    style={{ borderRadius: "16px", overflow: "hidden" }}
                                >
                                    <div
                                        className="card-header text-white"
                                        style={{
                                            background: "linear-gradient(135deg, #43cea2, #185a9d)",
                                        }}
                                    >
                                        <h5 className="mb-0">{a.title}</h5>
                                    </div>
                                    <div className="card-body">
                                        <p className="card-text">{a.description}</p>
                                        <small className="text-muted">
                                            Teslim tarihi:{" "}
                                            {a.dueDate
                                                ? new Date(a.dueDate).toLocaleDateString("tr-TR")
                                                : "Belirtilmemiş"}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
