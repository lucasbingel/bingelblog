"use client";

//===================================================
// Explainer.tsx
//===================================================
// Explainer ist eine eigenständige Komponente, die eine Schritt-für-Schritt-Erklärung
// auf der Seite anzeigt. Die Logik greift auf die Refs der Elemente zu, um
// Tooltips und Highlights korrekt zu positionieren.
//===================================================

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LumiIcon from "../../public/images/Lumi.png"; // Beispielbild für Start/Ende

//#region Interfaces

/** Mögliche Positionen für Tooltips */
export type TooltipPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | { top: number; left: number } // absolute Position
  | null;

/** Ein Schritt im Explainer */
export interface ExplainerStep {
  title: string;          // Titel des Schrittes
  text: string;           // Beschreibungstext
  targetKey: string | null; // Key des Elements aus refs, das hervorgehoben werden soll
  tooltipPosition?: TooltipPosition; // Position des Tooltips relativ zum Highlight
  offset?: number;        // Abstand Tooltip ↔ Highlight
}

/** Props für den Explainer */
interface ExplainerProps {
  refs: Record<string, React.RefObject<HTMLElement | null>>; // Dictionary mit Element-Refs
  steps: ExplainerStep[];    // Liste der Schritte
  onFinish: () => void;      // Callback, wenn Explainer abgeschlossen ist
  startImage?: string;       // Bild für ersten Schritt
  endImage?: string;         // Bild für letzten Schritt
  warningText?: string;      // Text für roten Hinweis
  showWarning?: boolean;     // Steuerung der Sichtbarkeit des Warnhinweises
  warningTXTColor?: string;     // BGColor für Warnhinweis
  warningBGColor?: string;     // BGColor für Warnhinweis
  warningBorderColor?: string;     // BorderColor für Warnhinweis
}

//#endregion

//#region Explainer-Komponente
export default function Explainer({
  refs,
  steps,
  onFinish,
  startImage,
  endImage,
  warningText,
  showWarning,
  warningTXTColor,
  warningBGColor,
  warningBorderColor,
}: ExplainerProps) {

  //#region State
  const [step, setStep] = useState(0); // aktueller Schritt
  const current = steps[step];         // aktueller Step-Daten

  // Highlight Position für Tooltip/Overlay
  const [highlightPos, setHighlightPos] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  // Referenz des hervorgehobenen Elements
  const targetRef = current.targetKey ? refs[current.targetKey] : null;
  //#endregion

  //#region Navigation innerhalb des Explainers
  /** Weiter zum nächsten Schritt oder Explainer beenden */
  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onFinish();
  };

  /** Explainer direkt beenden */
  const skipStep = () => {
    onFinish();
  };
  //#endregion

  //#region Highlight Position aktualisieren
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
  //#endregion

  //#region Tooltip Style berechnen
  const tooltipStyle: React.CSSProperties = (() => {
    const offset = current.offset ?? 10;

    // absolute Positionierung falls Objekt angegeben
    if (current.tooltipPosition && typeof current.tooltipPosition === "object") {
      return {
        position: "absolute",
        top: current.tooltipPosition.top,
        left: current.tooltipPosition.left,
        zIndex: 1001,
        maxWidth: "300px",
      };
    }

    // Position relativ zum Highlight
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
      }
    }

    // Fallback: mittig auf dem Bildschirm
    return { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1001, maxWidth: "400px" };
  })();
  //#endregion

  //#region Prüfen ob Spezial-Step (Start oder Ende)
  const isSpecialStep = step === 0 || step === steps.length - 1;
  //#endregion

  //#region Render
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
        {/* Highlight Overlay um Ziel-Element */}
        {highlightPos && !isSpecialStep && (
          <>
            {/* oben */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: highlightPos.top, background: "rgba(0,0,0,0.3)" }} />
            {/* unten */}
            <div style={{ position: "absolute", top: highlightPos.top + highlightPos.height, left: 0, width: "100%", height: `calc(100% - ${highlightPos.top + highlightPos.height}px)`, background: "rgba(0,0,0,0.3)" }} />
            {/* links */}
            <div style={{ position: "absolute", top: highlightPos.top, left: 0, width: highlightPos.left, height: highlightPos.height, background: "rgba(0,0,0,0.3)" }} />
            {/* rechts */}
            <div style={{ position: "absolute", top: highlightPos.top, left: highlightPos.left + highlightPos.width, width: `calc(100% - ${highlightPos.left + highlightPos.width}px)`, height: highlightPos.height, background: "rgba(0,0,0,0.3)" }} />
            {/* blauer Rahmen */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                top: highlightPos.top - 4,
                left: highlightPos.left - 4,
                width: highlightPos.width + 8,
                height: highlightPos.height + 8,
                border: "2px solid #2563EB",
                borderRadius: "8px",
                pointerEvents: "none",
                zIndex: 1000
              }}
            />
          </>
        )}

        {/* Tooltip-Box */}
        <div style={tooltipStyle}>
          {isSpecialStep ? (
            // =========================
            // Spezial-Step: Start oder Ende
            // =========================
            <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 max-w-xl w-full">
              {/* Bild */}
              <img
                src={step === 0 ? startImage : endImage}
                alt="Onboarding Image"
                className="w-32 h-32 rounded-full"
              />

              {/* Titel & Text */}
              <h2 className="text-2xl font-bold">{current.title}</h2>
              <p className="text-sm text-slate-700">{current.text}</p>

              {/* Optionaler Warnhinweis */}
              {showWarning && (
                <div
                  className={`w-full rounded-lg border p-3 text-sm`}
                  style={{
                    color: warningTXTColor ?? "#B91C1C",
                    borderColor: warningBorderColor ?? "#B91C1C", // default rot
                    backgroundColor: warningBGColor ?? "#FEE2E2", // default hellrot
                  }}
                >
                  <span className="font-bold">Wichtig: </span>
                  {warningText}
                </div>
              )}

              {/* Navigation */}
              <div className="flex flex-col gap-2 mt-4 w-full">
                <div className="flex gap-4 justify-center">
                  {step === 0 && (
                    <button
                      onClick={skipStep}
                      className="px-2 py-1 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Überspringen
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="cursor-pointer px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800"
                  >
                    {step === steps.length - 1 ? "Fertig" : "Weiter →"}
                  </button>
                </div>
                {step === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Ca. {Math.ceil((steps.length * 15) / 60)} Minuten Dauer
                  </p>
                )}

              </div>
            </div>
          ) : (
            // =========================
            // Normale Steps
            // =========================
            <div className="bg-white rounded-xl p-4 shadow-xl flex flex-col">
              <div>
                <h2 className="text-lg font-bold mb-2">{current.title}</h2>
                <p className="text-sm mb-4">{current.text}</p>
              </div>
              <div className="flex justify-between items-center mt-auto">
                <div className="flex gap-2">
                  <button
                    onClick={nextStep}
                    className="cursor-pointer px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800"
                  >
                    {step < steps.length - 1 ? "Weiter" : "Fertig"}
                  </button>
                  <button
                    onClick={skipStep}
                    className="px-2 py-1 text-sm text-gray-500 hover:bg-red-100 rounded cursor-pointer"
                  >
                    Abbrechen
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {step}/{steps.length - 2}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
//#endregion
