import React, { useEffect, useState } from "react";
import { addAssignment, getCourses } from "../api";

export default function AssignmentNew() {
    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        (async () => {
            const list = await getCourses();
            setCourses(list || []);
            if (list?.length) setCourseId(list[0].id);
        })();
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await addAssignment({ courseId: Number(courseId), description, dueDate });
            setMsg("Ödev eklendi ");
            setDescription(""); setDueDate("");
        } catch (err) {
            setMsg(err.message);
        }
    };

    return (
        <div className="container py-4">
            <h4 className="mb-3">Yeni Ödev</h4>
            <form className="card p-3 shadow-sm" onSubmit={submit} style={{ maxWidth: 520 }}>
                <label className="form-label">Ders</label>
                <select className="form-select mb-2" value={courseId} onChange={e => setCourseId(e.target.value)}>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <label className="form-label mt-2">Açıklama</label>
                <textarea className="form-control" rows={3}
                    value={description} onChange={e => setDescription(e.target.value)} />

                <label className="form-label mt-2">Son Tarih</label>
                <input type="date" className="form-control mb-3"
                    value={dueDate} onChange={e => setDueDate(e.target.value)} />

                <button className="btn btn-primary">Kaydet</button>
                {msg && <div className="mt-2">{msg}</div>}
            </form>
        </div>
    );
}
