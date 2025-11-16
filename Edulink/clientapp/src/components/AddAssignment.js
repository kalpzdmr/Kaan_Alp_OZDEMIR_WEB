// clientapp/src/components/AddAssignment.js
import React, { useState, useEffect } from "react";
import { addAssignment, getCourses } from "../api";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AddAssignment() {
    const [courses, setCourses] = useState([]);
    const [form, setForm] = useState({
        courseId: "",
        title: "",
        description: "",
        dueDate: "",
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getCourses()
            .then(setCourses)
            .catch(() => setCourses([]));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addAssignment(form);
            setMessage("Ödev başarıyla eklendi!");
            setTimeout(() => navigate("/assignments"), 1500);
        } catch (err) {
            setMessage("Hata: " + err.message);
        }
    };

    return (
        <div
            className="d-flex align-items-center justify-content-center vh-100"
            style={{
                background: "linear-gradient(135deg, #20c997, #198754)",
            }}
        >
            <div
                className="card shadow-lg p-5"
                style={{
                    width: "500px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.95)",
                    color: "#333",
                }}
            >
                <h3 className="text-center mb-4 fw-bold text-success">
                     Yeni Ödev Ekle
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Ders Seç</label>
                        <select
                            name="courseId"
                            className="form-select"
                            value={form.courseId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Bir ders seçin...</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Başlık</label>
                        <input
                            type="text"
                            name="title"
                            className="form-control"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Açıklama</label>
                        <textarea
                            name="description"
                            className="form-control"
                            rows="3"
                            value={form.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Teslim Tarihi</label>
                        <input
                            type="date"
                            name="dueDate"
                            className="form-control"
                            value={form.dueDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-success w-100 py-2 fw-semibold"
                        style={{ borderRadius: "12px" }}
                    >
                        Kaydet
                    </button>
                </form>

                {message && (
                    <div className="mt-3 text-center fw-semibold text-dark">{message}</div>
                )}
            </div>
        </div>
    );
}
