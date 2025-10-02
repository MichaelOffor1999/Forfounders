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
            if(profile){
                console.log("True")
            }else{
                console.log("Empty buddy")
            }
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
        if(id){
            console.log("We have one!")
        }else{
            console.log("Theres no id")
        }
        setLoading(true);
        setErr("");
        setMsg("");

        

        try{
            const data = await apiRequest(`/${action}/${id}`, {method: "POST"});
            setMsg(data.msg);
            console.log(data.msg);
            await loadNext();
        }catch (e) {
            setErr(e.message);
            console.log(e.msg);
        }finally{
            setLoading(false);
        }
        
    }

    useEffect(() => {
        loadNext();
    }, []);

    if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
    if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;
    if (!profile) {
        return (
            <>
                <NavBar />
                <div style={{ padding: 16 }}>No more profiles to discover.</div>
            </>
        );
    }

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
                        <p style={{ color: "#555", fontStyle: "italic" }}>{profile.specialization || "No specialization provided"}</p>
                        <p style={{ color: "#555" }}>{profile.course} • {profile.campus} • {profile.location || "Location not specified"}</p>

                        {/* Looking For Section */}
                        {Array.isArray(profile.lookingFor) && profile.lookingFor.length > 0 && (
                            <div style={{ margin: "12px 0" }}>
                                <h4>Looking For:</h4>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {profile.lookingFor.map((item) => (
                                        <span
                                            key={item}
                                            style={{
                                                border: "1px solid #007bff",
                                                borderRadius: 12,
                                                padding: "4px 12px",
                                                backgroundColor: "#eaf4ff",
                                            }}
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags Section */}
                        {Array.isArray(profile.tags) && profile.tags.length > 0 && (
                            <div style={{ margin: "12px 0" }}>
                                <h4>Tags:</h4>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {profile.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            style={{
                                                border: "1px solid #28a745",
                                                borderRadius: 12,
                                                padding: "4px 12px",
                                                backgroundColor: "#eafbe7",
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
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