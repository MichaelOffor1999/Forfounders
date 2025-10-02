import { useState, useEffect } from "react";
import apiRequest from "../api";
import NavBar from "../components/NavBar";

export default function WaveRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");

    async function loadRequests() {
        setLoading(true);
        setErr("");
        try {
            const data = await apiRequest("/wave_requests");
            setRequests(data.requests || []);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function acceptWave(id) {
        setMsg("");
        setErr("");
        try {
            const data = await apiRequest(`/accept_wave/${id}`, { method: "POST" });
            setMsg(data.msg);
            await loadRequests();
        } catch (e) {
            setErr(e.message);
        }
    }

    useEffect(() => {
        loadRequests();
    }, []);

    return (
        <>
            <NavBar />
            <div style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
                <h2 style={{ textAlign: "center", marginBottom: 24 }}>Wave Requests</h2>
                {loading && <div>Loading…</div>}
                {err && <div style={{ color: "crimson" }}>{err}</div>}
                {msg && <div style={{ color: "green" }}>{msg}</div>}
                {requests.length === 0 && !loading && <div>No wave requests.</div>}
                {requests.map((user) => (
                    <div key={user._id} style={{ display: "flex", alignItems: "center", boxShadow: "0 2px 8px #e0e0e0", borderRadius: 12, margin: "16px 0", padding: 16, background: "#fff" }}>
                        <img
                            src={
                                user.profile_picture
                                    ? user.profile_picture
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=007bff&color=fff&size=80`
                            }
                            alt={user.name}
                            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", marginRight: 16, border: "2px solid #007bff" }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "bold", fontSize: 18 }}>{user.name}</div>
                            <div style={{ color: "#555", fontStyle: "italic", marginBottom: 4 }}>{user.specialization || "No specialization"}</div>
                        </div>
                        <button
                            onClick={() => acceptWave(user._id)}
                            style={{ padding: "8px 16px", borderRadius: 8, background: "#007bff", color: "white", border: "none", fontWeight: "bold", marginLeft: 8 }}
                        >
                            Accept
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
