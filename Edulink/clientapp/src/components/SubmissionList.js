// clientapp/src/components/SubmissionList.js
import React, { useEffect, useState } from "react";
import { getAllSubmissions, gradeSubmission } from "../api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SubmissionList() {
    const [submissions, setSubmissions] = useState([]);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getAllSubmissions();
                setSubmissions(data || []);
            } catch (err) {
                setMsg("Teslim verileri alınamadı: " + err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleGrade = async (id) => {
        const grade = prompt("Öğrenciye vereceğiniz not (0-100):");
        if (!grade) return;
        const feedback = prompt("Geri bildirim (isteğe bağlı):") || "";

        try {
            await gradeSubmission(id, parseInt(grade), feedback);
            alert(" Not başarıyla kaydedildi!");

            setSubmissions((prev) =>
                prev.map((s) =>
                    s.id === id
                        ? {
                            ...s,
                            grade: parseInt(grade),
                            feedback,
                            gradedAt: new Date().toISOString(),
                        }
                        : s
                )
            );
        } catch (err) {
            alert(" Not kaydedilemedi: " + err.message);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="fw-bold text-center mb-4">Öğrenci Teslimleri</h2>

            {msg && <div className="alert alert-warning text-center">{msg}</div>}

            {loading ? (
                <div className="text-center py-4 text-muted">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3">Teslimler yükleniyor...</p>
                </div>
            ) : (
                <div className="table-responsive shadow-sm rounded-3">
                    <table className="table table-hover align-middle text-center">
                        <thead className="table-primary">
                            <tr>
                                <th>#</th>
                                <th>Öğrenci</th>
                                <th>Ödev</th>
                                <th>Teslim Tarihi</th>
                                <th>Not</th>
                                <th>Geri Bildirim</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-muted py-4">
                                        Henüz hiçbir teslim yapılmamış.
                                    </td>
                                </tr>
                            ) : (
                                submissions.map((s, i) => (
                                    <tr key={s.id}>
                                        <td>{i + 1}</td>
                                        <td>{s.user?.fullName || `#${s.userId}`}</td>
                                        <td>{s.assignment?.title || `#${s.assignmentId}`}</td>
                                        <td>
                                            {new Date(s.submittedAt).toLocaleString("tr-TR", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </td>
                                        <td>
                                            {s.grade != null ? (
                                                <span className="badge bg-success fs-6 px-3 py-2">
                                                    {s.grade}
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary fs-6 px-3 py-2">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-muted">{s.feedback || "—"}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => handleGrade(s.id)}
                                            >
                                                Not Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
