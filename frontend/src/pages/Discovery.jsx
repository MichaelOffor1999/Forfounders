import { useState, useEffect } from "react";
import apiRequest from "../api";
import NavBar from "../components/NavBar";


export function Discovery () {
    const [profile, setProfile] = useState(null);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    async function loadNext() {
        setErr("");
        setLoading(true);
        try{
            const data = await apiRequest("/discovery");
            const p = data?.user ?? null;
            setProfile(p || null);
        }catch (e) {
            setErr(e.message);
            setProfile(null);
        }finally{
            setLoading(false);
        }

    }

    async function act(action) {
        if(!profile) return;
        const {id} = profile;
        setLoading(true);
        setErr("");
        setMsg("");

        try{
            const data = await apiRequest(`/${action}/${id}`, {method: "POST"});
            setMsg(data.msg);
            await loadNext();
        }catch (e) {
            setErr(e.message);
        }finally{
            setLoading(false);
        }
        
    }

    useEffect(() => {
        loadNext();
    }, []);

    if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
    if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;
    if (!profile) return <div style={{ padding: 16 }}>No more profiles to discover.</div>;

    return (
        <>
            <NavBar />
            <div style={{ padding: 16, maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
                <div style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", borderRadius: 12, overflow: "hidden" }}>
                    <img
                        src={profile.profile_picture || "https://via.placeholder.com/480"}
                        alt={profile.name}
                        style={{ width: "100%", height: 300, objectFit: "cover" }}
                    />
                    <div style={{ padding: 16 }}>
                        <h2 style={{ margin: "12px 0" }}>{profile.name}</h2>
                        <p style={{ color: "#555", fontStyle: "italic" }}>{profile.headline || "No headline provided"}</p>
                        <p style={{ color: "#555" }}>{profile.course} • {profile.campus} • {profile.location || "Location not specified"}</p>

                        {profile.about && (
                            <div style={{ margin: "12px 0" }}>
                                <h4>About Me:</h4>
                                <p style={{ color: "#555" }}>{profile.about}</p>
                            </div>
                        )}

                        {Array.isArray(profile.hobbies) && profile.hobbies.length > 0 && (
                            <div style={{ margin: "12px 0" }}>
                                <h4>Hobbies:</h4>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {profile.hobbies.map((hobby) => (
                                        <span
                                            key={hobby}
                                            style={{
                                                border: "1px solid #ddd",
                                                borderRadius: 12,
                                                padding: "4px 12px",
                                                backgroundColor: "#f9f9f9",
                                            }}
                                        >
                                            {hobby}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Achievements/Highlights Section */}
                        <div style={{ marginTop: 16, textAlign: "left" }}>
                            <h3>Achievements & Highlights</h3>
                            <ul style={{ paddingLeft: 20 }}>
                                <li>Dean's List 2024</li>
                                <li>Hackathon Winner</li>
                                <li>Published Research Paper</li>
                            </ul>
                        </div>

                        {/* Skills Section */}
                        <div style={{ marginTop: 16, textAlign: "left" }}>
                            <h3>Skills</h3>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ border: "1px solid #ddd", borderRadius: 12, padding: "4px 12px", backgroundColor: "#f1f1f1" }}>Python</span>
                                <span style={{ border: "1px solid #ddd", borderRadius: 12, padding: "4px 12px", backgroundColor: "#f1f1f1" }}>Machine Learning</span>
                                <span style={{ border: "1px solid #ddd", borderRadius: 12, padding: "4px 12px", backgroundColor: "#f1f1f1" }}>Public Speaking</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 16, marginTop: 24, justifyContent: "center" }}>
                    {msg && <div style={{ marginTop: 8, color: "green" }}>{msg}</div>}
                    <button
                        onClick={() => act("waved")}
                        style={{ padding: "8px 16px", borderRadius: 8, border: "none", backgroundColor: "#007bff", color: "white" }}
                    >
                        Wave
                    </button>
                    <button
                        onClick={() => act("skip")}
                        style={{ padding: "8px 16px", borderRadius: 8, border: "none", backgroundColor: "#dc3545", color: "white" }}
                    >
                        Skip
                    </button>
                </div>
            </div>
        </>
    );



}