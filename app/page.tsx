"use client";

import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { usePortfolio } from "../context/PortfolioContext";
import { useRouter } from "next/navigation";
import ArticleTable from "@/components/Artikel/ArtikelTable";
import { getArticles } from "@/lib/articles";

interface Stock {
  symbol: string;
  shortName: string;
  regularMarketPrice: number | null;
  regularMarketChangePercent: number | null;
  dividend: number | null;
  nextDividend: string;
  lastTradeTime: string;
  peRatio: number | null;
  marketCap: number | null;
  type: string;
  sector: string;
  beta?: number | null;
  forwardPE?: number | null;
  enterpriseValue?: number | null;
  eps?: number | null;
  earningsDate?: string[];
  description?: string;
  shares?: number;
  marketValue?: number;
  divYield?: number | null;
}

type SortKey = keyof Stock | null;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StockTable() {
  const { portfolio } = usePortfolio();
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const [filterSymbol, setFilterSymbol] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSector, setFilterSector] = useState("");

  const symbols = portfolio.map((p) => p.symbol).join(",");
  const { data: stocksData } = useSWR<Stock[]>(
    symbols ? `/api/stocks?symbols=${symbols}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const stocks = (stocksData || []).map((s) => {
    const shares = portfolio.find((p) => p.symbol === s.symbol)?.shares ?? 0;
    const price = s.regularMarketPrice ?? 0;
    const marketValue = price * shares;
    const divYield =
      s.dividend !== null && price ? (s.dividend / price) * 100 : null;
    return { ...s, shares, marketValue, divYield };
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedStocks = [...stocks]
    .filter(
      (s) =>
        s.symbol.toLowerCase().includes(filterSymbol.toLowerCase()) &&
        s.shortName.toLowerCase().includes(filterName.toLowerCase()) &&
        s.type.toLowerCase().includes(filterType.toLowerCase()) &&
        s.sector.toLowerCase().includes(filterSector.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === "number" && typeof bVal === "number")
        return sortAsc ? aVal - bVal : bVal - aVal;
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const totalValue = stocks.reduce((acc, s) => acc + (s.marketValue ?? 0), 0);

  const getKGVClass = (pe: number | null) => {
    if (!pe) return "";
    if (pe < 10) return "bg-green-100 text-green-800";
    if (pe > 25) return "bg-red-100 text-red-800";
    return "";
  };

  const getDivYieldClass = (yieldPercent: number | null) => {
    if (yieldPercent === null) return "";
    if (yieldPercent >= 4) return "bg-green-100 text-green-800";
    if (yieldPercent <= 2) return "bg-red-100 text-red-800";
    return "";
  };

  const getChangeClass = (change: number | null) => {
    if (change === null) return "";
    if (change > 2) return "bg-green-50 text-green-700";
    if (change < -2) return "bg-red-50 text-red-700";
    return "";
  };

  // Fade-In/Fade-Out Refs
  const fadeRef = useRef<HTMLDivElement>(null);
  const [fadeVisible, setFadeVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setFadeVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (fadeRef.current) observer.observe(fadeRef.current);
    return () => {
      if (fadeRef.current) observer.unobserve(fadeRef.current);
    };
  }, []);

  // Scroll Offset für Parallax
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const handleScroll = () => setOffset(window.pageYOffset);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ParallaxCircle = ({
    size,
    color,
    top,
    left,
    speed,
  }: {
    size: number;
    color: string;
    top: number;
    left: number;
    speed: number;
  }) => (
    <div
      className="absolute rounded-full opacity-100 z-1"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        top,
        left,
        transform: `translateY(${offset * speed}px)`,
      }}
    />
  );


//   //
//   const ParallaxCircle2 = ({
//   size,
//   color,
//   startX,
//   startY,
//   endX,
//   endY,
//   scrollRange,
// }: {
//   size: number;
//   color: string;
//   startX: number;
//   startY: number;
//   endX: number;
//   endY: number;
//   scrollRange: number;
// }) => {
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (!ref.current) return;

//       const rect = ref.current.parentElement?.getBoundingClientRect();
//       if (!rect) return;

//       // Berechne progress relativ zum Div
//       const progress = Math.min(Math.max((window.innerHeight - rect.top) / scrollRange, 0), 1);

//       const x = startX + (endX - startX) * progress;
//       const y = startY + (endY - startY) * progress;

//       ref.current.style.transform = `translate(${x}px, ${y}px)`;
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     handleScroll(); // initial setzen
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [startX, startY, endX, endY, scrollRange]);

//   return (
//     <div
//       ref={ref}
//       className="absolute rounded-full"
//       style={{
//         width: size,
//         height: size,
//         backgroundColor: color,
//       }}
//     />
//   );
// };

const ParallaxCircle2 = ({
  size,
  color,
  startX,
  startY,
  endX,
  endY,
  scrollRange,
}: {
  size: number;
  color: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  scrollRange: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  useEffect(() => {
    // initial setzen
    if (ref.current) {
      ref.current.style.transform = `translate(${startX}px, ${startY}px)`;
    }

    const updatePosition = () => {
      if (!ref.current) return;

      const rect = ref.current.parentElement?.getBoundingClientRect();
      if (!rect) return;

      const progress = Math.min(
        Math.max((window.innerHeight - rect.top) / scrollRange, 0),
        1
      );

      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;

      ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updatePosition);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updatePosition(); // initial setzen

    return () => window.removeEventListener("scroll", handleScroll);
  }, [startX, startY, endX, endY, scrollRange]);

  return (
    <div
      ref={ref}
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        willChange: "transform",
      }}
    />
  );
};


const ParallaxText = ({
  heading,
  text,
  startX,
  startY,
  endX,
  endY,
  scrollRange,
}: {
  heading: string;
  text: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  scrollRange: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
    }

    const updatePosition = () => {
      if (!ref.current) return;

      const rect = ref.current.parentElement?.getBoundingClientRect();
      if (!rect) return;

      const progress = Math.min(
        Math.max((window.innerHeight - rect.top) / scrollRange, 0),
        1
      );

      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;

      ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updatePosition);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updatePosition();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [startX, startY, endX, endY, scrollRange]);

  return (
    <div
      ref={ref}
      className="absolute flex flex-col items-center text-center will-change-transform"
    >
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-black">
        {heading}
      </h1>
      <p className="text-base md:text-lg text-black-200 ">
        {text}
      </p>
    </div>
  );
};







// Container-Ref erstellen
const containerRef = useRef<HTMLDivElement>(null);
  

  return (
    <div className="space-y-8 mx-12 p-4">
      {/* Hero Section */}
      <section className="bg-green-50 rounded-md p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Dein Portfolio im Blick
          </h1>
          <p className="text-gray-700 mb-6">
            Verfolge Kurse, Marktwerte, Dividenden und Kennzahlen deiner Aktien
            und ETFs – alles live und übersichtlich.
          </p>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Jetzt starten
          </button>
        </div>
        <div className="md:w-1/2">
          <img
            src="/images/Lucas.jpg"
            alt="Portfolio Dashboard Illustration"
            className="w-50 h-50"
          />
        </div>
      </section>

      {/* Gesamtvermögen */}
      <div className="flex justify-between items-center bg-green-100 p-4 rounded-md">
        <h2 className="text-xl font-bold">
          Gesamtvermögen: {totalValue.toFixed(2)} €
        </h2>
      </div>

      {/* Filter Inputs */}
      <div className="flex gap-2 flex-wrap mb-2">
        <input
          placeholder="Symbol"
          value={filterSymbol}
          onChange={(e) => setFilterSymbol(e.target.value)}
          className="p-1 border rounded"
        />
        <input
          placeholder="Name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="p-1 border rounded"
        />
        <input
          placeholder="Typ"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-1 border rounded"
        />
        <input
          placeholder="Branche"
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
          className="p-1 border rounded"
        />
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              {[
                { label: "Symbol", key: "symbol" },
                { label: "Name", key: "shortName" },
                { label: "Preis (€)", key: "regularMarketPrice" },
                { label: "Δ %", key: "regularMarketChangePercent" },
                { label: "Anteile", key: "shares" },
                { label: "Marktwert (€)", key: "marketValue" },
                { label: "Dividende", key: "dividend" },
                { label: "Nächste Dividende", key: "nextDividend" },
                { label: "KGV", key: "peRatio" },
                { label: "Typ", key: "type" },
                { label: "Branche", key: "sector" },
                { label: "Beta", key: "beta" },
                { label: "EPS", key: "eps" },
                { label: "Forward PE", key: "forwardPE" },
                { label: "Enterprise Value", key: "enterpriseValue" },
                { label: "Earnings-Date", key: "earningsDate" },
                { label: "Letzter Trade", key: "lastTradeTime" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key as SortKey)}
                  className="p-2 border text-left cursor-pointer"
                >
                  {col.label} {sortKey === col.key ? (sortAsc ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td
                  colSpan={17}
                  className="p-4 text-center text-gray-500"
                >
                  Keine Aktien im Portfolio
                </td>
              </tr>
            ) : (
              sortedStocks.map((s) => (
                <tr
                  key={s.symbol}
                  className="hover:bg-gray-50 text-center cursor-pointer"
                  onDoubleClick={() => router.push(`/stocks/${s.symbol}`)}
                >
                  <td className="p-2 border text-left">{s.symbol}</td>
                  <td className="p-2 border text-left">{s.shortName}</td>
                  <td className="p-2 border text-right">
                    {s.regularMarketPrice?.toFixed(2) ?? "—"}
                  </td>
                  <td
                    className={`p-2 border text-right ${getChangeClass(
                      s.regularMarketChangePercent
                    )}`}
                  >
                    {s.regularMarketChangePercent !== null
                      ? (s.regularMarketChangePercent >= 0 ? "+" : "") +
                        s.regularMarketChangePercent.toFixed(2)
                      : "—"}
                  </td>
                  <td className="p-2 border text-right">{s.shares?.toFixed(2) ?? "—"}</td>
                  <td className="p-2 border text-right">{s.marketValue?.toFixed(2) ?? "—"}</td>
                  <td className={`p-2 border text-right ${getDivYieldClass(s.divYield)}`}>
                    {s.dividend?.toFixed(2) ?? "—"}
                  </td>
                  <td className="p-2 border text-center">{s.nextDividend}</td>
                  <td className={`p-2 border text-right ${getKGVClass(s.peRatio)}`}>
                    {s.peRatio?.toFixed(2) ?? "—"}
                  </td>
                  <td className="p-2 border text-center">{s.type}</td>
                  <td className="p-2 border text-center">{s.sector}</td>
                  <td className="p-2 border text-right">{s.beta?.toFixed(2) ?? "—"}</td>
                  <td className="p-2 border text-right">{s.eps?.toFixed(2) ?? "—"}</td>
                  <td className="p-2 border text-right">{s.forwardPE?.toFixed(2) ?? "—"}</td>
                  <td className="p-2 border text-right">{s.enterpriseValue?.toLocaleString() ?? "—"}</td>
                  <td className="p-2 border text-center">{s.earningsDate?.join(", ") ?? "—"}</td>
                  <td className="p-2 border text-center">{s.lastTradeTime}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Artikeltabelle */}
      <ArticleTable data={getArticles()} />

      {/* Fade-In von unten */}
      <div
        ref={fadeRef}
        className={`transition-all duration-700 transform ${
          fadeVisible
            ? "opacity-100 translate-x-0"
            : "-translate-x-96 opacity-0"
        } bg-blue-200 p-8 mt-10 rounded-lg text-center`}
      >
        Ich fade von der Seite beim Scrollen rein!
      </div>

      {/* Multi-Layer Parallax */}
      <div className="relative h-150 overflow-hidden bg-gray-800">
        <div
          className="absolute inset-0 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: "url('/images/Lucas.jpg')" }}
        />
        <h2 className="relative text-white text-4xl text-center pt-96 font-bold">
          Parallax Multi-Layer
        </h2>
      </div>


      <div className="h-30"/>
      
      {/* Multi-Layer Parallax mit 3 Punkten und Bild in der Mitte */}
      {/* Multi-Layer Parallax mit festen Bild in der Mitte */}
      {/* Parallax-Punkte um ein normales Bild */}
      <div className="relative h-[120vh] flex items-center justify-center">
        {/* Wrapper für Bild + Kreise */}
        <div className="relative flex items-center justify-center">

              {/* Parallax-Kreise */}
          <ParallaxCircle size={60} color="lightblue" top={-40} left={-80} speed={0.008} />
          <ParallaxCircle size={90} color="steelblue" top={-30} left={550} speed={0.08} />
          <ParallaxCircle size={120} color="skyblue" top={20} left={-30} speed={0.1} />

          {/* Zentrales Bild */}
          <img
            src="/images/Muslim.png"
            alt="Zentrales Bild"
            className="w-100 h-100"
          />


        </div>
      </div>

      <div className="h-50"/>


      <div className="relative h-[150vh] flex items-center justify-center overflow-hidden will-change-transform">

  {/* Wrapper für Bild + Kreise */}
<div
  ref={containerRef}
  className="relative h-[120vh] flex items-center justify-center "
>
{/* Linke Texte */}
<ParallaxText
  heading="Value Investing"
  text="Langfristig investieren mit stabilen Dividenden"
  startX={-1600}
  startY={-80}
  endX={-250}
  endY={0}
  scrollRange={800}
/>
<ParallaxText
  heading="ETF-Strategie"
  text="Breit gestreut und sicher anlegen"
  startX={-1600}
  startY={0}
  endX={-250}
  endY={100}
  scrollRange={900}
/>
<ParallaxText
  heading="Stock Picking"
  text="Chancen in Einzelwerten entdecken"
  startX={-1600}
  startY={60}
  endX={-250}
  endY={200}
  scrollRange={1000}
/>

{/* Rechte Texte */}
<ParallaxText
  heading="Technologie"
  text="Innovationen mit Zukunftspotenzial"
  startX={1600}
  startY={-80}
  endX={300}
  endY={0}
  scrollRange={800}
/>
<ParallaxText
  heading="Nachhaltigkeit"
  text="Grün investieren für die nächste Generation"
  startX={1600}
  startY={0}
  endX={300}
  endY={100}
  scrollRange={900}
/>
<ParallaxText
  heading="Wachstum"
  text="Setze auf dynamische Märkte"
  startX={1600}
  startY={60}
  endX={300}
  endY={200}
  scrollRange={1000}
/>

  {/* Zentrales Bild */}
  <img
    src="/images/Muslim.png"
    alt="Zentrales Bild"
    className="w-100 h-100 rounded-full z-10"
  />
</div>

</div>



      <div className="h-50"/>
      <div className="h-50"/>

    </div>
  );
}
