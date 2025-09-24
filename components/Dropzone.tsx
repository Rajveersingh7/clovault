"use client";

import Image from "next/image";
import {useState} from "react";
import DropzoneComponent from "react-dropzone";
import type {FileRejection} from "react-dropzone";
import {useNotifications} from "@/components/Notification";

type DropzoneProps = {
  onUploaded?: () => void;
};

function Dropzone({onUploaded}: DropzoneProps) {
  const [loading, setLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  const {showError, showSuccess} = useNotifications();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setPendingFiles(acceptedFiles);
    }
  };

  const formatBytes = (bytes?: number | null) => {
    const size = typeof bytes === "number" ? bytes : 0;
    if (size === 0) return "0 B";
    const k = 1024;
    const dm = 1;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return `${parseFloat((size / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const onDropRejected = (rejections: FileRejection[]) => {
    rejections.forEach((rej) => {
      rej.errors.forEach((err) => {
        let msg = err.message;
        if (err.code === "file-too-large") {
          msg = `File is too large: ${rej.file.name} (${formatBytes(
            rej.file.size
          )})`;
        }
        if (err.code === "file-invalid-type") {
          msg = `Unsupported file type: ${rej.file.name}`;
        }
        showError(msg);
      });
    });
  };

  const uploadPost = async (selectedFile: File, manageLoading = true) => {
    if (manageLoading && loading) return;
    if (manageLoading) setLoading(true);
    try {
      const form = new FormData();
      form.append("file", selectedFile);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: form
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error((err as any)?.error || "Upload failed");
      }

      onUploaded?.();
    } catch (e) {
      console.error(e);
      showError((e as Error).message);
    } finally {
      if (manageLoading) setLoading(false);
    }
  };

  const confirmUpload = async () => {
    if (!pendingFiles || pendingFiles.length === 0) return;
    setLoading(true);
    const count = pendingFiles.length;
    try {
      await pendingFiles.reduce(
        (p, file) => p.then(() => uploadPost(file, false)),
        Promise.resolve()
      );
      setPendingFiles(null);
      showSuccess(`Uploaded ${count} file${count > 1 ? "s" : ""}`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("files:changed"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cancelUpload = () => {
    setPendingFiles(null);
  };

  const maxSize = 20 * 1024 * 1024;
  const accept: Record<string, string[]> = {
    "image/*": [],
    "application/pdf": [".pdf"],
    "text/plain": [".txt"],
    "application/zip": [".zip"],
    "application/json": [".json"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx"
    ],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx"
    ]
  };

  return (
    <>
      <DropzoneComponent
        minSize={0}
        maxSize={maxSize}
        onDrop={onDrop}
        onDropRejected={onDropRejected}
        disabled={loading}
        accept={accept}
      >
        {({getRootProps, getInputProps, isDragActive, isDragReject}) => {
          return (
            <section className="p-7 h-full">
              <div
                {...getRootProps()}
                className={`w-full h-full flex flex-col justify-center items-center border border-stone-200 rounded-lg text-center cursor-pointer p-5 text-xl ${
                  isDragActive
                    ? "bg-blue-500 animate-pulse"
                    : "bg-white text-black"
                }${loading ? " opacity-60 cursor-not-allowed" : ""}`}
              >
                <Image
                  src="/upload.svg"
                  alt="upload"
                  width={50}
                  height={50}
                  className="opacity-70"
                />
                <input {...getInputProps()} />
                <span className="opacity-70">
                  {isDragActive
                    ? "Drop to upload this file!"
                    : "Click here or drop a file to upload!"}
                </span>
              </div>
            </section>
          );
        }}
      </DropzoneComponent>

      {pendingFiles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white text-black rounded-xl shadow-2xl w-full max-w-lg border border-stone-200">
            <div className="p-5 border-b border-stone-200 text-lg font-semibold">
              Confirm upload
            </div>
            <div className="p-5 space-y-3 max-h-80 overflow-auto">
              <div className="text-sm opacity-80">You are about to upload:</div>
              <ul className="list-disc list-inside text-sm">
                {pendingFiles.map((f) => (
                  <li key={f.name + f.size}>{f.name}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 flex gap-3 justify-end border-t border-stone-200">
              <button
                className={`btn btn-ghost${
                  loading ? " pointer-events-none opacity-60" : ""
                }`}
                onClick={cancelUpload}
              >
                Cancel
              </button>
              <button
                className={`btn bg-blue-500 hover:bg-blue-600 text-white${
                  loading ? " pointer-events-none opacity-70" : ""
                }`}
                onClick={confirmUpload}
              >
                {loading ? "Loading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dropzone;
