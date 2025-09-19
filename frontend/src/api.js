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

    if(!res.ok){
        throw new Error(data.error || data.msg || res.statusText);
    }

    try{
        data = await res.json();
    }catch(err){
        data = {}
    }

    

    return data;
}

export default apiRequest;