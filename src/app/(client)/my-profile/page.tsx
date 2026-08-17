"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { User } from "@/types";
import { Camera } from "lucide-react";

interface DetailRowProps {
  label: string;
  value?: string;
  placeholder?: string;
  description?: string;
  isVerified?: boolean;
  extraContent?: React.ReactNode;
  onEdit?: () => void;
}

// Reusable row component for each detail field
function DetailRow({
  label,
  value,
  placeholder,
  description,
  isVerified,
  extraContent,
  onEdit,
}: DetailRowProps) {
  return (
    <div className="py-5 border-b border-gray-200 flex flex-col md:flex-row md:items-start justify-between gap-4">
      {/* Left Column: Label */}
      <div className="w-full md:w-1/4 font-semibold text-gray-900 text-sm md:text-base">
        {label}
      </div>

      {/* Middle Column: Value & Descriptions */}
      <div className="w-full md:w-2/4 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm md:text-base ${
              value ? "text-gray-900 font-medium" : "text-gray-500"
            }`}
          >
            {value || placeholder}
          </span>

          {isVerified && (
            <span className="bg-emerald-700 text-white text-xs font-semibold px-2 py-0.5 rounded">
              Verified
            </span>
          )}
        </div>

        {description && (
          <p className="text-xs md:text-sm text-gray-600 mt-1 leading-relaxed">
            {description}
          </p>
        )}

        {extraContent}
      </div>

      {/* Right Column: Edit Action */}
      <div className="w-full md:w-auto text-right">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors focus:outline-none"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] =useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dob: "",
    nationality: "",
    gender: "",
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
        dob: data.dob ?? "",
        nationality: data.nationality ?? "",
        gender: data.gender ?? "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(field: string) {
      // Replace with your modal trigger or edit state toggler
      console.log(`Edit clicked for: ${field}`);
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
    };

    

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6 pb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Personal details
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Update your information and find out how it's used.
          </p>
        </div>

        {/* Profile Avatar with Camera Overlay */}
        <div className="relative group cursor-pointer">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-600 text-white font-bold text-2xl md:text-3xl rounded-full flex items-center justify-center shadow-inner">
            {form.firstName.charAt(0).toUpperCase() + form.lastName.charAt(0).toUpperCase()}
          </div>
          <div className="absolute bottom-0 right-0 bg-gray-900/60 hover:bg-gray-900 text-white p-1.5 rounded-full border-2 border-white transition-colors">
            <Camera className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </div>
        </div>
      </div>

      {/* Details List */}
      <div className="divide-y divide-gray-200">
        {/* Name */}
        <DetailRow
          label="Name"
          value={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : ""}
          onEdit={() => handleEdit("Name")}
        />

        {/* Display name */}
        <DetailRow
          label="Display name"
          value={form.firstName}
          placeholder="Choose a display name"
          onEdit={() => handleEdit("Display name")}
        />

        {/* Email address */}
        <DetailRow
          label="Email address"
          value={form.email}
          isVerified={true}
          description="This is the email address you use to sign in. It's also where we send your booking confirmations."
          onEdit={() => handleEdit("Email address")}
          extraContent={
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50 text-xs md:text-sm text-gray-700">
              <p className="font-medium text-gray-800">
                Unable to access your email? If you added a mobile phone number
                for one of your previous completed stays, you can change your
                email address using mobile phone verification
              </p>
              <button className="mt-3 text-blue-600 hover:underline font-semibold block">
                Change email with phone verification
              </button>
            </div>
          }
        />

        {/* Phone number */}
        <DetailRow
          label="Phone number"
          value={form.phone}
          placeholder="Add your phone number"
          description="Properties or attractions you book will use this number if they need to contact you."
          onEdit={() => handleEdit("Phone number")}
        />

        {/* Date of birth */}
        <DetailRow
          label="Date of birth"
          value={form.dob}
          placeholder="Enter your date of birth"
          onEdit={() => handleEdit("Date of birth")}
        />

        {/* Nationality */}
        <DetailRow
          label="Nationality"
          value={form.nationality}
          placeholder="Select the country/region you're from"
          onEdit={() => handleEdit("Nationality")}
        />

        {/* Gender */}
        <DetailRow
          label="Gender"
          value={form.gender}
          placeholder="Select your gender"
          onEdit={() => handleEdit("Gender")}
        />
      </div>
    </div>
  );
}