const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '');

export function getAvatarUrl(avatar?: string) {
  if (!avatar) return '/default-avatar.png';
  return avatar.startsWith('http') ? avatar : `${apiUrl}${avatar}`;
}