import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAccount, registerAccount, saveSession } from "../../services/authAPI";

const initialForm = { name: "", email: "", password: "", confirmPassword: "", image: null };

export default function AuthPage({ role, mode }) {
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const isSignup = mode === "signup";
  const otherPath = `/${role}/${isSignup ? "signin" : "signup"}`;

  useEffect(() => {
    setForm(initialForm);
    setPreview("");
    setError("");
  }, [role, mode]);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateImage = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((current) => ({ ...current, image: file }));
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (isSignup && form.password !== form.confirmPassword) return setError("Passwords do not match.");

    try {
      setLoading(true);
      if (isSignup) {
        const payload = new FormData();
        payload.append("name", form.name);
        payload.append("email", form.email);
        payload.append("password", form.password);
        payload.append("confirmPassword", form.confirmPassword);
        payload.append("role", role);
        if (form.image) payload.append("image", form.image);
        await registerAccount(payload);
        navigate(`/${role}/signin`, { replace: true, state: { message: "Account created. Please sign in." } });
      } else {
        const data = await loginAccount({ email: form.email, password: form.password, role });
        saveSession(data);
        navigate(isAdmin ? "/admin/dashboard" : "/", { replace: true });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-230 overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-neutral-900 md:grid-cols-[.8fr_1.2fr]">
      <div className={`${isAdmin ? "bg-neutral-900" : "bg-[#2874f0]"} flex flex-col justify-between p-8 text-white md:p-12`}>
        <div>
          <p className="mb-4 text-sm font-bold tracking-[.16em] uppercase">{isAdmin ? "Admin Portal" : "Flipkart Account"}</p>
          <h1 className="text-4xl leading-tight font-extrabold">{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-4 text-white/75">{isAdmin ? "Manage products, customers and orders securely." : "Access your orders, wishlist and personalised offers."}</p>
        </div>
        <span className="mt-12 text-sm text-white/60">Secure account access</span>
      </div>

      <form className="space-y-4 p-8 md:p-12" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold">{isAdmin ? "Admin" : "User"} {isSignup ? "Sign up" : "Sign in"}</h2>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {isSignup && (
          <>
            <label className="block text-sm font-semibold">Full name<input required name="name" value={form.name} onChange={updateField} className="mt-2 w-full rounded-lg border border-neutral-300 bg-transparent px-4 py-3 outline-none focus:border-[#2874f0] dark:border-neutral-700" type="text" placeholder="Enter your name" /></label>
            <label className="block text-sm font-semibold">Profile image
              <span className="mt-2 flex items-center gap-4 rounded-lg border border-dashed border-neutral-300 p-3 dark:border-neutral-700">
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-xs text-neutral-400 dark:bg-neutral-800">{preview ? <img src={preview} alt="Profile preview" className="size-full object-cover" /> : "Photo"}</span>
                <span className="min-w-0 flex-1"><input required name="image" onChange={updateImage} accept="image/jpeg,image/png,image/webp" className="block w-full cursor-pointer text-xs file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-bold file:text-[#2874f0]" type="file" /><small className="mt-1 block text-neutral-400">JPG, PNG or WebP · Max 5 MB</small></span>
              </span>
            </label>
          </>
        )}

        <label className="block text-sm font-semibold">Email address<input required name="email" value={form.email} onChange={updateField} className="mt-2 w-full rounded-lg border border-neutral-300 bg-transparent px-4 py-3 outline-none focus:border-[#2874f0] dark:border-neutral-700" type="email" placeholder="name@example.com" /></label>
        <label className="block text-sm font-semibold">Password<input required minLength="6" name="password" value={form.password} onChange={updateField} className="mt-2 w-full rounded-lg border border-neutral-300 bg-transparent px-4 py-3 outline-none focus:border-[#2874f0] dark:border-neutral-700" type="password" placeholder="Minimum 6 characters" /></label>
        {isSignup && <label className="block text-sm font-semibold">Confirm password<input required minLength="6" name="confirmPassword" value={form.confirmPassword} onChange={updateField} className="mt-2 w-full rounded-lg border border-neutral-300 bg-transparent px-4 py-3 outline-none focus:border-[#2874f0] dark:border-neutral-700" type="password" placeholder="Confirm password" /></label>}

        <button disabled={loading} className={`w-full rounded-lg px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${isAdmin ? "bg-neutral-900 dark:bg-white dark:text-neutral-900" : "bg-[#2874f0]"}`} type="submit">{loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}</button>
        <p className="text-center text-sm text-neutral-500">{isSignup ? "Already have an account?" : "New here?"} <Link className="font-bold text-[#2874f0]" to={otherPath}>{isSignup ? "Sign in" : "Create account"}</Link></p>
      </form>
    </section>
  );
}
