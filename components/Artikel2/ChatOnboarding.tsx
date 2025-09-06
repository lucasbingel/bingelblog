"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LumiIcon from "../../public/images/Lumi.png"; // Pfad zu deinem Bild

interface ChatOnboardingProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  exportButtonRef?: React.RefObject<HTMLButtonElement | null>;
  newChatButtonRef?: React.RefObject<HTMLButtonElement | null>;
  clearAllButtonRef?: React.RefObject<HTMLButtonElement | null>;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
  onFinish: () => void;
}

type TooltipPosition = "top" | "bottom" | "left" | "right" | { top: number; left: number } | null;

interface OnboardingStep {
  title: string;
  text: string;
  target: "inputRef" | "exportButtonRef" | "newChatButtonRef" | "clearAllButtonRef" | "closeButtonRef" | null;
  tooltipPosition?: TooltipPosition;
  offset?: number;
}

const onboardingSteps: OnboardingStep[] = [
  { title: "Willkommen bei Lumi!", text: "Ich zeige dir, wie du das Wiki durchsuchen und Chat-Funktionen nutzen kannst.", target: null },
  { title: "Eingabefeld", text: "Hier gibst du deine Frage ein, z.B. 'Urlaub beantragen'.", target: "inputRef", tooltipPosition: "top", offset: 80 },
  { title: "Exportieren", text: "Hier kannst du den Chat als Markdown exportieren.", target: "exportButtonRef", tooltipPosition: "left", offset: 12 },
  { title: "Neuer Chat", text: "Hier kannst du einen neuen Chat starten.", target: "newChatButtonRef", tooltipPosition: "left", offset: 0 },
  { title: "Alle Chats löschen", text: "Löscht alle bisherigen Chats.", target: "clearAllButtonRef", tooltipPosition: "left", offset: -80 },
  { title: "Schließen", text: "Hiermit schließt du den Chat.", target: "closeButtonRef", tooltipPosition: "left", offset: -80 },
  { title: "Onboarding beendet", text: "Perfekt! Du kennst jetzt alle Funktionen von Lumi und bist bereit. Viel Spaß beim Chaten!", target: null },
];

export default function ChatOnboarding({
  inputRef,
  exportButtonRef,
  newChatButtonRef,
  clearAllButtonRef,
  closeButtonRef,
  onFinish
}: ChatOnboardingProps) {
  const [step, setStep] = useState(0);
  const current = onboardingSteps[step];

  const nextStep = () => {
    if (step < onboardingSteps.length - 1) setStep(step + 1);
    else onFinish();
  };

  const skipStep = () => {
    onFinish();
  };

  const targetRef =
    current.target === "inputRef" ? inputRef :
    current.target === "exportButtonRef" ? exportButtonRef :
    current.target === "newChatButtonRef" ? newChatButtonRef :
    current.target === "clearAllButtonRef" ? clearAllButtonRef :
    current.target === "closeButtonRef" ? closeButtonRef :
    null;

  const [highlightPos, setHighlightPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setHighlightPos({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setHighlightPos(null);
    }
  }, [step, targetRef]);

  const tooltipStyle: React.CSSProperties = (() => {
    const offset = current.offset ?? 10;

    if (current.tooltipPosition && typeof current.tooltipPosition === "object") {
      return {
        position: "absolute",
        top: current.tooltipPosition.top,
        left: current.tooltipPosition.left,
        zIndex: 1001,
        maxWidth: "300px",
      };
    }

    if (highlightPos && current.tooltipPosition) {
      switch (current.tooltipPosition) {
        case "top":
          return { position: "absolute", top: highlightPos.top - offset - 100, left: highlightPos.left, zIndex: 1001, maxWidth: "300px" };
        case "bottom":
          return { position: "absolute", top: highlightPos.top + highlightPos.height + offset, left: highlightPos.left, zIndex: 1001, maxWidth: "300px" };
        case "left":
          return { position: "absolute", top: highlightPos.top, left: highlightPos.left - offset - 300, zIndex: 1001, maxWidth: "300px" };
        case "right":
          return { position: "absolute", top: highlightPos.top, left: highlightPos.left + highlightPos.width + offset, zIndex: 1001, maxWidth: "300px" };
        default:
          break;
      }
    }

    // Fallback: Bildschirmmitte
    return { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1001, maxWidth: "300px" };
  })();

  const isSpecialStep = step === 0 || step === onboardingSteps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-auto"
        style={{ background: highlightPos ? undefined : "rgba(0,0,0,0.3)" }}
      >
        {highlightPos && !isSpecialStep && (
          <>
            {/* Overlay rund ums Target */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: highlightPos.top, background: 'rgba(0,0,0,0.3)' }}/>
            <div style={{ position: 'absolute', top: highlightPos.top + highlightPos.height, left: 0, width: '100%', height: `calc(100% - ${highlightPos.top + highlightPos.height}px)`, background: 'rgba(0,0,0,0.3)' }}/>
            <div style={{ position: 'absolute', top: highlightPos.top, left: 0, width: highlightPos.left, height: highlightPos.height, background: 'rgba(0,0,0,0.3)' }}/>
            <div style={{ position: 'absolute', top: highlightPos.top, left: highlightPos.left + highlightPos.width, width: `calc(100% - ${highlightPos.left + highlightPos.width}px)`, height: highlightPos.height, background: 'rgba(0,0,0,0.3)' }}/>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "absolute", top: highlightPos.top - 4, left: highlightPos.left - 4, width: highlightPos.width + 8, height: highlightPos.height + 8, border: "2px solid #2563EB", borderRadius: "8px", pointerEvents: "none", zIndex: 1000 }}
            />
          </>
        )}

        <div style={tooltipStyle}>
          {isSpecialStep ? (
            <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 max-w-xl w-full">
              <img src={LumiIcon.src} alt="Lumi" className="w-32 h-32 rounded-full" />
              <h2 className="text-2xl font-bold">{current.title}</h2>
              <p className="text-sm text-slate-700">{current.text}</p>
              <div className="flex gap-4 mt-4">
                {step === 0 && <button onClick={skipStep} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-100">Überspringen</button>}
                <button onClick={nextStep} className="cursor-pointer px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800">{step === onboardingSteps.length - 1 ? "Fertig" : "Weiter →"}</button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 shadow-xl">
              <h2 className="text-lg font-bold mb-2">{current.title}</h2>
              <p className="text-sm mb-4">{current.text}</p>
              <button onClick={nextStep} className="cursor-pointer px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800">{step < onboardingSteps.length - 1 ? "Weiter →" : "Fertig"}</button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
