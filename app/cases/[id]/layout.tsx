import React from 'react';
import { getCaseById } from '@/lib/api';
import { notFound } from 'next/navigation';
import CaseHeader from '@/components/navigation/CaseHeader';

interface CaseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function CaseLayout({ children, params }: CaseLayoutProps) {
  const { id } = await params;
  const caseData = await getCaseById(id);

  if (!caseData) {
    notFound();
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-[#0D0F14] dark:text-[#F9F9F9]">
      <CaseHeader caseData={caseData} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
