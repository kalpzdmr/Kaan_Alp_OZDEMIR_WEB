import React, { useState, useEffect } from "react";
import { getAssignments, addSubmission } from "../api";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SubmitAssignment() {
    const [assignments, setAssignments] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getAssignments()
            .then((data) => setAssignments(data || []))
            .catch(() => setAssignments([]))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

        if (!userId) {
            setMessage("Oturum bulunamadı.");
            return;
        }

        if (!selectedId) {
            setMessage("Lütfen bir ödev seçiniz!");
            return;
        }

        setSubmitting(true);
        try {
            const result = await addSubmission({
                userId: parseInt(userId),
                assignmentId: parseInt(selectedId),
                fileUrl: "Teslim edildi",
                submittedAt: new Date().toISOString(),
            });

            console.log("Backend cevabı:", result);
            setMessage("Ödev başarıyla teslim edildi!");
            setSelectedId("");
        } catch (err) {
            console.error("Teslim hatası:", err);
            setMessage("Hata: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            {/* Sol Menü */}
            <div
                className="text-white p-3 d-flex flex-column"
                style={{
                    width: "250px",
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
                            onClick={() => navigate("/student-assignments")}
                        >
                            Ödevler
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

            {/* Sağ İçerik */}
            <div
                className="flex-grow-1 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "#f8f9fa" }}
            >
                <div className="card shadow-lg p-4 border-0" style={{ width: "450px" }}>
                    <h3 className="text-center fw-bold mb-3 text-primary">Ödev Teslim Et</h3>

                    {loading ? (
                        <div className="text-center text-muted py-3">Ödevler yükleniyor...</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Ödev Seç:</label>

                                <select
                                    className="form-select"
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value)}
                                    required
                                >
                                    <option value="">Bir ödev seçiniz</option>

                                    {/* 🔥 Sadece teslim tarihi geçmemiş ödevleri göster */}
                                    {assignments
                                        .filter(a => new Date(a.dueDate) >= new Date())
                                        .map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.title}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <button
                                className="btn btn-primary w-100 fw-semibold py-2"
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? "İşaretleniyor..." : "Teslim Edildi"}
                            </button>
                        </form>
                    )}

                    {message && (
                        <div
                            className={`alert text-center mt-3 fw-bold ${message.startsWith("Ödev başarıyla")
                                    ? "alert-success"
                                    : "alert-danger"
                                }`}
                        >
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
