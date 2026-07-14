"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { useAuthStore } from "@/app/modules/auth/auth.store";
import { useGetMyOrgs } from "@/app/modules/organization/organization.hook";
import { Dropdown } from "@/components/ui/Dropdown";
import { useUpload } from "@/app/modules/documents/documents.hook";

export default function NavBar() {
  const { data: orgData } = useGetMyOrgs();
  const { mutateAsync: uploadMutation } = useUpload();

  const [modal, setModal] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  if (!orgData) {
    return <div>No organizations found.</div>;
  }

  const orgItems = orgData.map((org) => ({
    label: org.organization.name,
    onClick: () => {
      useAuthStore().switchActiveWorkspace(org.id);
    },
  }));

  const handleUpload = async (files: File[]) => {
    setModal(false);
    uploadMutation(files);
  };

  const handleFiles = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
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
                  {orgData[0].organization.name}
                </span>
              }
              items={orgItems}
              className="rounded-xl border border-slate-300 px-2 py-1"
            />
          </div>

          <button
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-slate-800"
            onClick={() => setModal(true)}
          >
            <Upload className="h-4 w-4" />
            Upload Docs
          </button>
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
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files) return;

                    handleFiles(Array.from(e.target.files));
                  }}
                />
              </label>

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
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => {
                  setModal(false);
                  setFiles([]);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                disabled={files.length === 0}
                className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={() => {
                  handleUpload(files);
                }}
              >
                Upload {files.length > 0 && `(${files.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
