export type PresenceStatus = 'online' | 'busy' | 'away' | 'offline';

export function dmChannelId(employeeId: string): string {
  return `dm-${employeeId}`;
}

export function isDmChannel(channel: string): boolean {
  return channel.startsWith('dm-');
}

export function employeeIdFromDmChannel(channel: string): string | null {
  return isDmChannel(channel) ? channel.slice(3) : null;
}

export function avatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=18181b&color=ff0a16&size=128&bold=true`;
}
