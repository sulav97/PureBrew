import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api/api";
import API, { addEmail, removeEmail, generateBackupCodes, getBackupCodesCount } from "../api/api";
import toast from "react-hot-toast";
import { FaUserCircle, FaLock } from "react-icons/fa";
import coverImage from "../assets/cover.jpg";

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    dob: "", // ✅ Added DOB
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [twoFA, setTwoFA] = useState({ enabled: false });
  const [qr, setQr] = useState("");
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFASetup, setTwoFASetup] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [backupCount, setBackupCount] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    getProfile()
      .then((data) => {
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          dob: data.dob || "", // ✅ Load DOB
        });
        setEmails(data.emails || []);
        setTwoFA({ enabled: !!data.twoFactorEnabled });
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load profile");
        setLoading(false);
      });
  }, []);

  // Fetch backup code count if 2FA enabled
  useEffect(() => {
    if (twoFA.enabled) {
      getBackupCodesCount()
        .then((data) => setBackupCount(data.count))
        .catch(() => setBackupCount(null));
    }
  }, [twoFA.enabled]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form); // ✅ Includes DOB
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwords;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await updateProfile({
        password: newPassword,
        currentPassword,
      });
      toast.success("Password changed successfully");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  // 2FA: Start setup (get QR)
  const handleEnable2FA = async () => {
    setTwoFALoading(true);
    try {
      const res = await API.post("/users/2fa/generate");
      setQr(res.data.qr);
      setTwoFASecret(res.data.secret);
      setTwoFASetup(true);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to start 2FA setup");
    } finally {
      setTwoFALoading(false);
    }
  };

  // 2FA: Confirm setup
  const handleConfirm2FA = async (e) => {
    e.preventDefault();
    setTwoFALoading(true);
    try {
      await API.post("/users/2fa/confirm", { code: twoFACode });
      toast.success("2FA enabled successfully");
      setTwoFA({ enabled: true });
      setTwoFASetup(false);
      setQr("");
      setTwoFASecret("");
      setTwoFACode("");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to enable 2FA");
    } finally {
      setTwoFALoading(false);
    }
  };

  // 2FA: Disable
  const handleDisable2FA = async () => {
    setTwoFALoading(true);
    try {
      await API.post("/users/2fa/disable");
      toast.success("2FA disabled");
      setTwoFA({ enabled: false });
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to disable 2FA");
    } finally {
      setTwoFALoading(false);
    }
  };

  // Generate backup codes
  const handleGenerateBackupCodes = async () => {
    setBackupLoading(true);
    try {
      const res = await generateBackupCodes();
      setBackupCodes(res.backupCodes);
      setBackupCount(res.backupCodes.length);
      toast.success("Backup codes generated! Save them in a safe place.");
    } catch (err) {
      toast.error(err.message || "Failed to generate backup codes");
    } finally {
      setBackupLoading(false);
    }
  };

  // Add a new email
  const handleAddEmail = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      await addEmail(newEmail);
      toast.success("Verification email sent");
      setEmails((prev) => [...prev, { address: newEmail, verified: false }]);
      setNewEmail("");
    } catch (err) {
      toast.error(err.message || "Failed to add email");
    } finally {
      setEmailLoading(false);
    }
  };

  // Remove an email
  const handleRemoveEmail = async (address) => {
    setEmailLoading(true);
    try {
      await removeEmail(address);
      setEmails((prev) => prev.filter((e) => e.address !== address));
      toast.success("Email removed");
    } catch (err) {
      toast.error(err.message || "Failed to remove email");
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl font-light tracking-wide">LOADING PROFILE...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={coverImage} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Profile & Email Management */}
          <div className="space-y-8">
            
            {/* Profile Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <FaUserCircle className="text-2xl text-gray-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider">PROFILE</h2>
                  <p className="text-gray-300 text-sm">Personal Information</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
                      placeholder="Enter your full name"
                      disabled={saving}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
                      placeholder="Enter phone number"
                      disabled={saving}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
                      disabled={saving}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
                      placeholder="Enter your address"
                      disabled={saving}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
                      placeholder="Enter your email"
                      disabled={saving}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-800 text-white py-4 rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "UPDATING..." : "UPDATE PROFILE"}
                </button>
              </form>
            </div>

            {/* Email Management Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                <FaUserCircle className="text-gray-300" />
                Email Accounts
              </h3>
              
              <div className="space-y-4 mb-6">
                {emails.map((e) => (
                  <div key={e.address} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white text-sm">{e.address}</span>
                      {e.verified ? (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">VERIFIED</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full">PENDING</span>
                      )}
                      {e.address === form.email && (
                        <span className="px-2 py-1 bg-gray-600/20 text-gray-300 text-xs rounded-full">PRIMARY</span>
                      )}
                    </div>
                    {e.address !== form.email && (
                      <button
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                        onClick={() => handleRemoveEmail(e.address)}
                        disabled={emailLoading}
                      >
                        REMOVE
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddEmail} className="flex gap-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="Add new email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
                  required
                  disabled={emailLoading}
                />
                <button
                  type="submit"
                  className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
                  disabled={emailLoading}
                >
                  {emailLoading ? "ADDING..." : "ADD"}
                </button>
              </form>
              
              <p className="text-xs text-gray-400 mt-3 italic">You can log in from any verified email.</p>
            </div>
          </div>

          {/* Right Column - Security & 2FA */}
          <div className="space-y-8">
            
            {/* Password Change Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <FaLock className="text-2xl text-gray-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">SECURITY</h3>
                  <p className="text-gray-300 text-sm">Password Management</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
                    placeholder="Enter current password"
                    disabled={savingPassword}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
                      placeholder="Enter new password"
                      disabled={savingPassword}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      value={passwords.confirmNewPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
                      placeholder="Confirm new password"
                      disabled={savingPassword}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-800 text-white py-4 rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
                  disabled={savingPassword}
                >
                  {savingPassword ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>
              </form>
            </div>

            {/* 2FA Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <FaLock className="text-2xl text-gray-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">Two-Factor Authentication</h3>
                  <p className="text-gray-300 text-sm">Enhanced Security</p>
                </div>
              </div>

              {twoFA.enabled ? (
                <div className="space-y-6">
                  <div className="p-4 bg-green-600/20 border border-green-600/30 rounded-lg">
                    <div className="text-green-400 font-semibold uppercase tracking-wide text-sm">2FA ENABLED</div>
                    <p className="text-gray-300 text-sm mt-1">Your account is protected with two-factor authentication.</p>
                  </div>
                  
                  <button
                    onClick={handleDisable2FA}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-700 transition-all duration-300 disabled:opacity-50"
                    disabled={twoFALoading}
                  >
                    {twoFALoading ? "DISABLING..." : "DISABLE 2FA"}
                  </button>

                  {/* Backup Codes Section */}
                  <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-semibold mb-4 uppercase tracking-wide">Backup Codes</h4>
                    <p className="text-gray-300 text-sm mb-4">
                      Use a backup code if you lose access to your authenticator app. Each code can be used once.
                    </p>
                    
                    <div className="mb-4">
                      {backupCount !== null ? (
                        <span className="text-white text-sm">
                          Backup codes remaining: <span className="font-bold text-gray-300">{backupCount}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Loading backup code count...</span>
                      )}
                    </div>
                    
                    <button
                      onClick={handleGenerateBackupCodes}
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 text-sm"
                      disabled={backupLoading}
                    >
                      {backupLoading ? "GENERATING..." : "GENERATE NEW CODES"}
                    </button>
                    
                    {backupCodes.length > 0 && (
                      <div className="mt-6">
                        <div className="text-white font-semibold mb-3 uppercase tracking-wide text-sm">Your New Backup Codes:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {backupCodes.map((code, idx) => (
                            <div key={idx} className="bg-white/10 border border-white/20 px-3 py-2 rounded font-mono text-sm text-white text-center">
                              {code}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-3 italic">These codes will not be shown again. Store them securely.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : twoFASetup ? (
                <form onSubmit={handleConfirm2FA} className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">Scan this QR code in your authenticator app:</p>
                    {qr && (
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <img src={qr} alt="2FA QR Code" className="w-40 h-40" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Verification Code</label>
                    <input
                      type="text"
                      value={twoFACode}
                      onChange={e => setTwoFACode(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
                      placeholder="Enter 6-digit code"
                      required
                      disabled={twoFALoading}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      type="submit"
                      className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
                      disabled={twoFALoading}
                    >
                      {twoFALoading ? "ENABLING..." : "CONFIRM & ENABLE 2FA"}
                    </button>
                    <button
                      type="button"
                      className="w-full text-gray-400 hover:text-white transition-colors text-sm"
                      onClick={() => { setTwoFASetup(false); setQr(""); setTwoFASecret(""); setTwoFACode(""); }}
                      disabled={twoFALoading}
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                    <div className="text-yellow-400 font-semibold uppercase tracking-wide text-sm">2FA DISABLED</div>
                    <p className="text-gray-300 text-sm mt-1">Enable two-factor authentication for enhanced security.</p>
                  </div>
                  
                  <button
                    onClick={handleEnable2FA}
                    className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
                    disabled={twoFALoading}
                  >
                    {twoFALoading ? "LOADING..." : "ENABLE 2FA"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
