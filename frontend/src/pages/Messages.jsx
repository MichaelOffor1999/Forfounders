import { useState, useEffect } from "react";
import apiRequest from "../api";
import NavBar from "../components/NavBar";

export default function Messages() {
    const [connected, setConnected] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [text, setText] = useState("");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        async function loadConnected() {
            setErr("");
            setLoading(true);
            try {
                const data = await apiRequest("/me");
                const ids = data.user.connected_users || [];
                setConnected(ids);
                if (ids.length > 0) {
                    const profData = await apiRequest("/profiles", {
                        method: "POST",
                        body: JSON.stringify({ ids })
                    });
                    setProfiles(profData.profiles || []);
                } else {
                    setProfiles([]);
                }
            } catch (e) {
                setErr(e.message);
            } finally {
                setLoading(false);
            }
        }
        loadConnected();
    }, []);

    async function loadMessages(userId) {
        setSelected(userId);
        setLoading(true);
        setErr("");
        try {
            const data = await apiRequest(`/messages/${userId}`);
            setMessages(data.messages || []);
        } catch (e) {
            setErr(e.message);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }

    async function sendMessage() {
        if (!text.trim() || !selected) return;
        setLoading(true);
        setErr("");
        setMsg("");
        try {
            const data = await apiRequest(`/messages/send`, {
                method: "POST",
                body: JSON.stringify({ to: selected, text })
            });
            setMsg(data.msg);
            setText("");
            await loadMessages(selected);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <NavBar />
            <div style={{ display: "flex", maxWidth: 800, margin: "0 auto", padding: 16 }}>
                <div style={{ width: 240, borderRight: "1px solid #eee", paddingRight: 16 }}>
                    <h3>Chats</h3>
                    {profiles.length === 0 && <div>No connections yet.</div>}
                    {profiles.map((user) => (
                        <div key={user.id} style={{ margin: "12px 0", display: "flex", alignItems: "center" }}>
                            <img
                                src={user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=007bff&color=fff&size=64`}
                                alt={user.name}
                                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", marginRight: 10, border: "2px solid #007bff" }}
                            />
                            <button onClick={() => loadMessages(user.id)} style={{ background: selected === user.id ? "#007bff" : "#f5f5f5", color: selected === user.id ? "white" : "#333", border: "none", borderRadius: 6, padding: "8px 12px", width: "100%", textAlign: "left", fontWeight: "bold" }}>
                                {user.name || user.id}
                            </button>
                        </div>
                    ))}
                </div>
                <div style={{ flex: 1, paddingLeft: 24 }}>
                    <h3>Messages</h3>
                    {loading && <div>Loading…</div>}
                    {err && <div style={{ color: "crimson" }}>{err}</div>}
                    {msg && <div style={{ color: "green" }}>{msg}</div>}
                    {selected && (
                        <>
                            <div style={{ minHeight: 240, marginBottom: 16 }}>
                                {messages.length === 0 && <div>No messages yet.</div>}
                                {messages.map((m) => (
                                    <div key={m._id} style={{ margin: "8px 0", textAlign: m.from === selected ? "left" : "right" }}>
                                        <span style={{ background: m.from === selected ? "#eaf4ff" : "#d1ffd6", padding: "6px 12px", borderRadius: 8, display: "inline-block" }}>{m.text}</span>
                                        <div style={{ fontSize: 10, color: "#888" }}>{new Date(m.timestamp).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder="Type a message..."
                                    style={{ flex: 1, padding: "8px", borderRadius: 6, border: "1px solid #ccc" }}
                                />
                                <button onClick={sendMessage} style={{ padding: "8px 16px", borderRadius: 6, background: "#007bff", color: "white", border: "none" }}>Send</button>
                            </div>
                        </>
                    )}
                    {!selected && <div>Select a chat to start messaging.</div>}
                </div>
            </div>
        </>
    );
}
