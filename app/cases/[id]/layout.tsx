import React from 'react';
import { getCaseById } from '@/lib/api';
import CaseHeader from '@/components/navigation/CaseHeader';
import CaseSubNav from '@/components/navigation/CaseSubNav';
import { notFound } from 'next/navigation';

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
    <div className="flex-1 flex flex-col bg-[#070b12]">
      <CaseHeader caseData={caseData} />
      <CaseSubNav caseId={id} />
      <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {children}
      </div>
    </div>
  );
}
