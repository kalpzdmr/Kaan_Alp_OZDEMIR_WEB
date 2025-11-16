import React, { useEffect, useState } from "react";
import {
    getStudentsByParent,
    getSubmissionsByParent,
    getActiveAssignmentsForStudent,
    getCourses
} from "../api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ParentDashboard() {
    const [students, setStudents] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [activeAssignments, setActiveAssignments] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [courses, setCourses] = useState([]);
    const [msg, setMsg] = useState("");
    const [view, setView] = useState("students");

    const parentId = localStorage.getItem("userId");

    // 🔹 Tüm verileri yükle (öğrenciler, teslimler, dersler)
    useEffect(() => {
        async function loadData() {
            try {
                const stu = await getStudentsByParent(parentId);
                setStudents(stu?.students || []);

                const subs = await getSubmissionsByParent(parentId);
                setSubmissions(subs?.submissions || []);

                const crs = await getCourses();
                setCourses(crs || []);
            } catch {
                setMsg("Veriler alınamadı. Backend açık mı?");
            }
        }
        if (parentId) loadData();
    }, [parentId]);

    // 🔹 Aktif ödevleri yükle
    useEffect(() => {
        async function fetchActiveAssignments() {
            if (!selectedStudent) return;
            try {
                const data = await getActiveAssignmentsForStudent(selectedStudent.id);
                setActiveAssignments(data?.activeAssignments || []);
            } catch (err) {
                console.error(err);
            }
        }
        fetchActiveAssignments();
    }, [selectedStudent]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setView("aktif");
    };

    // Ders adını courseId'den bulur
    const getCourseName = (courseId) => {
        const c = courses.find(x => x.id === courseId);
        return c ? c.name : "—";
    };

    // Teslim edilenler
    const teslimEdilenler = selectedStudent
        ? submissions.filter(s => s.studentName === selectedStudent.fullName)
        : [];

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>

            {/* SOL SIDEBAR */}
            <aside
                style={{
                    width: "250px",
                    background: "linear-gradient(160deg, #00c6ff, #0072ff)",
                    padding: "25px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    color: "#fff",
                }}
            >
                <div>
                    <h3 className="fw-bold mb-4 text-center">Edulink</h3>
                    <ul className="list-unstyled">

                        <li className="mb-3">
                            <button
                                onClick={() => setView("students")}
                                className="btn text-white fw-semibold w-100 text-start"
                            >
                                Öğrenciler
                            </button>
                        </li>

                        {selectedStudent && (
                            <>
                                <li className="mb-3">
                                    <button
                                        onClick={() => setView("aktif")}
                                        className="btn text-white fw-semibold w-100 text-start"
                                    >
                                        Aktif Ödevler
                                    </button>
                                </li>

                                <li className="mb-3">
                                    <button
                                        onClick={() => setView("teslim")}
                                        className="btn text-white fw-semibold w-100 text-start"
                                    >
                                        Teslim Edilenler
                                    </button>
                                </li>
                            </>
                        )}

                    </ul>
                </div>

                <button
                    className="btn btn-danger mt-auto fw-semibold"
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }}
                >
                    Çıkış Yap
                </button>
            </aside>

            {/* SAĞ PANEL */}
            <main
                style={{
                    flex: 1,
                    backgroundColor: "#f8f9fa",
                    padding: "40px",
                    borderTopLeftRadius: "20px",
                    borderBottomLeftRadius: "20px",
                }}
            >
                <h2 className="fw-bold mb-4 text-center text-primary">Veli Paneli</h2>

                {msg && (
                    <div className="alert alert-warning text-center fw-semibold">
                        {msg}
                    </div>
                )}

                {/* === ÖĞRENCİLER === */}
                {view === "students" && (
                    <>
                        <h4 className="fw-semibold mb-3">Öğrenciler</h4>
                        <div className="row">
                            {students.length === 0 ? (
                                <p className="text-muted text-center">Henüz öğrenci atanmadı.</p>
                            ) : (
                                students.map((s) => (
                                    <div className="col-md-4 mb-4" key={s.id}>
                                        <div
                                            style={{
                                                cursor: "pointer",
                                                borderRadius: "15px",
                                            }}
                                            onClick={() => handleSelectStudent(s)}
                                            className={`card shadow-sm border-0 ${selectedStudent?.id === s.id ? "border-primary border-3" : ""}`}
                                        >
                                            <div className="card-body text-center">
                                                <h5 className="card-title fw-bold text-primary">
                                                    {s.fullName}
                                                </h5>
                                                <p className="text-muted mb-2">{s.email}</p>
                                                <button className="btn btn-outline-primary btn-sm">Seç</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* === AKTİF ÖDEVLER === */}
                {view === "aktif" && (
                    <>
                        <h4 className="fw-bold text-primary mb-3">
                            {selectedStudent?.fullName} - Aktif Ödevler
                        </h4>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <table className="table table-striped text-center align-middle">
                                    <thead className="table-warning">
                                        <tr>
                                            <th>Ödev</th>
                                            <th>Ders</th>
                                            <th>Son Teslim Tarihi</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {activeAssignments.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-muted">
                                                    Aktif ödev bulunmuyor.
                                                </td>
                                            </tr>
                                        ) : (
                                            activeAssignments.map((a, i) => (
                                                <tr key={i}>
                                                    <td>{a.title}</td>
                                                    <td>{getCourseName(a.courseId)}</td>
                                                    <td>{new Date(a.dueDate).toLocaleDateString("tr-TR")}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* === TESLİM EDİLENLER === */}
                {view === "teslim" && (
                    <>
                        <h4 className="fw-bold text-primary mb-3">
                            {selectedStudent?.fullName} - Teslim Edilenler
                        </h4>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <table className="table table-striped text-center align-middle">
                                    <thead className="table-primary">
                                        <tr>
                                            <th>Ödev</th>
                                            <th>Teslim Tarihi</th>
                                            <th>Not</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {teslimEdilenler.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-muted">
                                                    Henüz teslim edilmiş ödev yok.
                                                </td>
                                            </tr>
                                        ) : (
                                            teslimEdilenler.map((t, i) => (
                                                <tr key={i}>
                                                    <td>{t.assignmentTitle}</td>
                                                    <td>{new Date(t.submittedAt).toLocaleDateString("tr-TR")}</td>
                                                    <td>
                                                        {t.grade != null ? (
                                                            <span className="badge bg-success">{t.grade}</span>
                                                        ) : (
                                                            <span className="badge bg-secondary">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
