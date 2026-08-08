"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type VoiceInputStatus =
  | "idle"
  | "requesting-permission"
  | "recording"
  | "completed"
  | "error"
  | "unsupported";

interface UseVoiceInputOptions {
  /** Called whenever the transcription text changes (interim + final). */
  onTranscript: (text: string) => void;
  /** Called when recognition stops and a final transcript is ready. */
  onComplete?: (text: string) => void;
  /** Language tag, e.g. "en-US" */
  lang?: string;
}

interface UseVoiceInputReturn {
  status: VoiceInputStatus;
  isRecording: boolean;
  isSupported: boolean;
  errorMessage: string | null;
  elapsedSeconds: number;
  toggle: () => void;
  stop: () => void;
}

// ─── SpeechRecognition factory ────────────────────────────────────────────────

function createRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const Ctor: (new () => SpeechRecognition) | undefined =
    w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return !!(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVoiceInput({
  onTranscript,
  onComplete,
  lang = "en-US",
}: UseVoiceInputOptions): UseVoiceInputReturn {
  const supported = isSpeechSupported();

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accumulatedRef = useRef<string>(""); // Committed final segments
  const finalTranscriptRef = useRef<string>("");
  const isActiveRef = useRef<boolean>(false); // Whether we intentionally started

  const [status, setStatus] = useState<VoiceInputStatus>(
    supported ? "idle" : "unsupported"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isRecording = status === "recording";

  // ── Timer helpers ─────────────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Stop ─────────────────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    isActiveRef.current = false;
    recognitionRef.current?.stop();
    stopTimer();
    setStatus("idle");
  }, [stopTimer]);

  // ── Start ─────────────────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    if (!supported) return;

    setStatus("requesting-permission");
    setErrorMessage(null);
    accumulatedRef.current = "";
    finalTranscriptRef.current = "";

    // Probe microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setStatus("error");
      setErrorMessage(
        "Microphone access was denied. Please allow mic access in your browser settings."
      );
      return;
    }

    const recognition = createRecognition();
    if (!recognition) {
      setStatus("error");
      setErrorMessage("Could not initialize speech recognition.");
      return;
    }

    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus("recording");
      startTimer();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let newFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (newFinal) accumulatedRef.current += newFinal;
      const combined = accumulatedRef.current + interim;
      finalTranscriptRef.current = combined;
      onTranscript(combined.trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        stopTimer();
        isActiveRef.current = false;
        setStatus("error");
        setErrorMessage(
          "Microphone access was denied. Please allow mic access in your browser settings."
        );
      } else if (event.error === "no-speech") {
        // User paused — keep recording, don't change state
      } else if (event.error === "aborted") {
        stopTimer();
        setStatus("idle");
      } else {
        stopTimer();
        isActiveRef.current = false;
        setStatus("error");
        setErrorMessage(`Recognition error: ${event.error}. Please try again.`);
      }
    };

    recognition.onend = () => {
      // If we intentionally stopped, stay idle — already handled in stop()
      if (!isActiveRef.current) return;

      // Browser ended due to silence — restart to maintain continuous mode
      try {
        recognition.start();
        stopTimer();
        startTimer();
      } catch {
        // Can't restart (e.g. tab backgrounded)
        stopTimer();
        isActiveRef.current = false;
        setStatus("completed");
        onComplete?.(finalTranscriptRef.current.trim());
      }
    };

    recognitionRef.current = recognition;
    isActiveRef.current = true;

    try {
      recognition.start();
    } catch {
      setStatus("error");
      setErrorMessage(
        "Could not start speech recognition. Please refresh and try again."
      );
    }
  }, [supported, lang, onTranscript, onComplete, startTimer, stopTimer]);

  // Override stop to also fire onComplete
  const stopAndComplete = useCallback(() => {
    isActiveRef.current = false;
    recognitionRef.current?.stop();
    stopTimer();
    setStatus("idle");
    const final = finalTranscriptRef.current.trim();
    if (final) onComplete?.(final);
  }, [stopTimer, onComplete]);

  const toggle = useCallback(() => {
    if (isRecording) {
      stopAndComplete();
    } else {
      start();
    }
  }, [isRecording, start, stopAndComplete]);

  // ── Cleanup ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      recognitionRef.current?.stop();
      stopTimer();
    };
  }, [stopTimer]);

  return {
    status,
    isRecording,
    isSupported: supported,
    errorMessage,
    elapsedSeconds,
    toggle,
    stop: stopAndComplete,
  };
}
