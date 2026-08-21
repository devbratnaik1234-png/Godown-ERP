import { useState } from "react";
import { LockKeyhole, Mail, Warehouse } from "lucide-react";
import { api } from "../../api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Enter your admin email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const user = await api.login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-12 h-12 rounded-xl bg-green-700 text-white flex items-center justify-center">
            <Warehouse size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Godown ERP</h1>
            <p className="text-sm text-slate-500">Secure administrator login</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Admin Email
            </label>
            <div className="flex items-center gap-2 border border-slate-300 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-500">
              <Mail size={19} className="text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                className="w-full py-3 outline-none"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Password
            </label>
            <div className="flex items-center gap-2 border border-slate-300 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-500">
              <LockKeyhole size={19} className="text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="w-full py-3 outline-none"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-6 text-center">
          Login credentials are configured only in the server environment file.
        </p>
      </div>
    </div>
  );
}

export default Login;
