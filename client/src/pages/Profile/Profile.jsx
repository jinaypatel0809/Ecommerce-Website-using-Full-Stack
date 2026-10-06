import { useEffect, useState } from "react";
import { getAssetUrl, getSession, updateProfile, updateSessionUser } from "../../services/authAPI";

export default function Profile() {
  const [user, setUser] = useState(() => getSession()?.user);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!preview.startsWith("blob:")) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const updateImage = (event) => {
    const selectedImage = event.target.files?.[0] || null;
    setImage(selectedImage);
    setPreview(selectedImage ? URL.createObjectURL(selectedImage) : "");
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("New password fields do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      if (image) payload.append("image", image);
      if (form.currentPassword || form.newPassword || form.confirmPassword) {
        payload.append("currentPassword", form.currentPassword);
        payload.append("newPassword", form.newPassword);
        payload.append("confirmPassword", form.confirmPassword);
      }
      const data = await updateProfile(payload);
      updateSessionUser(data.user);
      setUser(data.user);
      setForm((current) => ({
        ...current,
        name: data.user.name,
        email: data.user.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setImage(null);
      setPreview("");
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="rounded-xl bg-red-50 p-4 text-red-700">Please sign in again to edit your profile.</p>;

  const profileImage = preview || getAssetUrl(user.image);
  const fieldClass = "mt-2 w-full rounded-lg border border-neutral-300 bg-transparent px-4 py-3 outline-none transition focus:border-[#2874f0] dark:border-neutral-700";

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-7">
        <p className="text-xs font-bold tracking-[.16em] text-[#2874f0] uppercase">Account settings</p>
        <h1 className="mt-2 text-3xl font-extrabold">My Profile</h1>
        <p className="mt-2 text-neutral-500">Update your personal information, profile photo or password.</p>
      </div>

      {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}

      <form onSubmit={submitProfile} className="space-y-7 rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900 sm:p-9">
        <div className="flex flex-col items-center gap-5 border-b border-neutral-100 pb-7 dark:border-neutral-800 sm:flex-row">
          <img src={profileImage} alt={`${user.name} profile`} className="size-28 rounded-full border-4 border-blue-50 bg-neutral-100 object-cover dark:border-neutral-800" />
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold">{user.name}</h2>
            <p className="text-sm text-neutral-500">{user.email}</p>
            <label className="mt-4 inline-flex cursor-pointer rounded-lg border border-[#2874f0] px-4 py-2 text-sm font-bold text-[#2874f0] transition hover:bg-blue-50 dark:hover:bg-neutral-800">
              Change profile photo
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={updateImage} className="sr-only" />
            </label>
            <p className="mt-2 text-xs text-neutral-400">JPG, PNG or WebP · Max 5 MB</p>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-extrabold">Personal information</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">Full name<input required name="name" minLength="2" maxLength="80" value={form.name} onChange={updateField} autoComplete="name" className={fieldClass} /></label>
            <label className="text-sm font-semibold">Email address<input required name="email" type="email" maxLength="254" value={form.email} onChange={updateField} autoComplete="email" className={fieldClass} /></label>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-7 dark:border-neutral-800">
          <h2 className="text-lg font-extrabold">Change password <span className="text-sm font-normal text-neutral-500">(optional)</span></h2>
          <p className="mt-1 text-sm text-neutral-500">Leave these fields blank if you do not want to change your password.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <label className="text-sm font-semibold">Current password<input name="currentPassword" type="password" autoComplete="current-password" value={form.currentPassword} onChange={updateField} className={fieldClass} /></label>
            <label className="text-sm font-semibold">New password<input name="newPassword" type="password" minLength="6" autoComplete="new-password" value={form.newPassword} onChange={updateField} className={fieldClass} /></label>
            <label className="text-sm font-semibold">Confirm new password<input name="confirmPassword" type="password" minLength="6" autoComplete="new-password" value={form.confirmPassword} onChange={updateField} className={fieldClass} /></label>
          </div>
        </div>

        <div className="flex justify-end border-t border-neutral-100 pt-6 dark:border-neutral-800">
          <button type="submit" disabled={loading} className="rounded-lg bg-[#2874f0] px-7 py-3 font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Saving changes..." : "Save profile changes"}</button>
        </div>
      </form>
    </section>
  );
}
