import { useStore } from '@/store';
import { Settings as SettingsIcon, Bell, Shield, Mail, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PersonProfilePanel } from '@/components/people/PersonProfilePanel';

export function Settings() {
  const { userSettings, updateUserSettings, employees, branches } = useStore();
  const linkedEmployee = employees.find((e) => e.id === userSettings.linkedEmployeeId);
  const branch = linkedEmployee ? branches.find((b) => b.id === linkedEmployee.branchId) : null;

  return (
    <div className="p-6 space-y-8 bg-zinc-900 rounded-3xl border border-zinc-805 h-full overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-6">
        <SettingsIcon className="w-6 h-6 text-brand-500" />
        <h2 className="text-xl font-display font-medium text-white">Workspace Configuration</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-white">Your profile</h3>
          </div>
          <p className="text-sm text-zinc-500">Visible to staff in Team Chat directory and used as your sender identity.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ProfileField label="Display name" value={userSettings.displayName ?? ''} onChange={(v) => updateUserSettings({ displayName: v })} />
            <ProfileField label="Email" value={userSettings.email ?? ''} onChange={(v) => updateUserSettings({ email: v })} />
            <ProfileField label="Phone" value={userSettings.phone ?? ''} onChange={(v) => updateUserSettings({ phone: v })} />
            <ProfileField label="Department" value={userSettings.department ?? ''} onChange={(v) => updateUserSettings({ department: v })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Bio</label>
            <textarea
              value={userSettings.bio ?? ''}
              onChange={(e) => updateUserSettings({ bio: e.target.value })}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500/50 resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Link to staff record</label>
            <select
              value={userSettings.linkedEmployeeId ?? ''}
              onChange={(e) => updateUserSettings({ linkedEmployeeId: e.target.value || undefined })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-300 cursor-pointer focus:outline-none font-semibold"
            >
              <option value="">None</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} — {emp.role}</option>
              ))}
            </select>
          </div>
          {(userSettings.displayName || linkedEmployee) && (
            <PersonProfilePanel
              profile={{
                name: userSettings.displayName ?? linkedEmployee?.name ?? 'Admin',
                subtitle: userSettings.email,
                email: userSettings.email,
                phone: userSettings.phone,
                department: userSettings.department ?? linkedEmployee?.department,
                role: linkedEmployee?.role,
                location: branch?.name,
                bio: userSettings.bio,
                presence: linkedEmployee?.presence,
              }}
            />
          )}
        </div>

        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-zinc-400" />
              <h3 className="font-bold text-white">Notifications</h3>
            </div>
            <button
               onClick={() => updateUserSettings({ notificationsEnabled: !userSettings.notificationsEnabled })}
               className={cn("w-12 h-6 rounded-full p-1 transition-all", userSettings.notificationsEnabled ? "bg-brand-500 justify-end flex" : "bg-zinc-800 justify-start flex")}
             >
               <div className="w-4 h-4 bg-white rounded-full" />
             </button>
          </div>
           <p className="text-sm text-zinc-500">Enable or disable real-time system alerts for leads, billing, and visitors.</p>
        </div>

         <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-zinc-400" />
              <h3 className="font-bold text-white">Privacy Mode</h3>
            </div>
            <button
               onClick={() => updateUserSettings({ privacyMode: !userSettings.privacyMode })}
               className={cn("w-12 h-6 rounded-full p-1 transition-all", userSettings.privacyMode ? "bg-brand-500 justify-end flex" : "bg-zinc-800 justify-start flex")}
             >
               <div className="w-4 h-4 bg-white rounded-full" />
             </button>
          </div>
           <p className="text-sm text-zinc-500">Mask sensitive visitor data and internal revenue metrics in shared viewports.</p>
        </div>

        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-zinc-400" />
              <h3 className="font-bold text-white">Email Digest</h3>
            </div>
          </div>
          <div className="flex gap-2">
            {(['daily', 'weekly', 'none'] as const).map(option => (
              <button
                key={option}
                onClick={() => updateUserSettings({ emailDigest: option })}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all",
                  userSettings.emailDigest === option ? "bg-brand-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                )}
              >
                {option}
              </button>
            ))}
          </div>
           <p className="text-sm text-zinc-500 mt-4">Frequency of automated system reports delivered to your inbox.</p>
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500/50"
      />
    </div>
  );
}
