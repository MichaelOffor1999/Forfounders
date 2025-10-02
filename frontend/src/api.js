const apiBase = "/api";

async function apiRequest(endpoint, options = {}){
    const token = localStorage.getItem("token");
    const res = await fetch(`${apiBase}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...(options.headers || {})
        },
        ...options
    });

    if(res.status == 401) {
        localStorage.removeItem("token");
        window.location.replace("/login");
        throw new Error("Unauthorized");
    }

    let data;
    try {
        data = await res.json();
    } catch (err) {
        data = {};
    }

    if(!res.ok){
        const error = new Error(data.msg || data.error || res.statusText);
        error.status = res.status;
        error.msg = data.msg;
        throw error;
    }

    return data;
}

export default apiRequest;