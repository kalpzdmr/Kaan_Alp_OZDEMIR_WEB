import React, { useState } from "react";
import { register } from "../api";
import { useNavigate } from "react-router-dom";
import "../App.css"; // tasarım için

export default function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("öğrenci");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register(fullName, email, password, role);
            alert(" Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
            navigate("/login");
        } catch (err) {
            console.error(" Kayıt Hatası:", err);
            setError(err.message || "Kayıt işlemi başarısız! Bilgileri kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-wrapper">
                <div className="login-card modern-glass text-center">

                    {/* 🔹 EDULINK Logo & Başlık */}
                    <div className="brand-section mb-3">
                        <img
                            src="/images/edunex-link.jpg"
                            alt="EDULINK Logo"
                            className="brand-logo mb-2"
                        />
                        <h1 className="brand-title">EDULINK</h1>
                        <p className="brand-subtitle">Eğitimi Dijitalleştir, Geleceği Birleştir! </p>
                    </div>

                    <h3 className="login-title mb-4">Kayıt Ol</h3>

                    {error && (
                        <div className="alert alert-danger text-center fw-semibold py-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister}>
                        <input
                            type="text"
                            className="form-control modern-input mb-3"
                            placeholder="Ad Soyad"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />

                        <input
                            type="email"
                            className="form-control modern-input mb-3"
                            placeholder="E-posta"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            className="form-control modern-input mb-3"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <select
                            className="form-select modern-input mb-4"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="öğrenci">Öğrenci</option>
                            <option value="öğretmen">Öğretmen</option>
                            <option value="veli">Veli</option>
                        </select>

                        <button
                            className="btn modern-btn w-100"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                        </button>
                    </form>

                    <p className="mt-3 small-text">
                        Zaten hesabın var mı?{" "}
                        <a href="/login" className="modern-link">
                            Giriş Yap
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
