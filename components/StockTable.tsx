"use client";
import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { useRouter } from "next/navigation";
import useSWR from "swr";

interface Stock {
  symbol: string;
  shortName: string;
  regularMarketPrice: number | null;
  regularMarketChangePercent: number | null;
  dividend: number | null;
  nextDividend: string;
  type: string;
  sector: string;
  beta?: number | null;
  peRatio?: number | null;
  forwardPE?: number | null;
  enterpriseValue?: number | null;
  eps?: number | null;
  earningsDate?: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StockTable() {
  const { portfolio } = usePortfolio();
  const router = useRouter();
  const symbols = portfolio.map(p => p.symbol).join(",");
  const { data: stocks, error } = useSWR<Stock[]>(
    symbols ? `/api/stocks?symbols=${symbols}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (error) return <div>Fehler beim Laden der Aktien</div>;
  if (!stocks) return <div>Lade Aktien...</div>;

  return (
    <table className="min-w-full border border-gray-200 rounded-md bg-white">
      <thead className="bg-gray-100">
        <tr>
          <th>Symbol</th>
          <th>Name</th>
          <th>Preis (€)</th>
          <th>Δ %</th>
        </tr>
      </thead>
      <tbody>
        {stocks.map(s => (
          <tr key={s.symbol} className="hover:bg-gray-50 cursor-pointer"
            onDoubleClick={() => router.push(`/stocks/${s.symbol}`)}>
            <td>{s.symbol}</td>
            <td>{s.shortName}</td>
            <td>{s.regularMarketPrice?.toFixed(2) ?? "—"}</td>
            <td>{s.regularMarketChangePercent?.toFixed(2) ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
