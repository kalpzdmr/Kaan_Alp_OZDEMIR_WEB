import React, { useEffect, useState } from "react";
import { getAssignments, getAllSubmissions } from "../api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AssignmentsList() {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userId = localStorage.getItem("userId");

    // 🔹 Verileri çek
    useEffect(() => {
        async function fetchData() {
            try {
                const asgs = await getAssignments();
                const subs = await getAllSubmissions();
                setAssignments(asgs || []);
                setSubmissions(subs || []);
            } catch (err) {
                setError("Veriler alınamadı: " + err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // 🔹 Öğrencinin teslimleri
    const mySubs = submissions.filter((s) => s.user?.id === parseInt(userId));

    // 🔹 Süresi dolmuş mu
    const isOverdue = (date) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    const activeAssignments = assignments.filter((a) => !isOverdue(a.dueDate));
    const pastAssignments = assignments.filter((a) => isOverdue(a.dueDate));

    // 🔹 Not & teslim durumu bul
    const getSubmissionInfo = (assignmentId) => {
        const sub = mySubs.find((s) => s.assignment?.id === assignmentId);
        if (!sub) return { delivered: false, grade: null };
        return { delivered: true, grade: sub.grade };
    };

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            {/* 🔹 Sol Menü (mor tema) */}
            <div
                className="text-white p-3 d-flex flex-column"
                style={{
                    width: "250px",
                    background: "linear-gradient(135deg, #6f42c1, #8e44ad)",
                }}
            >
                <h4 className="fw-bold text-center mb-4">Öğrenci Paneli</h4>
                <ul className="nav flex-column">
                    <li className="nav-item mb-2">
                        <a
                            className="nav-link text-white fw-semibold"
                            href="/dashboard"
                        >
                             Ana Sayfa
                        </a>
                    </li>
                    <li className="nav-item mb-2">
                        <a
                            className="nav-link text-white fw-semibold"
                            href="/submit-assignment"
                        >
                             Ödev Teslim Et
                        </a>
                    </li>
                </ul>
                <button
                    className="btn mt-auto fw-semibold"
                    style={{
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        border: "none",
                    }}
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }}
                >
                     Çıkış
                </button>
            </div>

            {/* 🔹 Sağ İçerik */}
            <div className="flex-grow-1 p-4" style={{ backgroundColor: "#f8f9fa" }}>
                <h3 className="text-primary fw-bold mb-4">Ödev Listesi</h3>

                {loading ? (
                    <div className="text-center text-muted">Yükleniyor...</div>
                ) : error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                ) : (
                    <>
                        {/* 🟢 Aktif Ödevler */}
                        <div className="card shadow-sm mb-4 border-0">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3 text-success">Aktif Ödevler</h5>
                                <table className="table table-hover align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Ders</th>
                                            <th>Başlık</th>
                                            <th>Açıklama</th>
                                            <th>Teslim Tarihi</th>
                                            <th>Teslim Durumu</th>
                                            <th>Aldığın Not</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeAssignments.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center text-muted">
                                                    Aktif ödev bulunmuyor.
                                                </td>
                                            </tr>
                                        ) : (
                                            activeAssignments.map((a) => {
                                                const { delivered, grade } = getSubmissionInfo(a.id);
                                                return (
                                                    <tr key={a.id}>
                                                        <td>{a.course?.name || "-"}</td>
                                                        <td>{a.title}</td>
                                                        <td>{a.description || "-"}</td>
                                                        <td>
                                                            {a.dueDate
                                                                ? new Date(a.dueDate).toLocaleDateString("tr-TR")
                                                                : "-"}
                                                        </td>
                                                        <td>
                                                            {delivered ? (
                                                                <span className="badge bg-success">
                                                                    Teslim Edildi 
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-danger">
                                                                    Teslim Edilmedi 
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {grade != null ? (
                                                                <span className="badge bg-success">{grade}</span>
                                                            ) : (
                                                                <span className="badge bg-secondary">
                                                                    Not Bekleniyor
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 🔴 Süresi Dolmuş Ödevler */}
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3 text-danger">Süresi Dolmuş Ödevler</h5>
                                <table className="table table-hover align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Ders</th>
                                            <th>Başlık</th>
                                            <th>Açıklama</th>
                                            <th>Teslim Tarihi</th>
                                            <th>Teslim Durumu</th>
                                            <th>Aldığın Not</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pastAssignments.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center text-muted">
                                                    Süresi dolmuş ödev bulunmuyor.
                                                </td>
                                            </tr>
                                        ) : (
                                            pastAssignments.map((a) => {
                                                const { delivered, grade } = getSubmissionInfo(a.id);
                                                return (
                                                    <tr key={a.id}>
                                                        <td>{a.course?.name || "-"}</td>
                                                        <td>{a.title}</td>
                                                        <td>{a.description || "-"}</td>
                                                        <td>
                                                            {a.dueDate
                                                                ? new Date(a.dueDate).toLocaleDateString("tr-TR")
                                                                : "-"}
                                                        </td>
                                                        <td>
                                                            {delivered ? (
                                                                <span className="badge bg-success">
                                                                    Teslim Edildi 
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-danger">
                                                                    Teslim Edilmedi 
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {grade != null ? (
                                                                <span className="badge bg-success">{grade}</span>
                                                            ) : (
                                                                <span className="badge bg-secondary">
                                                                    Not Bekleniyor
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
