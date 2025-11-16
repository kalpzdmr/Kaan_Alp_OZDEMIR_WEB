const API_BASE = "https://localhost:7299/api";

/* ----------------------------------------------------
   🌟 Ortak Token'lı Fetch Fonksiyonu
---------------------------------------------------- */
async function authFetch(path, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
        const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
            ? await res.json()
            : await res.text();

        if (!res.ok) {
            const message =
                typeof data === "string"
                    ? data
                    : data?.message || "Sunucu isteği başarısız!";
            throw new Error(message);
        }

        return data;
    } catch (err) {
        console.error("İstek hatası:", err);
        throw new Error("Sunucuya bağlanılamadı! (Backend çalışıyor mu?)");
    }
}

/* ----------------------------------------------------
   🌟 AUTH
---------------------------------------------------- */
export async function register(fullName, email, password, role) {
    try {
        const res = await fetch(`${API_BASE}/Auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, email, password, role }),
        });

        const text = await res.text();

        if (!res.ok) throw new Error(text || "Kayıt başarısız!");
        return text;
    } catch (err) {
        console.error("Register hatası:", err);
        throw new Error("Sunucuya bağlanılamadı!");
    }
}

export async function login({ email, password }) {
    try {
        const res = await fetch(`${API_BASE}/Auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
            ? await res.json()
            : await res.text();

        if (!res.ok) throw new Error(data?.message || "Giriş başarısız!");

        // 🔥 Başarılı giriş
        if (data.token) localStorage.setItem("token", data.token);
        if (data.role) localStorage.setItem("role", data.role);
        if (data.id) localStorage.setItem("userId", data.id);
        if (data.fullName)
            localStorage.setItem("user", JSON.stringify({ fullName: data.fullName }));

        return data;
    } catch (err) {
        console.error("Login hatası:", err);
        throw new Error("Sunucuya bağlanılamadı!");
    }
}

/* ----------------------------------------------------
   🌟 ASSIGNMENTS
---------------------------------------------------- */
export const getAssignments = () =>
    authFetch(`/Assignment`, { method: "GET" });

/* ✔ AssignmentCreateDto ile birebir uyumlu payload */
export const addAssignment = (assignment) => {
    const payload = {
        title: assignment.title,
        description: assignment.description || "Açıklama yok",
        dueDate: assignment.dueDate,
        // 🔥 courseName artık TeacherDashboard’tan gelen courseName’i kullanıyor
        courseName:
            assignment.courseName ??
            (typeof assignment.course === "string"
                ? assignment.course
                : assignment.course?.name),
    };

    console.log("Gönderilen payload:", payload);

    return authFetch(`/Assignment`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const deleteAssignment = (id) =>
    authFetch(`/Assignment/${id}`, { method: "DELETE" });

/* ----------------------------------------------------
   🌟 COURSES
---------------------------------------------------- */
export const getCourses = () =>
    authFetch(`/Course`, { method: "GET" });

/* ----------------------------------------------------
   🌟 SUBMISSIONS
---------------------------------------------------- */
export async function addSubmission(submission) {
    const token = localStorage.getItem("token");
    const userId = parseInt(localStorage.getItem("userId"));

    const dtoBody = {
        userId,
        assignmentId: parseInt(submission.assignmentId),
        fileUrl: submission.fileUrl || "Teslim edildi",
        submittedAt: new Date().toISOString(),
    };

    console.log("Submission DTO:", dtoBody);

    try {
        const res = await fetch(`${API_BASE}/Submission/simple`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(dtoBody),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.message || "Teslim başarısız!");

        return data;
    } catch (err) {
        console.error("Submission hatası:", err);
        throw new Error("Sunucuya bağlanılamadı!");
    }
}

export const getMySubmissions = () =>
    authFetch(`/Submission/mine/${localStorage.getItem("userId")}`, {
        method: "GET",
    });

export const getAllSubmissions = () =>
    authFetch(`/Submission`, { method: "GET" });

export const gradeSubmission = (id, grade, feedback = "") =>
    authFetch(`/Submission/${id}/grade`, {
        method: "PUT",
        body: JSON.stringify({ grade, feedback }),
    });

/* ----------------------------------------------------
   🌟 PARENT (Veli)
---------------------------------------------------- */
export const getStudentsByParent = (parentId) =>
    authFetch(`/Parent/students/${parentId}`, { method: "GET" });

export const getSubmissionsByParent = (parentId) =>
    authFetch(`/Parent/submissions/${parentId}`, { method: "GET" });

export const getActiveAssignmentsForStudent = (studentId) =>
    authFetch(`/Parent/active-assignments/${studentId}`, { method: "GET" });
