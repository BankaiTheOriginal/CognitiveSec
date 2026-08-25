"use client";

import { useEffect, useState } from "react";
import { Search, Upload, X } from "lucide-react";
import { useAuthStore } from "@/app/modules/auth/auth.store";
import { useGetMyOrgs } from "@/app/modules/organization/organization.hook";
import { Dropdown } from "@/components/ui/Dropdown";
import { useUpload } from "@/app/modules/documents/documents.hook";
import SearchModal from "@/components/parts/search/SearchModal";

const allowedExtensions = [".pdf", ".docx", ".txt", ".csv"];
const maxUploadSizeBytes = 20 * 1024 * 1024;

export default function NavBar() {
  const { data: orgData } = useGetMyOrgs();
  const { mutateAsync: uploadMutation, isPending: isUploading } = useUpload();
  const switchActiveWorkspace = useAuthStore(
    (state) => state.switchActiveWorkspace,
  );
  const activeOrganizationId = useAuthStore(
    (state) => state.activeOrganizationId,
  );

  const [modal, setModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!orgData) {
    return <div>No organizations found.</div>;
  }

  const activeOrg =
    orgData.find((organization) => organization.id === activeOrganizationId) ??
    orgData[0];

  const orgItems = orgData.map((org) => ({
    label: org.organization.name,
    onClick: () => {
      void switchActiveWorkspace(org.id);
    },
  }));

  const validateFile = (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((extension) =>
      lowerName.endsWith(extension),
    );

    if (!isAllowed) {
      return `${file.name} is not a supported file type. Use PDF, DOCX, TXT, or CSV.`;
    }

    if (file.size > maxUploadSizeBytes) {
      return `${file.name} is larger than 20MB.`;
    }

    return null;
  };

  const handleFiles = (selectedFiles: File[]) => {
    const acceptedFiles: File[] = [];
    const errors: string[] = [];

    selectedFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
        return;
      }

      acceptedFiles.push(file);
    });

    if (errors.length > 0) {
      setFileErrors((prev) => [...prev, ...errors]);
    }

    if (acceptedFiles.length > 0) {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    }
  };

  const resetUploadState = () => {
    setFiles([]);
    setFileErrors([]);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setFileErrors([]);
    setUploadProgress(0);
    try {
      await uploadMutation({
        files,
        onProgress: setUploadProgress,
      });
      setModal(false);
      resetUploadState();
    } catch {
      // The hook already surfaces the toast. Keep the modal open so the user can adjust files.
    }
  };

  return (
    <div>
      <div className="rounded-xl border border-slate-300 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">ORG:</span>

            <Dropdown
              trigger={
                <span className="text-sm font-semibold">
                  {activeOrg?.organization.name}
                </span>
              }
              items={orgItems}
              className="rounded-xl border border-slate-300 px-2 py-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              Search
            </button>

            <button
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              onClick={() => setModal(true)}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Docs"}
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold">Upload Documents</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Upload files to your organization.
                </p>
              </div>

              <button
                onClick={() => setModal(false)}
                className="rounded-lg p-2 transition hover:bg-slate-100"
                disabled={isUploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <label
                htmlFor="file-upload"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);

                  const droppedFiles = Array.from(e.dataTransfer.files);
                  handleFiles(droppedFiles);
                }}
                className={`flex h-72 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
                  dragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300 bg-slate-50 hover:border-black hover:bg-slate-100"
                }`}
              >
                <Upload className="mb-5 h-14 w-14 text-slate-400" />

                <h3 className="text-lg font-semibold text-slate-800">
                  {dragging ? "Drop your files here" : "Drag & Drop Files Here"}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  or{" "}
                  <span className="font-semibold text-black">
                    click to browse
                  </span>
                </p>

                <p className="mt-5 text-xs text-slate-400">
                  Supports PDF, DOCX, TXT, CSV • Max 20MB
                </p>

                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept={allowedExtensions.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files) return;

                    handleFiles(Array.from(e.target.files));
                  }}
                />
                </label>

              {fileErrors.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-semibold">Some files were skipped</p>
                  <ul className="mt-2 space-y-1">
                    {fileErrors.map((error) => (
                      <li key={error}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    Selected Files ({files.length})
                  </h3>

                  <div className="max-h-52 space-y-2 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="overflow-hidden">
                          <p className="truncate font-medium text-slate-800">
                            {file.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setFiles((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                          className="rounded-full p-1 text-red-500 transition hover:bg-red-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Upload progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-black transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => {
                  setModal(false);
                  resetUploadState();
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
                disabled={isUploading}
              >
                Cancel
              </button>

              <button
                disabled={files.length === 0 || isUploading}
                className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={handleUpload}
              >
                {isUploading
                  ? "Uploading..."
                  : `Upload ${files.length > 0 ? `(${files.length})` : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
