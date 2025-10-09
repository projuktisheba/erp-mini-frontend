// main.tsx
import { StrictMode, useState, useEffect, useContext } from "react";
import { createRoot } from "react-dom/client";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { UserProvider } from "./components/UserContext/UserContext.tsx";
import toast, { Toaster } from "react-hot-toast";
import AppContextProvider, { AppContext } from "./context/AppContext.tsx";
import { API_URL } from "./hooks/AxiosInstance/AxiosInstance.tsx";


const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const { setUserRole, setBranchId } = useContext(AppContext)!;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!data.token) {
        toast.error(data.message || "Invalid credentials");
        return;
      }

      // Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.employee.email);
      localStorage.setItem("userData", JSON.stringify(data.employee));

      // Update AppContext with branchId immediately
      if (data.employee.branch_id || data.employee.branchID) {
        setBranchId(data.employee.branch_id || data.employee.branchID);
      }
      // Update AppContext with user role immediately
      if (data.employee.role) {
        setUserRole(data.employee.role);
      }

      // Proceed to app
      onLogin();
    } catch (err) {
      console.error(err);
      toast.error("Login failed!");
    } finally {
      setLoading(false);
    }
  };

return (
<div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
  <form
    onSubmit={handleSubmit}
    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-xs transition-all duration-300"
  >
   
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome Back
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
        Sign in to continue.
      </p>
    </div>

    {/* Username Input */}
    <div className="mb-4">
      <label htmlFor="username" className="block mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
        Username
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <User className="w-4 h-4 text-gray-400" />
        </div>
        <input
          id="username"
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full py-2 px-3 pl-9 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
        />
      </div>
    </div>

    {/* Password Input */}
    <div className="mb-3">
      <label htmlFor="password" className="block mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
        Password
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full py-2 px-3 pl-9 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 dark:text-gray-300"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </span>
      </div>
    </div>
    
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 text-white font-semibold py-1.5 mt-1 rounded-md hover:bg-blue-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Logging in..." : "Login"}
    </button>
  </form>
</div>
);


};

const Root = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setIsAuthenticated(true);
  }, []);

  return (
    <ThemeProvider>
      <AppWrapper>
        <UserProvider>
          <AppContextProvider>
            {isAuthenticated ? (
              <App />
            ) : (
              <LoginPage onLogin={() => setIsAuthenticated(true)} />
            )}
          </AppContextProvider>
        </UserProvider>
      </AppWrapper>
      <Toaster />
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
