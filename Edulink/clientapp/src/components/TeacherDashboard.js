import React, { useEffect, useState } from "react";
import {
    getAssignments,
    getAllSubmissions,
    addAssignment,
    deleteAssignment,
    gradeSubmission
} from "../api";

export default function TeacherDashboard() {

    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [course, setCourse] = useState("");
    const [dueDate, setDueDate] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showActive, setShowActive] = useState(false);

    const courses = [
        "Türkçe", "Matematik", "Fizik", "Kimya", "Biyoloji",
        "İnkılap", "İngilizce", "Din Kültürü"
    ];

    /* ----------------------------------------------------
       İlk yükleme: Ödevler + Teslimler
    ---------------------------------------------------- */
    useEffect(() => {
        async function fetchData() {
            try {
                const asgs = await getAssignments();
                const subs = await getAllSubmissions();

                const now = new Date();
                const active = [];

                // Süresi dolan ödevleri sil
                for (const a of asgs) {
                    if (a.dueDate && new Date(a.dueDate) < now) {
                        try {
                            await deleteAssignment(a.id);
                        } catch { }
                    } else {
                        active.push(a);
                    }
                }

                setAssignments(active);
                setSubmissions(subs);
            } catch (err) {
                setMessage("Veriler alınamadı: " + err.message);
            }
        }

        fetchData();
    }, []);

    /* ----------------------------------------------------
       Ödev EKLEME
    ---------------------------------------------------- */
    const handleAdd = async (e) => {
        e.preventDefault();

        if (!title || !course || !dueDate) {
            setMessage("Lütfen tüm alanları doldurunuz!");
            return;
        }

        setLoading(true);
        try {
            const teacherId = parseInt(localStorage.getItem("userId"));
            if (!teacherId || isNaN(teacherId)) {
                throw new Error("Geçersiz öğretmen ID'si.");
            }

            const newAssignment = {
                title,
                description: description || "Açıklama girilmedi.",
                dueDate,
                courseName: course   // 🔥 API ile tam uyumlu
            };

            await addAssignment(newAssignment);
            setMessage("Ödev başarıyla eklendi!");

            // Form temizle
            setTitle("");
            setDescription("");
            setCourse("");
            setDueDate("");

            // Ödevleri güncelle
            const updated = await getAssignments();
            setAssignments(updated);

        } catch (err) {
            setMessage("Hata: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ----------------------------------------------------
       Ödev SİLME
    ---------------------------------------------------- */
    const handleDelete = async (id) => {
        if (!window.confirm("Bu ödevi silmek istiyor musun?")) return;

        try {
            await deleteAssignment(id);
            const updated = await getAssignments();
            setAssignments(updated);
        } catch (err) {
            alert("Silme hatası: " + err.message);
        }
    };

    /* ----------------------------------------------------
       Not Verme
    ---------------------------------------------------- */
    const handleGrade = async (submissionId) => {
        const grade = prompt("Not (0-100):");
        if (!grade || isNaN(grade)) return;

        try {
            await gradeSubmission(submissionId, parseInt(grade));
            alert("Not kaydedildi!");

            const updated = await getAllSubmissions();
            setSubmissions(updated);
        } catch (err) {
            alert("Hata: " + err.message);
        }
    };

    /* ----------------------------------------------------
       Aktif Ödevler
    ---------------------------------------------------- */
    const activeAssignments = assignments.filter(
        (a) => new Date(a.dueDate) >= new Date()
    );

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            {/* Sol Menü */}
            <div
                className="text-white p-3 d-flex flex-column"
                style={{
                    width: "250px",
                    background: "linear-gradient(160deg, #00c6ff, #0072ff)"
                }}
            >
                <h4 className="fw-bold text-center mb-4">Öğretmen Paneli</h4>

                <ul className="nav flex-column">
                    <li className="nav-item mb-2">
                        <button
                            className="btn text-white w-100 text-start"
                            onClick={() => setShowActive(false)}
                        >
                            Ödev Ekle
                        </button>
                    </li>

                    <li className="nav-item mb-2">
                        <button
                            className="btn text-white w-100 text-start"
                            onClick={() => setShowActive(true)}
                        >
                            Aktif Ödevler
                        </button>
                    </li>

                    <li className="nav-item mb-2">
                        <button
                            className="btn text-white w-100 text-start"
                            onClick={() => setShowActive(false)}
                        >
                            Teslimler
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
            <div className="flex-grow-1 p-4" style={{ backgroundColor: "#f8f9fa" }}>

                {/* ----------------------------------------------------
                   AKTİF ÖDEVLER
                ---------------------------------------------------- */}
                {showActive ? (
                    <>
                        <h3 className="text-success fw-bold mb-3">Aktif Ödevler</h3>

                        {activeAssignments.length === 0 ? (
                            <div className="text-muted">Aktif ödev bulunamadı.</div>
                        ) : (
                            <div className="row g-4">
                                {activeAssignments.map((a) => (
                                    <div key={a.id} className="col-md-4">
                                        <div className="card shadow-sm border-0">
                                            <div
                                                className="card-header text-white fw-bold"
                                                style={{
                                                    background: "linear-gradient(135deg, #43cea2, #185a9d)"
                                                }}
                                            >
                                                {a.title}
                                            </div>

                                            <div className="card-body">
                                                <p>{a.description}</p>
                                                <small className="text-muted">
                                                    Teslim:{" "}
                                                    {new Date(a.dueDate).toLocaleDateString("tr-TR")}
                                                </small>

                                                <button
                                                    className="btn btn-sm btn-danger mt-2 float-end"
                                                    onClick={() => handleDelete(a.id)}
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* ----------------------------------------------------
                           ÖDEV EKLEME
                        ---------------------------------------------------- */}
                        <h3 className="text-primary fw-bold mb-4">Ödev Yönetimi</h3>

                        <div className="card shadow-sm mb-4 border-0">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3">Yeni Ödev Ekle</h5>

                                {message && (
                                    <div className="alert alert-info text-center">
                                        {message}
                                    </div>
                                )}

                                <form className="row g-3" onSubmit={handleAdd}>
                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ödev Başlığı"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <select
                                            className="form-select"
                                            value={course}
                                            onChange={(e) => setCourse(e.target.value)}
                                            required
                                        >
                                            <option value="">Ders Seçiniz</option>
                                            {courses.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-3">
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Açıklama (isteğe bağlı)"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <button
                                            type="submit"
                                            className="btn btn-success fw-semibold px-4"
                                            disabled={loading}
                                        >
                                            {loading ? "Ekleniyor..." : "Ekle"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* ----------------------------------------------------
                           TESLİMLER TABLOSU
                        ---------------------------------------------------- */}
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3 text-success">Öğrenci Teslimleri</h5>

                                <table className="table table-hover align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Öğrenci</th>
                                            <th>Ödev</th>
                                            <th>Teslim Tarihi</th>
                                            <th>Dosya</th>
                                            <th>Not</th>
                                            <th>İşlem</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {submissions.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center text-muted">
                                                    Henüz teslim yapılmamış.
                                                </td>
                                            </tr>
                                        ) : (
                                            submissions.map((s) => (
                                                <tr key={s.id}>
                                                    <td>{s.user?.fullName || "-"}</td>
                                                    <td>{s.assignment?.title || "-"}</td>
                                                    <td>
                                                        {new Date(s.submittedAt).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <a href={s.fileUrl} target="_blank" rel="noreferrer">
                                                            Dosya
                                                        </a>
                                                    </td>
                                                    <td>
                                                        {s.grade != null ? (
                                                            <span className="badge bg-success">{s.grade}</span>
                                                        ) : (
                                                            <span className="badge bg-secondary">-</span>
                                                        )}
                                                    </td>
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
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
