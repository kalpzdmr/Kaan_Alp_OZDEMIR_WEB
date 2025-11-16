import React, { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await login({ email, password });
            console.log("Backend Login Response:", data);

            // --------------------------
            // 🔹 Kullanıcı ID çözme
            // --------------------------
            let userId = data.id || data.user?.id;

            if (!userId && data.token) {
                try {
                    const payload = JSON.parse(atob(data.token.split(".")[1]));
                    userId =
                        payload?.id ||
                        payload?.userId ||
                        payload?.nameid ||
                        payload?.sub ||
                        payload?.unique_name;
                } catch (err) {
                    console.warn("Token çözme hatası:", err);
                }
            }

            if (!userId || isNaN(Number(userId))) userId = 0;

            // --------------------------
            // 🔹 Kullanıcı rolü
            // --------------------------
            const userRole = data.role?.toLowerCase() || "öğrenci";

            // --------------------------
            // 🔹 Kullanıcı adını garantiyle alma
            // --------------------------
            let fullName =
                data.fullName ||
                data.name ||
                data.user?.fullName ||
                data.user?.name ||
                "";

            // Token içinden isim alma
            if ((!fullName || fullName.trim() === "") && data.token) {
                try {
                    const payload = JSON.parse(atob(data.token.split(".")[1]));
                    fullName =
                        payload.fullName ||
                        payload.name ||
                        payload.unique_name ||
                        payload.sub ||
                        fullName;
                } catch (err) {
                    console.warn("Token'dan isim çekilemedi");
                }
            }

            // Son çare: isim YOKSA, role göster
            if (!fullName || fullName.trim() === "") {
                fullName = userRole.toUpperCase();
            }

            // --------------------------
            // 🔹 LocalStorage kayıtları
            // --------------------------
            localStorage.setItem("token", data.token || "");
            localStorage.setItem("role", userRole);
            localStorage.setItem("userId", userId.toString());
            localStorage.setItem("fullName", fullName);

            // Kullanıcı objesi düzenlenmiş halde kaydedilir
            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...data,
                    fullName: fullName,
                    id: userId,
                    role: userRole,
                })
            );

            // --------------------------
            // 🔹 Hoş geldin mesajı
            // --------------------------
            alert(`Hoş geldin ${fullName}!`);

            // --------------------------
            // 🔹 Rol bazlı yönlendirme
            // --------------------------
            switch (userRole) {
                case "öğretmen":
                    navigate("/teacher-dashboard");
                    break;
                case "veli":
                    navigate("/parent-dashboard");
                    break;
                default:
                    navigate("/dashboard");
                    break;
            }
        } catch (err) {
            console.error("Login hatası:", err);
            setError(err.message || "Giriş başarısız! Bilgilerinizi kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-wrapper">
                <div className="login-card modern-glass text-center">

                    {/* Logo ve Başlık */}
                    <div className="brand-section mb-3">
                        <img
                            src="/images/edunex-link.jpg"
                            alt="EDULINK Logo"
                            className="brand-logo mb-2"
                        />
                        <h1 className="brand-title">EDULINK</h1>
                        <p className="brand-subtitle">Eğitimi Dijitalleştir, Geleceği Birleştir!</p>
                    </div>

                    <h3 className="login-title mb-4">Giriş Yap</h3>

                    {error && (
                        <div className="alert alert-danger text-center fw-semibold py-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            className="form-control modern-input mb-3"
                            placeholder="E-posta adresiniz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            className="form-control modern-input mb-4"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button className="btn modern-btn w-100" type="submit" disabled={loading}>
                            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </button>
                    </form>

                    <p className="mt-3 small-text">
                        Hesabın yok mu?{" "}
                        <a href="/register" className="modern-link">
                            Kayıt Ol
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
