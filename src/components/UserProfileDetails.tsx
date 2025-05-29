import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card } from '@/components/ui/card';
import { Briefcase, MapPin, Instagram, Linkedin, Star, Github } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  title?: string;
  location?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  skills?: string;
}

interface Props {
  userId: number;
}

const UserProfileDetails: React.FC<Props> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.get(`/users/${userId}`).then(res => setUser(res.data));
  }, [userId]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR');

  const extractUsername = (url?: string) => {
    if (!url) return null;
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      if (parsedUrl.hostname.includes('linkedin.com')) {
        const inIndex = pathSegments.indexOf('in');
        return inIndex !== -1 && inIndex + 1 < pathSegments.length ? pathSegments[inIndex + 1] : null;
      }
      return pathSegments[0] || null;
    } catch {
      return null;
    }
  };

  if (!user) return <div className="text-white p-8">Carregando...</div>;

  return (
    <Card className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50">
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-8 rounded-t-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.name}
            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-white">{user.name}</h1>
            <p className="text-gray-200 text-lg">{user.email}</p>
            <p className="text-sm text-gray-300">Membro desde {formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.title && (
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50">
              <Briefcase className="text-orange-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">Título</p>
                <p className="text-gray-200">{user.title}</p>
              </div>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50">
              <MapPin className="text-orange-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">Localização</p>
                <p className="text-gray-200">{user.location}</p>
              </div>
            </div>
          )}
          {user.instagramUrl && (
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50">
              <Instagram className="text-orange-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">Instagram</p>
                <a
                  href={user.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  @{extractUsername(user.instagramUrl)}
                </a>
              </div>
            </div>
          )}
          {user.linkedinUrl && (
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50">
              <Linkedin className="text-orange-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">LinkedIn</p>
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  @{extractUsername(user.linkedinUrl)}
                </a>
              </div>
            </div>
          )}
          {user.githubUrl && (
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50">
              <Github className="text-orange-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">GitHub</p>
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  @{extractUsername(user.githubUrl)}
                </a>
              </div>
            </div>
          )}
          {user.skills && (
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50">
              <Star className="text-orange-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">Habilidades</p>
                <p className="text-gray-200">{user.skills}</p>
              </div>
            </div>
          )}
        </div>
        {user.bio && (
          <div className="mt-6 p-4 rounded-lg bg-gray-600/30">
            <h3 className="text-white text-xl font-bold mb-2">Sobre</h3>
            <p className="text-gray-200">{user.bio}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserProfileDetails;