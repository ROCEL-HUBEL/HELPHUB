const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // from Google Cloud Console
const API_BASE_URL = "http://localhost:5000/auth"; // backend base URL

// Common Google Sign-In handler
function initializeGoogleSignIn(type, callback) {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (response) => {
      const credential = response.credential;
      const decoded = parseJwt(credential); // decode JWT to extract profile info

      const endpoint =
        type === "customer"
          ? `${API_BASE_URL}/google/customer`
          : `${API_BASE_URL}/google/provider`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          google_id: decoded.sub,
          full_name: decoded.name,
          email: decoded.email,
          profile_picture: decoded.picture,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        window.location.href = "/";
      } else {
        alert(data.message || "Something went wrong");
      }
    },
  });

  google.accounts.id.renderButton(
    document.getElementById("googleLoginBtn") || document.getElementById("googleSignupBtn"),
    { theme: "outline", size: "large", text: "continue_with" }
  );
  google.accounts.id.prompt();
}

// Decode JWT token
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

// Exported functions
export function handleGoogleSignup(type) {
  initializeGoogleSignIn(type, "signup");
}

export function handleGoogleLogin(type) {
  initializeGoogleSignIn(type, "login");
}
