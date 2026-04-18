import { useEffect, useState } from "react";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import { getProfile, updateProfile } from "../services/userService.js";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const p = await getProfile();
        if (cancelled || !p) return;
        setName(p.name ?? "");
        setEmail(p.email ?? "");
        setRole(p.role ?? "");
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateProfile({ name });
      if (updated) {
        setName(updated.name ?? name);
        setSuccess("Profile updated.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="section-surface mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm font-medium text-slate-600">View and update your account details.</p>
      </div>

      {error ? (
        <div className="mt-4">
          <Alert type="error" title="Error">
            {error}
          </Alert>
        </div>
      ) : null}
      {success ? (
        <div className="mt-4">
          <Alert type="success" title="Saved">
            {success}
          </Alert>
        </div>
      ) : null}

      <form onSubmit={onSave} className="section-surface mt-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-900">Name</label>
          <input
            className="input-modern mt-1 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">Email</label>
          <input className="input-modern mt-1 w-full opacity-90" value={email} readOnly />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">Role</label>
          <input
            className="input-modern mt-1 w-full opacity-90"
            value={(role || "").replace(/^ROLE_/, "")}
            readOnly
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full px-3 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
