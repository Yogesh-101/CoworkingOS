import { useStore } from '@/store';
import { Settings as SettingsIcon, Bell, Moon, Sun, Shield, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Settings() {
  const { userSettings, updateUserSettings } = useStore();

  return (
    <div className="p-6 space-y-8 bg-zinc-900 rounded-3xl border border-zinc-805 h-full overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-6">
        <SettingsIcon className="w-6 h-6 text-brand-500" />
        <h2 className="text-xl font-display font-medium text-white">Workspace Configuration</h2>
      </div>

      <div className="space-y-6">
        
        {/* Theme Settings */}
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
               {userSettings.theme === 'dark' ? <Moon className="w-5 h-5 text-zinc-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
               <h3 className="font-bold text-white">Appearance</h3>
             </div>
             <button
               onClick={() => updateUserSettings({ theme: userSettings.theme === 'dark' ? 'light' : 'dark' })}
               className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", userSettings.theme === 'dark' ? "bg-zinc-800 text-zinc-300" : "bg-amber-100 text-amber-800")}
             >
               {userSettings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
             </button>
          </div>
          <p className="text-sm text-zinc-500">Toggle between light and dark interface themes for the CoworkingOS dashboard.</p>
        </div>

        {/* Notifications */}
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

         {/* Privacy */}
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

        {/* Email Digest */}
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
