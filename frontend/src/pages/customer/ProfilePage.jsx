import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, changePassword, addAddress, deleteAddress } from '../../features/auth/authSlice';
import { FiUser, FiLock, FiMapPin, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';

const Tab = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${active ? 'bg-accent text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
    {children}
  </button>
);

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', street: '', city: '', state: '', zip: '', country: 'India', isDefault: false });

  const handleProfileSave = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', profile.name);
    fd.append('phone', profile.phone);
    dispatch(updateProfile(fd));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return alert('Passwords do not match');
    dispatch(changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }));
    setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    dispatch(addAddress(newAddr));
    setShowAddrForm(false);
    setNewAddr({ label: 'Home', street: '', city: '', state: '', zip: '', country: 'India', isDefault: false });
  };

  return (
    <div className="page-container py-8 max-w-3xl">
      <h1 className="section-title mb-6">My Profile</h1>

      <div className="flex gap-2 mb-6">
        {[['profile', <FiUser size={14} />, 'Profile'], ['security', <FiLock size={14} />, 'Security'], ['addresses', <FiMapPin size={14} />, 'Addresses']].map(([key, icon, label]) => (
          <Tab key={key} active={tab === key} onClick={() => setTab(key)}>
            <span className="flex items-center gap-1.5">{icon} {label}</span>
          </Tab>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold font-display">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="badge bg-blue-100 text-blue-700 mt-1">{user?.role}</span>
            </div>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text' },
              { key: 'phone', label: 'Phone', type: 'tel' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
                <input type={type} value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  className="input" />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <input type="email" value={user?.email} disabled className="input bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <FiSave size={14} /> {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="card p-6">
          <h2 className="font-display text-base font-bold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
                <input type="password" value={pwForm[key]}
                  onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                  required className="input" placeholder="••••••••" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {tab === 'addresses' && (
        <div className="space-y-4">
          {user?.addresses?.map((addr) => (
            <div key={addr._id} className="card p-4 flex items-start justify-between">
              <div>
                <span className="badge bg-gray-100 text-gray-600 mb-1">{addr.label}</span>
                {addr.isDefault && <span className="badge bg-green-100 text-green-700 ml-1 mb-1">Default</span>}
                <p className="text-sm text-gray-700 mt-1">{addr.street}, {addr.city}, {addr.state} – {addr.zip}</p>
                <p className="text-xs text-gray-500">{addr.country}</p>
              </div>
              <button onClick={() => dispatch(deleteAddress(addr._id))}
                className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}

          {!showAddrForm ? (
            <button onClick={() => setShowAddrForm(true)}
              className="btn-outline w-full flex items-center justify-center gap-2">
              <FiPlus size={14} /> Add New Address
            </button>
          ) : (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">New Address</h3>
              <form onSubmit={handleAddAddress} className="grid grid-cols-2 gap-3">
                {[
                  { key: 'label', label: 'Label', full: false },
                  { key: 'street', label: 'Street', full: true },
                  { key: 'city', label: 'City', full: false },
                  { key: 'state', label: 'State', full: false },
                  { key: 'zip', label: 'PIN Code', full: false },
                  { key: 'country', label: 'Country', full: false },
                ].map(({ key, label, full }) => (
                  <div key={key} className={full ? 'col-span-2' : ''}>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
                    <input value={newAddr[key]} onChange={(e) => setNewAddr({ ...newAddr, [key]: e.target.value })}
                      className="input text-sm py-2" required={key !== 'label'} />
                  </div>
                ))}
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="isDefault" checked={newAddr.isDefault}
                    onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    className="accent-accent" />
                  <label htmlFor="isDefault" className="text-sm text-gray-600">Set as default address</label>
                </div>
                <div className="col-span-2 flex gap-3">
                  <button type="submit" className="btn-primary">Save Address</button>
                  <button type="button" onClick={() => setShowAddrForm(false)} className="btn-ghost">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
