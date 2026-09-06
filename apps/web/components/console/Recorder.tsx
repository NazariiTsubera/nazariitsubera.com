"use client";

import { useRef, useState } from "react";

import { post, uploadFile } from "./api";

type Props = { vendorId: string; captureId: string | null; prompt: string | null };

const MAX_SECONDS = 15 * 60;

/** Picks a container the device actually supports; iOS gives mp4, everything else webm. */
function pickMimeType(): string {
  for (const type of ["audio/webm", "audio/mp4"]) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
  }
  return "audio/webm";
}

export function Recorder({ vendorId, captureId, prompt }: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<string | null>(captureId ? "Recording saved" : null);
  const [error, setError] = useState<string | null>(null);
  const [operatorPrompt, setOperatorPrompt] = useState(prompt ?? "");
  const [currentCaptureId, setCurrentCaptureId] = useState(captureId);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        stopTimer();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setStatus("Uploading…");
        try {
          const { id } = await uploadFile(vendorId, "capture", blob, mimeType, { durationSec: seconds });
          setCurrentCaptureId(id);
          setStatus("Recording saved");
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
          setStatus(null);
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((value) => {
          if (value + 1 >= MAX_SECONDS) void stop();
          return value + 1;
        });
      }, 1000);
    } catch {
      setError("Microphone permission is required to record.");
    }
  }

  async function stop() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  async function savePrompt() {
    if (!currentCaptureId) return;
    try {
      await post("/api/console/captures", { id: currentCaptureId, operatorPrompt: operatorPrompt || null });
      setStatus("Notes saved");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save notes");
    }
  }

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-xl">Conversation</h2>
      <button
        type="button"
        onClick={recording ? stop : start}
        className={`min-h-14 rounded-lg px-4 text-base font-medium ${
          recording ? "bg-magenta-ink text-white" : "bg-ink text-on-dark"
        }`}
      >
        {recording ? `Stop recording · ${mmss}` : currentCaptureId ? "Record again" : "Start recording"}
      </button>
      {status ? <p className="text-sm text-mono">{status}</p> : null}
      {error ? <p className="text-sm text-magenta-ink">{error}</p> : null}

      <label className="flex flex-col gap-1 text-sm">
        Notes for the design
        <textarea
          value={operatorPrompt}
          onChange={(e) => setOperatorPrompt(e.target.value)}
          onBlur={savePrompt}
          rows={3}
          placeholder="Anything the recording missed, or how it should feel."
          className="w-full rounded-lg border border-ink/20 bg-white p-3 text-base"
        />
      </label>
    </section>
  );
}
