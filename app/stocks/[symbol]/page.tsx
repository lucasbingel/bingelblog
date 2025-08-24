"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface StockDetail {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  dividend: number | null;
  nextDividend: string;
  peRatio: number | null;
  lastTradeTime: string;
  type: string;
  sector: string;
  beta?: number | null;
  forwardPE?: number | null;
  enterpriseValue?: number | null;
  eps?: number | null;
  earningsDate?: string[];
  description?: string;
  history: { date: string; close: number }[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  const router = useRouter();
  const symbol = params.symbol;
  const [range, setRange] = useState<"1d" | "1wk" | "1mo" | "1y">("1mo");

  const { data, error } = useSWR<StockDetail>(`/api/stocks/${symbol}?range=${range}`, fetcher);

  if (error) return <div>Fehler beim Laden</div>;
  if (!data) return <div>Lade Daten...</div>;

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
        ← Zurück
      </button>

      <h1 className="text-3xl font-bold">{data.shortName} ({data.symbol})</h1>
      <div className="text-2xl font-semibold">
        {data.regularMarketPrice.toFixed(2)} € 
        <span className={data.regularMarketChangePercent > 0 ? "text-green-600" : "text-red-600"}>
          {data.regularMarketChangePercent >= 0 ? "+" : ""}{data.regularMarketChangePercent.toFixed(2)}%
        </span>
      </div>

      <div className="flex gap-2">
        {["1d","1wk","1mo","1y","5y","10y"].map(r => (
          <button key={r} className={`px-3 py-1 rounded ${range===r?"bg-blue-500 text-white":"bg-gray-200"}`} 
            onClick={()=>setRange(r as any)}>
            {r}
          </button>
        ))}
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="close" stroke="#1f77b4" strokeWidth={2} dot={{r:2}} activeDot={{r:5}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-bold mt-4">Beschreibung</h2>
        <p>{data.description}</p>
      </div>
    </div>
  );
}
