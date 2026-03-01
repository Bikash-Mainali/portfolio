export async function authenticateUser(email, password) {
    let isAuthenticated = false;
    const ACCESS_TOKEN = "access_token";
    const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = baseUrl + "/auth/v1/token?grant_type=password"
    if (localStorage.getItem(ACCESS_TOKEN)) {
        return true;
    }
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": apiKey
        },
        body: JSON.stringify({
            email,
            password
        })
    }

    const response = await fetch(url, options);
    if (response.ok) {
        const data = await response.json();
        localStorage.setItem(ACCESS_TOKEN, data.access_token);
        isAuthenticated = true;
    } else {
        isAuthenticated = false;
    }

    return isAuthenticated;
}