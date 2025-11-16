import React, { useEffect, useMemo, useState } from "react";
import { getAssignments, getMySubmissions } from "../api";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function StudentAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("active");
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const [a, s] = await Promise.all([
                    getAssignments().catch(() => []),
                    getMySubmissions().catch(() => []),
                ]);

                setAssignments(Array.isArray(a) ? a : []);
                setSubs(Array.isArray(s) ? s : (s?.submissions ?? []));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const now = new Date();
    const subsByAssignment = useMemo(() => {
        const m = new Map();
        for (const s of subs) {
            m.set(s.assignmentId, s);
        }
        return m;
    }, [subs]);

    const decorated = useMemo(() => {
        const list = assignments.map((a) => {
            const due = new Date(a.dueDate);
            const submitted = subsByAssignment.get(a.id) || null;
            const isActive = due >= new Date(now.toDateString());
            return { ...a, due, submitted, isActive };
        });

        return {
            active: list.filter((x) => x.isActive),
            past: list.filter((x) => !x.isActive),
        };
    }, [assignments, subsByAssignment, now]);

    const rows = tab === "active" ? decorated.active : decorated.past;

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <div
                className="text-white p-3 d-flex flex-column"
                style={{
                    width: 250,
                    background: "linear-gradient(160deg, #00c6ff, #0072ff)",
                    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                }}
            >
                <h4 className="fw-bold text-center mb-4">Öğrenci Paneli</h4>

                <ul className="nav flex-column">
                    <li className="nav-item mb-2">
                        <button
                            className="btn text-white fw-semibold w-100 text-start"
                            onClick={() => navigate("/dashboard")}
                        >
                            Ana Sayfa
                        </button>
                    </li>

                    <li className="nav-item mb-2">
                        <button
                            className="btn text-white fw-semibold w-100 text-start"
                            onClick={() => navigate("/submit-assignment")}
                        >
                            Ödev Teslim Et
                        </button>
                    </li>

                    <li className="nav-item mb-2">
                        <button
                            className="btn text-white fw-semibold w-100 text-start"
                            onClick={() => navigate("/student-assignments")}
                        >
                            Ödevler
                        </button>
                    </li>
                </ul>

                <button
                    className="btn mt-auto fw-semibold"
                    style={{ backgroundColor: "#dc3545", color: "#fff" }}
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }}
                >
                    Çıkış Yap
                </button>
            </div>

            {/* İçerik */}
            <div className="flex-grow-1 p-4" style={{ backgroundColor: "#f8f9fa" }}>
                <div className="container" style={{ maxWidth: 900 }}>
                    <h3 className="fw-bold mb-3 text-primary">Ödevler</h3>

                    {/* Sekmeler */}
                    <div className="btn-group mb-3">
                        <button
                            className={`btn ${tab === "active" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setTab("active")}
                        >
                            Aktif Ödevler
                        </button>

                        <button
                            className={`btn ${tab === "past" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setTab("past")}
                        >
                            Geçmiş Ödevler
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-muted">Yükleniyor…</div>
                    ) : rows.length === 0 ? (
                        <div className="alert alert-info">Bu bölümde gösterilecek ödev bulunamadı.</div>
                    ) : (
                        <div className="list-group shadow-sm">
                            {rows.map((a) => {
                                const s = a.submitted;

                                const teslimEtiketi = s
                                    ? "Teslim edildi"
                                    : a.isActive
                                        ? "Teslim bekleniyor"
                                        : "Süresi geçti";

                                const gradeBadge =
                                    s?.grade != null
                                        ? { text: `${s.grade} puan`, className: "bg-success" }
                                        : s
                                            ? { text: "Not bekliyor", className: "bg-secondary" }
                                            : null;

                                return (
                                    <div
                                        key={a.id}
                                        className="list-group-item d-flex justify-content-between align-items-start"
                                    >
                                        <div>
                                            <div className="fw-semibold">{a.title}</div>

                                            <div className="small text-muted">
                                                Son tarih: {a.due.toLocaleDateString("tr-TR")}
                                                {a?.course?.name ? ` • Ders: ${a.course.name}` : ""}
                                            </div>

                                            <span
                                                className={`badge rounded-pill mt-2 ${s
                                                        ? "text-bg-primary"
                                                        : a.isActive
                                                            ? "text-bg-warning"
                                                            : "text-bg-danger"
                                                    }`}
                                            >
                                                {teslimEtiketi}
                                            </span>
                                        </div>

                                        <div className="text-end">
                                            {gradeBadge && (
                                                <span className={`badge ${gradeBadge.className} me-2`}>
                                                    {gradeBadge.text}
                                                </span>
                                            )}

                                            {s?.submittedAt && (
                                                <div className="small text-muted">
                                                    Teslim:{" "}
                                                    {new Date(s.submittedAt).toLocaleString("tr-TR")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
