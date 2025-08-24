"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { usePortfolio } from "../context/PortfolioContext";
import { useRouter } from "next/navigation";

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
  const { data: stocksData, error } = useSWR<Stock[]>(
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

  return (
    <div className="space-y-8">
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
    </div>
  );
}
