import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PersonalInfoSection from '@/components/PersonalInfoSection';
import SecuritySection from '@/components/SecuritySection';
import AccountManagementSection from '@/components/AccountManagementSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAccessibility } from '@/components/Layout';

const Settings: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { fontSize } = useAccessibility();

  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen bg-transparent px-2 sm:px-4 lg:px-8"
        style={{ fontSize: `${fontSize}px` }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main
      className="flex-1 py-12 px-2 sm:px-4 lg:px-8 bg-transparent min-h-screen"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="w-full max-w-full mx-auto">
        <Card
          className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500"
        >
          <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 sm:p-6 rounded-t-2xl border-b border-gray-600/50">
            <CardTitle className="text-4xl font-extrabold text-white">
              Configurações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 space-y-8">
            <PersonalInfoSection user={user} />
            <SecuritySection />
            <AccountManagementSection />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Settings;