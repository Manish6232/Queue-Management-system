import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const userStr = params.get("user");
    if (token && userStr) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", decodeURIComponent(userStr));
      const user = JSON.parse(decodeURIComponent(userStr));
      navigate(user.role === "admin" ? "/admin" : "/");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: "var(--text-secondary)" }}>Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;