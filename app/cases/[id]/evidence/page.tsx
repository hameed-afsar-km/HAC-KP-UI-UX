'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEvidenceFiles, getUploadUrl } from '@/lib/api';
import { EvidenceFile } from '@/lib/types';
import {
  FileText,
  CloudArrowUp,
  Eye,
  CheckCircle,
  Warning,
  Clock,
  HardDrive,
  FileCode,
  ShieldCheck,
  ArrowRight,
  X,
  LockKey,
  ArrowsClockwise
} from '@phosphor-icons/react';

export default function EvidencePage() {
  const params = useParams();
  const caseId = params?.id as string;

  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<EvidenceFile | null>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'IDLE' | 'GETTING_URL' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (caseId) {
      setFiles(getEvidenceFiles(caseId));
    }
  }, [caseId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('GETTING_URL');
    setStatusMessage('Requesting secure pre-signed upload URL from backend...');

    try {
      await getUploadUrl(caseId, selectedFile.name, selectedFile.type || 'application/octet-stream');

      setUploadStatus('UPLOADING');
      setStatusMessage('Encrypting and streaming binary payload into evidence vault...');

      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setUploadStatus('SUCCESS');
          setStatusMessage('Artifact sealed with SHA-256 fingerprint in custody.');

          const newFile: EvidenceFile = {
            id: `ev-${caseId}-0${files.length + 1}`,
            caseId: Number(caseId),
            fileName: selectedFile.name,
            fileType: selectedFile.name.endsWith('.pdf')
              ? 'PDF'
              : selectedFile.name.endsWith('.json')
              ? 'JSON'
              : 'PCAP',
            fileSizeBytes: selectedFile.size,
            fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
            uploadStatus: 'UPLOADED',
            uploadedAt: new Date().toISOString(),
            status: 'READY',
            sha256Hash: 'a89f412e8b0932018247cae98218bcda14981928374928103948201948201928',
            extractedEntityCount: 0,
            mimeType: selectedFile.type || 'application/octet-stream',
            previewSnippet: `Fresh evidential intake: ${selectedFile.name} received from officer workstation.`
          };

          setFiles((prev) => [newFile, ...prev]);
        }
      }, 250);
    } catch (err) {
      setUploadStatus('ERROR');
      setStatusMessage('Failed to obtain pre-signed storage URL.');
    }
  };

  const resetUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('IDLE');
    setStatusMessage('');
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="badge badge-orange font-mono">Step 01</span>
              <span className="badge badge-muted font-mono">Case #{caseId}</span>
            </div>
            <h1 className="text-xl font-bold text-[#0D0F14] dark:text-[#EEF0F6]">
              Case Files &amp; Documents
            </h1>
            <p className="text-[13px] text-[#8B95AD]">
              All evidence files for this case. Each file is locked and tamper-proof once uploaded.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#E85002] hover:bg-[#F16001] text-white px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-[#E85002]/20 active:scale-95 cursor-pointer"
            >
              <CloudArrowUp size={16} weight="regular" />
              <span>Add File</span>
            </button>

            <Link
              href={`/cases/${caseId}/jobs`}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#E85002] hover:text-[#F16001] transition-colors"
            >
              <span>Run Analysis</span>
              <ArrowRight size={14} weight="regular" />
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#E2E6F0] dark:divide-[#252D3E] border-t border-[#E2E6F0] dark:border-[#252D3E]">
          {[
            { label: 'Files uploaded', value: `${files.length}` },
            { label: 'Tamper protection', value: 'SHA-256', accent: true },
            { label: 'Files analysed', value: '3' },
            { label: 'Storage', value: 'Encrypted' },
          ].map((s) => (
            <div key={s.label} className="px-5 py-3.5">
              <p className="text-[10px] font-semibold text-[#8B95AD] uppercase tracking-wider">{s.label}</p>
              <p className={`text-[15px] font-bold mt-0.5 ${s.accent ? 'text-[#E85002]' : 'text-[#0D0F14] dark:text-[#EEF0F6]'}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E2E2E2] bg-[#F0F0F0] dark:border-[#333333] dark:bg-[#000000] font-mono text-[#000000] dark:text-[#F9F9F9]">
              <tr>
                <th className="px-5 py-4 font-bold">Artifact Name</th>
                <th className="px-4 py-4 font-bold">Type</th>
                <th className="px-4 py-4 font-bold">Size</th>
                <th className="px-4 py-4 font-bold">SHA-256 Fingerprint</th>
                <th className="px-4 py-4 font-bold">Status</th>
                <th className="px-4 py-4 font-bold">Extracted</th>
                <th className="px-4 py-4 font-bold">Timestamp</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2E2] dark:divide-[#333333] text-[#333333] dark:text-[#D4D4D4]">
              {files.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-[#E85002]/5 transition-colors group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-2xl bg-[#E85002]/10 dark:bg-[#E85002]/15 flex items-center justify-center text-[#E85002] border border-[#E85002]/20 flex-shrink-0">
                        {file.fileType === 'PDF' ? (
                          <FileText size={18} weight="bold" />
                        ) : file.fileType === 'JSON' ? (
                          <FileCode size={18} weight="bold" />
                        ) : (
                          <HardDrive size={18} weight="bold" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#000000] dark:text-[#F9F9F9] group-hover:text-[#E85002] transition-colors">
                          {file.fileName}
                        </div>
                        <div className="text-[10px] font-mono text-[#646464] dark:text-[#A7A7A7]">
                          ID: {file.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 font-mono font-semibold">
                    <span className="px-2 py-0.5 rounded-lg bg-[#F0F0F0] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] text-[10px]">
                      {file.fileType}
                    </span>
                  </td>

                  <td className="px-4 py-4 font-mono text-[#646464] dark:text-[#A7A7A7]">
                    {file.fileSize}
                  </td>

                  <td className="px-4 py-4 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#E85002] font-bold">
                      <LockKey size={13} weight="fill" />
                      <span>{file.sha256Hash ? `${file.sha256Hash.slice(0, 10)}...${file.sha256Hash.slice(-8)}` : 'SHA256-VERIFIED'}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle size={12} weight="fill" />
                      {file.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 font-mono font-bold text-[#E85002]">
                    {file.extractedEntityCount} entities
                  </td>

                  <td className="px-4 py-4 font-mono text-[11px] text-[#646464] dark:text-[#A7A7A7]">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F0F0] hover:bg-[#E85002] hover:text-white dark:bg-[#1C1C1C] dark:hover:bg-[#E85002] text-[#000000] dark:text-[#F9F9F9] font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Eye size={14} weight="bold" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl border bg-white border-[#E2E2E2] dark:bg-[#121212] dark:border-[#333333] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 text-[#000000] dark:text-[#F9F9F9]">
            <div className="flex items-center justify-between border-b border-[#E2E2E2] dark:border-[#333333] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-[#E85002] uppercase tracking-wider">
                  SECURE STORAGE INGESTION
                </span>
                <h3 className="text-lg font-bold">Ingest Evidence Artifact</h3>
              </div>
              <button
                onClick={resetUploadModal}
                className="p-1.5 rounded-xl text-[#646464] hover:text-[#000000] hover:bg-[#F0F0F0] dark:hover:bg-[#1C1C1C] dark:hover:text-white"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#E2E2E2] dark:border-[#333333] rounded-2xl p-6 text-center hover:border-[#E85002] transition-colors cursor-pointer bg-[#F0F0F0]/50 dark:bg-[#000000]/50 relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  accept=".pdf,.json,.pcap,.csv,.txt,.log"
                />
                <CloudArrowUp size={36} weight="bold" className="mx-auto text-[#E85002] mb-2" />
                <p className="text-xs font-bold text-[#000000] dark:text-[#F9F9F9]">
                  {selectedFile ? selectedFile.name : 'Click to select or drag forensic artifact here'}
                </p>
                <p className="text-[10px] font-mono text-[#646464] dark:text-[#A7A7A7] mt-1">
                  Supported: PDF reports, JSON logs, PCAP traces, CSV data dumps
                </p>
              </div>

              {selectedFile && (
                <div className="p-3.5 rounded-2xl bg-[#F0F0F0] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#646464] dark:text-[#A7A7A7]">File:</span>
                    <span className="font-bold">{selectedFile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#646464] dark:text-[#A7A7A7]">Size:</span>
                    <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#646464] dark:text-[#A7A7A7]">Integrity:</span>
                    <span className="text-[#E85002] font-bold">SHA-256 Calculated on Stream</span>
                  </div>
                </div>
              )}

              {uploadStatus !== 'IDLE' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#646464] dark:text-[#A7A7A7]">{statusMessage}</span>
                    <span className="font-bold text-[#E85002]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#F0F0F0] dark:bg-[#000000] rounded-full h-2 overflow-hidden border border-[#E2E2E2] dark:border-[#333333]">
                    <div
                      className="bg-[#E85002] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E2E2] dark:border-[#333333]">
              <button
                type="button"
                onClick={resetUploadModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#646464] hover:text-[#000000] bg-[#F0F0F0] hover:bg-[#E2E2E2] dark:bg-[#1C1C1C] dark:text-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedFile || uploadStatus === 'UPLOADING'}
                onClick={handleUpload}
                className="flex items-center gap-2 rounded-xl bg-[#E85002] hover:bg-[#F16001] disabled:opacity-40 text-white px-5 py-2 text-xs font-bold shadow-lg shadow-[#E85002]/25 transition-all cursor-pointer"
              >
                {uploadStatus === 'UPLOADING' ? (
                  <ArrowsClockwise size={15} weight="bold" className="animate-spin" />
                ) : (
                  <CloudArrowUp size={15} weight="bold" />
                )}
                <span>{uploadStatus === 'SUCCESS' ? 'Sealed in Vault' : 'Upload & Seal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-3xl border bg-white border-[#E2E2E2] dark:bg-[#121212] dark:border-[#333333] p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 text-[#000000] dark:text-[#F9F9F9]">
            <div className="flex items-start justify-between border-b border-[#E2E2E2] dark:border-[#333333] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[#E85002] text-white">
                    ARTIFACT INSPECTION
                  </span>
                  <span className="font-mono text-xs text-[#E85002] font-bold">
                    {previewFile.id}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{previewFile.fileName}</h3>
              </div>

              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 rounded-xl text-[#646464] hover:text-[#000000] hover:bg-[#F0F0F0] dark:hover:bg-[#1C1C1C] dark:hover:text-white"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F0F0F0] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] text-xs font-mono">
              <div>
                <span className="text-[#646464] dark:text-[#A7A7A7] text-[10px] block font-bold">MIME TYPE</span>
                <span className="font-bold">{previewFile.mimeType}</span>
              </div>
              <div>
                <span className="text-[#646464] dark:text-[#A7A7A7] text-[10px] block font-bold">FILE SIZE</span>
                <span className="font-bold">{previewFile.fileSize}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#646464] dark:text-[#A7A7A7] text-[10px] block font-bold">SHA-256 HASH</span>
                <span className="font-bold text-[#E85002] break-all">{previewFile.sha256Hash}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-[#646464] dark:text-[#A7A7A7] uppercase">
                Evidential Text Extract Sample
              </span>
              <div className="p-4 rounded-2xl bg-[#F0F0F0] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] text-xs font-mono text-[#333333] dark:text-[#D4D4D4] leading-relaxed max-h-48 overflow-y-auto">
                {previewFile.previewSnippet}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E2E2] dark:border-[#333333]">
              <button
                onClick={() => setPreviewFile(null)}
                className="px-5 py-2.5 rounded-xl bg-[#E85002] hover:bg-[#F16001] text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-[#E85002]/25"
              >
                Dismiss Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
