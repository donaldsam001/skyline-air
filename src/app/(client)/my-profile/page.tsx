"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Loader2,
  Edit2,
  Lock,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { User } from "@/types";
import { useAuthStore } from "@/lib/store/auth-store";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { resolveErrorCode } from "@/lib/error-codes";

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "security" ? "security" : "personal";

  const { isAuthenticated, fetchProfile, user: storeUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(storeUser);
  const [loading, setLoading] = useState(true);

  // Edit Personal Details Modal
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [detailsForm, setDetailsForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [savingDetails, setSavingDetails] = useState(false);

  // Edit Password Modal
  const [editPasswordOpen, setEditPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Feedback notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/my-profile");
      return;
    }
    let active = true;

    api.users
      .getMyInfo()
      .then((data) => {
        if (!active) return;
        setUser(data);
        setDetailsForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
        });
      })
      .catch((err: unknown) => {
        console.error("Error loading profile:", err);
        if (active) setErrorMessage("Failed to load profile details. Please refresh the page.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, router]);

  function openEditDetails() {
    if (!user) return;
    setDetailsForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
    });
    setDetailsError(null);
    setEditDetailsOpen(true);
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    // Frontend validation according to backend constraints
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(detailsForm.firstName.trim())) {
      setDetailsError("First name must contain letters only (A-Z, a-z).");
      return;
    }
    if (!nameRegex.test(detailsForm.lastName.trim())) {
      setDetailsError("Last name must contain letters only (A-Z, a-z).");
      return;
    }
    const phoneTrimmed = detailsForm.phone.trim();
    if (phoneTrimmed.length < 9 || phoneTrimmed.length > 11) {
      setDetailsError("Phone number must be between 9 and 11 digits.");
      return;
    }

    setSavingDetails(true);
    setDetailsError(null);

    try {
      const updated = await api.users.updateUser(user.email, {
        firstName: detailsForm.firstName.trim(),
        lastName: detailsForm.lastName.trim(),
        phone: phoneTrimmed,
      });

      setUser(updated);
      await fetchProfile(); // Sync with auth store
      setEditDetailsOpen(false);
      setSuccessMessage("Personal details updated successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      console.error("Profile update failed:", err);
      let msg = "Failed to update profile details.";
      if (err && typeof err === "object" && "code" in err) {
        const code = (err as { code: number }).code;
        const entry = resolveErrorCode(code);
        msg = entry ? entry.message : msg;
      }
      setDetailsError(msg);
    } finally {
      setSavingDetails(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);

    try {
      await api.users.updateUser(user.email, {
        passwordHash: passwordForm.newPassword,
      });

      setEditPasswordOpen(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setSuccessMessage("Password updated successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      console.error("Password update failed:", err);
      let msg = "Failed to update password. Ensure it meets complexity rules.";
      if (err && typeof err === "object" && "code" in err) {
        const code = (err as { code: number }).code;
        const entry = resolveErrorCode(code);
        msg = entry ? entry.message : msg;
      }
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-aviation-900" />
        <p className="text-sm font-medium text-slate-500">Loading your profile…</p>
      </div>
    );
  }

  const userInitials =
    (user?.firstName?.charAt(0) || "") + (user?.lastName?.charAt(0) || "U");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-aviation-900 text-2xl font-bold text-white shadow-md">
            {userInitials.toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "My Profile"}
            </h1>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
          <ShieldCheck className="h-4 w-4" />
          Verified Account
        </span>
      </div>

      {/* Alert Notifications */}
      {successMessage && (
        <AlertBanner
          tone="success"
          title="Success"
          description={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <AlertBanner
          tone="error"
          title="Error"
          description={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Main Details Card */}
      {activeTab === "personal" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Personal details
              </h2>
              <p className="text-xs text-slate-500">
                Manage your personal information used across bookings.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={openEditDetails}>
              <Edit2 className="h-3.5 w-3.5" />
              Edit details
            </Button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 text-sm">
            {/* Full Name */}
            <div className="flex flex-col py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-slate-500 sm:w-1/3">Full Name</span>
              <span className="font-semibold text-slate-900 sm:w-2/3">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : "Not provided"}
              </span>
            </div>

            {/* Email Address */}
            <div className="flex flex-col py-3.5 sm:flex-row sm:items-start sm:justify-between">
              <span className="font-medium text-slate-500 sm:w-1/3">Email Address</span>
              <div className="sm:w-2/3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{user?.email}</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    Verified
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  This email is used for sign-in and booking confirmations.
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-slate-500 sm:w-1/3">Phone Number</span>
              <span className="font-semibold text-slate-900 sm:w-2/3">
                {user?.phone || "Not provided"}
              </span>
            </div>

            {/* Account Creation Date */}
            {user?.registeredAt && (
              <div className="flex flex-col py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-slate-500 sm:w-1/3">Registered Since</span>
                <span className="font-semibold text-slate-900 sm:w-2/3">
                  {new Date(user.registeredAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Security Tab */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Security settings
              </h2>
              <p className="text-xs text-slate-500">
                Keep your account secure by updating your password regularly.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPasswordError(null);
                setPasswordForm({ newPassword: "", confirmPassword: "" });
                setEditPasswordOpen(true);
              }}
            >
              <Lock className="h-3.5 w-3.5" />
              Change password
            </Button>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-aviation-900" />
                <div>
                  <p className="font-semibold text-slate-900">Password</p>
                  <p className="text-xs text-slate-500">••••••••••••</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">Last changed recently</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Details */}
      <Modal
        open={editDetailsOpen}
        onClose={() => setEditDetailsOpen(false)}
        title="Edit Personal Details"
        size="md"
      >
        <form onSubmit={handleSaveDetails} className="space-y-4">
          {detailsError && (
            <AlertBanner tone="error" title="Invalid details" description={detailsError} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-firstName">First Name</Label>
              <Input
                id="edit-firstName"
                value={detailsForm.firstName}
                onChange={(e) =>
                  setDetailsForm((f) => ({ ...f, firstName: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-lastName">Last Name</Label>
              <Input
                id="edit-lastName"
                value={detailsForm.lastName}
                onChange={(e) =>
                  setDetailsForm((f) => ({ ...f, lastName: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-phone">Phone Number</Label>
            <Input
              id="edit-phone"
              value={detailsForm.phone}
              onChange={(e) => setDetailsForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="0912345678"
              required
            />
            <p className="mt-1 text-xs text-slate-400">
              Must be between 9 and 11 digits.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDetailsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="cta" loading={savingDetails}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Change Password */}
      <Modal
        open={editPasswordOpen}
        onClose={() => setEditPasswordOpen(false)}
        title="Change Password"
        size="sm"
      >
        <form onSubmit={handleSavePassword} className="space-y-4">
          {passwordError && (
            <AlertBanner tone="error" title="Password update failed" description={passwordError} />
          )}

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditPasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="cta" loading={savingPassword}>
              Update password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
      <ProfilePageInner />
    </Suspense>
  );
}