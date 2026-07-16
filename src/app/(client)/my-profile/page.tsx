"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { User } from "@/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] =useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    registeredAt: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await api.users.getMyInfo();

      setUser(data);

      setForm({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        registeredAt: data.registeredAt ?? "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;

    setSaving(true);
    setMessage("");

    try {
      const updated = await api.users.updateUser(user.email, form);

      setUser(updated);
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        Unable to load profile.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        My Profile
      </h1>

      {message && (
        <div className="mb-5 rounded bg-blue-100 p-3 text-blue-700">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border p-6 shadow"
      >
        <div>
          <label className="mb-1 block font-medium">
            Email
          </label>

          <input
            value={user.email}
            disabled
            className="w-full rounded border bg-gray-100 p-3"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Full Name
          </label>

          <input
            value={form.firstName + " " + form.lastName}
            disabled={!editing}
            onChange={(e) =>
              setForm({
                ...form,
                firstName: e.target.value.split(" ")[0],
                lastName: e.target.value.split(" ").slice(1).join(" "),
              })
            }
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Phone
          </label>

          <input
            value={form.phone}
            disabled={!editing}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
            className="w-full rounded border p-3"
          />
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(false);

                setForm({
                    firstName: user.firstName ?? "",
                    lastName: user.lastName ?? "",
                    phone: user.phone ?? "",
                    email: user.email ?? "",
                    registeredAt: user.registeredAt ?? "",
                });
              }}
              className="rounded bg-gray-400 px-5 py-2 text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}