import { Mail, Phone, MapPin, Calendar, Briefcase, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { avatarUrl, type PresenceStatus } from '@/lib/people';

export interface ProfileFields {
  name: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  location?: string;
  startDate?: string;
  bio?: string;
  skills?: string[];
  presence?: PresenceStatus;
  avatarUrl?: string;
  badges?: string[];
}

interface PersonProfilePanelProps {
  profile: ProfileFields;
  compact?: boolean;
  onEdit?: () => void;
  editLabel?: string;
}

const presenceColor: Record<PresenceStatus, string> = {
  online: 'bg-emerald-400',
  busy: 'bg-amber-400',
  away: 'bg-zinc-500',
  offline: 'bg-zinc-700',
};

export function PersonProfilePanel({ profile, compact, onEdit, editLabel = 'Edit profile' }: PersonProfilePanelProps) {
  const img = profile.avatarUrl ?? avatarUrl(profile.name);

  return (
    <div className={cn('rounded-2xl border border-zinc-805 bg-zinc-950/60', compact ? 'p-4' : 'p-5 space-y-4')}>
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <img src={img} alt="" className="w-14 h-14 rounded-2xl border border-zinc-805 object-cover" />
          {profile.presence && (
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-950',
                presenceColor[profile.presence]
              )}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-white truncate">{profile.name}</h3>
          {profile.subtitle && <p className="text-[11px] text-zinc-500 font-semibold truncate">{profile.subtitle}</p>}
          {profile.role && (
            <span className="inline-block mt-1.5 text-[9px] font-black uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-md">
              {profile.role}
            </span>
          )}
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-[10px] font-bold text-brand-400 hover:text-brand-300 shrink-0 cursor-pointer"
          >
            {editLabel}
          </button>
        )}
      </div>

      {profile.bio && !compact && (
        <p className="text-xs text-zinc-400 leading-relaxed font-medium">{profile.bio}</p>
      )}

      <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
        {profile.email && (
          <ProfileRow icon={Mail} label="Email" value={profile.email} />
        )}
        {profile.phone && (
          <ProfileRow icon={Phone} label="Phone" value={profile.phone} />
        )}
        {profile.department && (
          <ProfileRow icon={Briefcase} label="Department" value={profile.department} />
        )}
        {profile.location && (
          <ProfileRow icon={MapPin} label="Location" value={profile.location} />
        )}
        {profile.startDate && (
          <ProfileRow icon={Calendar} label="Since" value={profile.startDate} />
        )}
      </div>

      {profile.skills && profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="text-[9px] font-bold px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-805 text-zinc-400"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {profile.badges && profile.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-zinc-850 pt-3">
          {profile.badges.map((b) => (
            <span
              key={b}
              className="text-[9px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-[11px] min-w-0">
      <Icon className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <span className="text-zinc-600 font-bold uppercase text-[9px] tracking-wide block">{label}</span>
        <span className="text-zinc-300 font-semibold break-all">{value}</span>
      </div>
    </div>
  );
}
