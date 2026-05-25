import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
export default function ThankstoRegister() {
  const navigate = useNavigate();
  const location = useLocation();

  // get username passed from register page
  const username = location.state?.username;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/categories`);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Welcome to the world of endless realities!
        </h1>
      </div>
    </div>
  );
}