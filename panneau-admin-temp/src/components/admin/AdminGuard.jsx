import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { setAdminToken } from "@/lib/adminApiClient";

export default function AdminGuard({ children }) {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (user && user.role === "admin") {
      setChecked(true);
    } else {
      navigate("/admin");
    }
  }, [user, isLoadingAuth, navigate]);

  if (isLoadingAuth || !checked) return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
      <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return children;
}