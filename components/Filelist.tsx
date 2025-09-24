"use client";

import Image from "next/image";
import {useEffect, useState} from "react";
import {useNotifications} from "@/components/Notification";

type FileRow = {
  id: string;
  user_identifier: string;
  original_name: string;
  storage_path: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  created_at: string;
};

function Filelist() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<FileRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const {showError, showSuccess} = useNotifications();

  async function loadFiles() {
    setLoading(true);
    try {
      const res = await fetch("/api/files", {cache: "no-store"});
      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error((data as any)?.error || "Failed to load files");
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
    const handler = () => loadFiles();
    window.addEventListener("files:changed", handler);
    return () => window.removeEventListener("files:changed", handler);
  }, []);

  const formatBytes = (bytes?: number | null) => {
    const size = typeof bytes === "number" ? bytes : 0;
    if (size === 0) return "0 B";
    const k = 1024;
    const dm = 1;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return `${parseFloat((size / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  if (loading)
    return (
      <div className="h-full min-h-0 py-7 pr-7">
        <ul className="list bg-white border border-stone-200 rounded-lg animate-pulse h-full overflow-auto divide-y divide-stone-200">
          <li className="p-4 pb-2 text-s opacity-60 tracking-wide sticky top-0 bg-white z-10">
            My Files
          </li>
          {Array.from({length: 8}).map((_, idx) => (
            <li key={idx} className="list-row px-7">
              <div className="list-col-grow">
                <div className="h-4 w-48 bg-stone-200 rounded mb-2" />
                <div className="h-3 w-32 bg-stone-200 rounded" />
              </div>
              <div className="h-6 w-6 bg-stone-200 rounded-full mr-3" />
              <div className="h-6 w-6 bg-stone-200 rounded-full" />
            </li>
          ))}
        </ul>
      </div>
    );

  if (files.length === 0)
    return (
      <div className="h-full min-h-0 py-7 pr-7">
        <ul className="list bg-white border border-stone-200 rounded-lg h-full overflow-auto divide-y divide-stone-200">
          <li className="p-4 pb-2 text-s opacity-60 tracking-wide sticky top-0 bg-white z-10">
            My Files
          </li>
          <li className="flex items-center justify-center pt-4">
            <div className="text-sm opacity-70">No Files yet.</div>
          </li>
        </ul>
      </div>
    );

  return (
    <div className="h-full min-h-0 py-7 pr-7">
      <ul className="list bg-white border border-stone-200 rounded-lg h-full overflow-auto divide-y divide-stone-200">
        <li className="p-4 pb-2 text-s opacity-60 tracking-wide sticky top-0 bg-white z-10">
          My Files
        </li>
        {files.map((f) => (
          <li key={f.id} className="list-row px-7">
            <div className="list-col-grow">
              <div>{f.original_name}</div>
              <div className="text-xs font-semibold opacity-60">
                Date: {new Date(f.created_at).toLocaleDateString()} • Size:{" "}
                {formatBytes(f.size_bytes)}
              </div>
            </div>
            <button
              className="flex btn btn-square btn-ghost"
              onClick={() => {
                window.open(`/api/files/${f.id}/download`, "_self");
              }}
              title="Download"
            >
              <Image
                src="/download.svg"
                alt="download"
                width={25}
                height={25}
              />
            </button>
            <button
              className="flex btn btn-square btn-ghost"
              onClick={() => setConfirmingId(f)}
              title="Delete"
            >
              <Image src="/delete.svg" alt="delete" width={25} height={25} />
            </button>
          </li>
        ))}
      </ul>

      {confirmingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white text-black rounded-xl shadow-2xl w-full max-w-md border border-stone-200">
            <div className="p-5 border-b border-stone-200 text-lg font-semibold">
              Confirm delete
            </div>
            <div className="p-5 space-y-3">
              <div className="text-sm opacity-80">
                Are you sure you want to delete:
              </div>
              <div className="text-sm font-semibold break-words">
                {confirmingId.original_name}
              </div>
            </div>
            <div className="p-5 flex gap-3 justify-end border-t border-stone-200">
              <button
                className={`btn btn-ghost${
                  deleting ? " pointer-events-none opacity-60" : ""
                }`}
                onClick={() => setConfirmingId(null)}
              >
                Cancel
              </button>
              <button
                className={`btn bg-red-500 hover:bg-red-600 text-white${
                  deleting ? " pointer-events-none opacity-70" : ""
                }`}
                onClick={async () => {
                  if (!confirmingId) return;
                  setDeleting(true);
                  try {
                    const res = await fetch(`/api/files/${confirmingId.id}`, {
                      method: "DELETE"
                    });
                    if (!res.ok) {
                      const err = await res.json().catch(() => ({}));
                      throw new Error(err?.error || "Failed to delete");
                    }
                    showSuccess("File deleted");
                    setConfirmingId(null);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("files:changed"));
                    }
                    await loadFiles();
                  } catch (e) {
                    console.error(e);
                    showError((e as Error).message);
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? "Loading..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Filelist;
