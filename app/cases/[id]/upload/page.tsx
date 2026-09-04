'use client';

import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CloudArrowUp,
  FileText,
  FileCode,
  HardDrive,
  X,
  CheckCircle,
  Warning,
  ArrowLeft,
  ArrowRight,
  ListChecks,
  ShieldCheck,
  LockKey,
  ArrowsClockwise,
  Eye,
  Trash,
  Plus,
} from '@phosphor-icons/react';

interface StagedFile {
  id: string;
  file: File;
  preview: string;
  status: 'STAGED' | 'VALIDATING' | 'VALID' | 'INVALID' | 'UPLOADING' | 'DONE';
  issues?: string[];
}

export default function UploadPage() {
  const params = useParams();
  const caseId = params.id as string;

  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [globalStatus, setGlobalStatus] = useState<'IDLE' | 'UPLOADING' | 'DONE'>('IDLE');

  const acceptedTypes = ['.pdf', '.json', '.csv', '.txt', '.log', '.pcap', '.doc', '.docx', '.xlsx', '.msg', '.eml'];

  const getFileIcon = (name: string) => {
    if (name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.msg') || name.endsWith('.eml')) return <FileText size={22} weight="bold" />;
    if (name.endsWith('.json') || name.endsWith('.log') || name.endsWith('.pcap')) return <FileCode size={22} weight="bold" />;
    return <HardDrive size={22} weight="bold" />;
  };

  const simulateValidation = (sf: StagedFile): StagedFile => {
    const issues: string[] = [];
    if (sf.file.size > 500 * 1024 * 1024) issues.push('File exceeds 500 MB limit');
    if (sf.file.size === 0) issues.push('File is empty');
    const ext = '.' + sf.file.name.split('.').pop();
    if (!acceptedTypes.includes(ext.toLowerCase())) issues.push(`Unsupported file type: ${ext}`);
    return { ...sf, status: issues.length > 0 ? 'INVALID' : 'VALID', issues };
  };

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const newStaged: StagedFile[] = Array.from(fileList).map((file) => ({
      id: `staged-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      status: 'STAGED' as const,
    }));

    setStagedFiles((prev) => {
      const updated = [...prev, ...newStaged];
      return updated.map((sf) => (sf.status === 'STAGED' ? simulateValidation(sf) : sf));
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (id: string) => setStagedFiles((prev) => prev.filter((f) => f.id !== id));

  const validCount = stagedFiles.filter((f) => f.status === 'VALID').length;
  const invalidCount = stagedFiles.filter((f) => f.status === 'INVALID').length;

  const handleUploadAll = () => {
    setGlobalStatus('UPLOADING');
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setStagedFiles((prev) => prev.map((f) => (f.status === 'VALID' ? { ...f, status: 'DONE' } : f)));
        setGlobalStatus('DONE');
      }
      setUploadProgress(Math.min(progress, 100));
    }, 200);
  };

  const totalSize = stagedFiles.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="badge badge-orange font-mono">Intake</span>
              <span className="badge badge-muted font-mono">Case #{caseId}</span>
            </div>
            <h1 className="text-xl font-bold text-[#0D0F14] dark:text-[#EEF0F6]">
              Evidence Intake &amp; Upload
            </h1>
            <p className="text-[13px] text-[#8B95AD]">
              Stage forensic artifacts for ingestion into the evidence vault. Files are validated and SHA-256 fingerprinted before sealing.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href={`/cases/${caseId}/evidence`}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#E85002] hover:text-[#F16001] transition-colors"
            >
              <span>Evidence Custody</span>
              <ArrowRight size={14} weight="regular" />
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#E2E6F0] dark:divide-[#252D3E] border-t border-[#E2E6F0] dark:border-[#252D3E]">
          {[
            { label: 'Files staged', value: `${stagedFiles.length}` },
            { label: 'Total size', value: totalSize > 0 ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB` : '0 MB' },
            { label: 'Valid', value: `${validCount}`, accent: validCount > 0 },
            { label: 'Rejected', value: `${invalidCount}`, danger: invalidCount > 0 },
          ].map((s) => (
            <div key={s.label} className="px-5 py-3.5">
              <p className="text-[10px] font-semibold text-[#8B95AD] uppercase tracking-wider">{s.label}</p>
              <p className={`text-[15px] font-bold mt-0.5 ${s.danger ? 'text-red-500' : s.accent ? 'text-emerald-500' : 'text-[#0D0F14] dark:text-[#EEF0F6]'}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-200 cursor-pointer group ${
          isDragging
            ? 'border-[#E85002] bg-[#E85002]/5 dark:bg-[#E85002]/8 shadow-lg shadow-[#E85002]/10'
            : 'border-[#E2E6F0] dark:border-[#252D3E] bg-white dark:bg-[#161B27] hover:border-[#E85002]/50 hover:bg-[#E85002]/2'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleInputChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          accept={acceptedTypes.join(',')}
        />
        <div className="space-y-4 pointer-events-none">
          <div className={`mx-auto h-20 w-20 rounded-3xl flex items-center justify-center transition-colors duration-200 ${
            isDragging ? 'bg-[#E85002] text-white' : 'bg-[#E85002]/10 text-[#E85002] group-hover:bg-[#E85002]/15'
          }`}>
            <CloudArrowUp size={40} weight={isDragging ? 'fill' : 'bold'} />
          </div>
          <div>
            <p className="text-base font-bold text-[#0D0F14] dark:text-[#EEF0F6]">
              {isDragging ? 'Release to stage files' : 'Drag & drop forensic artifacts'}
            </p>
            <p className="text-sm text-[#8B95AD] mt-1">
              or <span className="text-[#E85002] font-semibold">browse your filesystem</span> to select files
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['PDF', 'JSON', 'CSV', 'PCAP', 'LOG', 'DOCX', 'MSG'].map((type) => (
              <span key={type} className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#F0F0F0] dark:bg-[#000000] text-[#646464] dark:text-[#A7A7A7] border border-[#E2E2E2] dark:border-[#333333]">
                .{type.toLowerCase()}
              </span>
            ))}
            <span className="text-[10px] text-[#8B95AD] font-mono">+ more</span>
          </div>
        </div>
      </div>

      {/* Staged Files Table */}
      {stagedFiles.length > 0 && (
        <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E6F0] dark:border-[#252D3E]">
            <div className="flex items-center gap-2">
              <ListChecks size={18} weight="fill" className="text-[#E85002]" />
              <h2 className="text-sm font-bold text-[#0D0F14] dark:text-[#EEF0F6]">Staged Artifacts</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E85002]/10 text-[#E85002] border border-[#E85002]/20">
                {stagedFiles.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStagedFiles([])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono text-[#646464] hover:text-red-500 bg-[#F0F0F0] hover:bg-red-50 dark:bg-[#1C1C1C] dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash size={12} /> Clear All
              </button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono text-white bg-[#E85002] hover:bg-[#F16001] transition-colors cursor-pointer shadow-sm">
                <Plus size={12} /> Add More
                <input type="file" multiple onChange={handleInputChange} className="hidden" accept={acceptedTypes.join(',')} />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2E2E2] bg-[#F0F0F0] dark:border-[#333333] dark:bg-[#000000] font-mono text-[#000000] dark:text-[#F9F9F9]">
                <tr>
                  <th className="px-6 py-3 font-bold">File Name</th>
                  <th className="px-4 py-3 font-bold">Size</th>
                  <th className="px-4 py-3 font-bold">Validation</th>
                  <th className="px-4 py-3 font-bold">Integrity</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2E2] dark:divide-[#333333] text-[#333333] dark:text-[#D4D4D4]">
                {stagedFiles.map((sf) => (
                  <tr key={sf.id} className="hover:bg-[#E85002]/5 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-2xl flex items-center justify-center border flex-shrink-0 ${
                          sf.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          sf.status === 'INVALID' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          sf.status === 'DONE' ? 'bg-[#E85002]/10 text-[#E85002] border-[#E85002]/20' :
                          'bg-[#F0F0F0] text-[#646464] border-[#E2E2E2] dark:bg-[#1C1C1C] dark:text-[#A7A7A7] dark:border-[#333333]'
                        }`}>
                          {sf.status === 'DONE' ? <CheckCircle size={18} weight="fill" /> : getFileIcon(sf.file.name)}
                        </div>
                        <div>
                          <p className="font-bold text-[#000000] dark:text-[#F9F9F9] group-hover:text-[#E85002] transition-colors">{sf.file.name}</p>
                          {sf.issues && sf.issues.length > 0 && (
                            <p className="text-[10px] font-mono text-red-500 mt-0.5">{sf.issues[0]}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#646464] dark:text-[#A7A7A7]">{sf.preview}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        sf.status === 'VALID' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' :
                        sf.status === 'INVALID' ? 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30' :
                        sf.status === 'DONE' ? 'bg-[#E85002]/15 text-[#E85002] border border-[#E85002]/30' :
                        'bg-[#F0F0F0] text-[#646464] dark:bg-[#1C1C1C] dark:text-[#A7A7A7] border border-[#E2E2E2] dark:border-[#333333]'
                      }`}>
                        {sf.status === 'VALID' && <><CheckCircle size={11} weight="fill" /> READY</>}
                        {sf.status === 'INVALID' && <><Warning size={11} weight="fill" /> FAILED</>}
                        {sf.status === 'DONE' && <><CheckCircle size={11} weight="fill" /> SEALED</>}
                        {sf.status === 'STAGED' && 'PENDING'}
                        {sf.status === 'UPLOADING' && <><ArrowsClockwise size={11} weight="fill" className="animate-spin" /> UPLOADING</>}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#E85002] font-bold">
                        <LockKey size={11} weight="fill" />
                        {sf.status === 'DONE' ? 'SHA-256 Sealed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => removeFile(sf.id)}
                        disabled={sf.status === 'UPLOADING' || sf.status === 'DONE'}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F0F0F0] hover:bg-red-50 hover:text-red-500 dark:bg-[#1C1C1C] dark:hover:bg-red-500/10 dark:hover:text-red-400 text-[#646464] font-bold text-[10px] transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        <X size={12} weight="bold" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Upload Progress */}
          {globalStatus === 'UPLOADING' && (
            <div className="px-6 py-4 border-t border-[#E2E6F0] dark:border-[#252D3E] bg-[#F0F0F0]/50 dark:bg-[#000000]/50">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-[#646464] dark:text-[#A7A7A7]">Encrypting and streaming artifacts into evidence vault...</span>
                <span className="font-bold text-[#E85002]">{uploadProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-[#E2E2E2] dark:bg-[#1C1C1C] rounded-full h-2 overflow-hidden">
                <div className="bg-[#E85002] h-full transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="px-6 py-4 border-t border-[#E2E6F0] dark:border-[#252D3E] flex items-center justify-between">
            <p className="text-[11px] font-mono text-[#8B95AD]">
              {validCount} artifact{validCount !== 1 ? 's' : ''} ready for ingestion
              {invalidCount > 0 && <span className="text-red-500 ml-2">• {invalidCount} rejected</span>}
            </p>
            <button
              onClick={handleUploadAll}
              disabled={validCount === 0 || globalStatus === 'UPLOADING' || globalStatus === 'DONE'}
              className="flex items-center gap-2 rounded-xl bg-[#E85002] hover:bg-[#F16001] disabled:opacity-40 text-white px-6 py-2.5 text-xs font-bold shadow-lg shadow-[#E85002]/25 transition-all cursor-pointer"
            >
              {globalStatus === 'DONE' ? (
                <><CheckCircle size={15} weight="fill" /> All Artifacts Sealed</>
              ) : globalStatus === 'UPLOADING' ? (
                <><ArrowsClockwise size={15} weight="bold" className="animate-spin" /> Ingesting...</>
              ) : (
                <><ShieldCheck size={15} weight="bold" /> Seal &amp; Upload {validCount} Artifact{validCount !== 1 ? 's' : ''}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Empty State when no files staged */}
      {stagedFiles.length === 0 && (
        <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-[#F0F0F0] dark:bg-[#000000] flex items-center justify-center border border-[#E2E2E2] dark:border-[#333333]">
              <ShieldCheck size={28} weight="duotone" className="text-[#8B95AD]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0D0F14] dark:text-[#EEF0F6]">No artifacts staged yet</h3>
              <p className="text-xs text-[#8B95AD] mt-1">Drag files into the zone above or click to browse your filesystem.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-[#8B95AD]">
              <span className="flex items-center gap-1"><LockKey size={11} weight="fill" className="text-[#E85002]" /> SHA-256 fingerprinted</span>
              <span className="flex items-center gap-1"><ShieldCheck size={11} weight="fill" className="text-[#E85002]" /> Tamper-proof seal</span>
              <span className="flex items-center gap-1"><CheckCircle size={11} weight="fill" className="text-[#E85002]" /> Chain of custody preserved</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}