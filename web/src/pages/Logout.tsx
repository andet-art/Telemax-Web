import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await fetch("/api/logout.php", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        localStorage.removeItem("user"); // ✅ Remove local session
        navigate("/signin"); // ✅ Redirect to sign-in
      } catch (error) {
        console.error("Logout failed", error);
        navigate("/signin");
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <main className="min-h-screen bg-[#14110f] text-white flex items-center justify-center">
      <p className="text-lg text-stone-300">Logging out...</p>
    </main>
  );
};

export default Logout;
