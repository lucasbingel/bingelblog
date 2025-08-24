"use client";
import React, { useState, useEffect } from "react";
import { usePortfolio } from "../../context/PortfolioContext";

interface PortfolioItem {
  symbol: string;
  shares: number;
}

export default function PortfolioPage() {
  const { portfolio, addStock } = usePortfolio();
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState<number>(0);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Simuliertes Vorschlagsarray – später API für WKN/Ticker
  const allSymbols = ["AAPL", "TSLA", "MSFT", "GOOG", "AMZN", "NFLX", "NVDA"];

  const handleAddOrEdit = () => {
    if (!symbol || shares <= 0) return;
    if (editIndex !== null) {
      // edit
      portfolio[editIndex].symbol = symbol.toUpperCase();
      portfolio[editIndex].shares = shares;
      setEditIndex(null);
    } else {
      addStock({ symbol, shares });
    }
    setSymbol("");
    setShares(0);
  };

  const handleEdit = (index: number) => {
    setSymbol(portfolio[index].symbol);
    setShares(portfolio[index].shares);
    setEditIndex(index);
  };

  const handleDelete = (index: number) => {
    portfolio.splice(index, 1);
    // force refresh
    setSymbol("");
    setShares(0);
  };

  useEffect(() => {
    if (symbol.length > 0) {
      const filtered = allSymbols.filter(s => s.startsWith(symbol.toUpperCase()));
      setSuggestions(filtered);
    } else setSuggestions([]);
  }, [symbol]);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="bg-blue-50 rounded-md p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
          <p className="text-gray-700">
            Hier kannst du deine Aktien hinzufügen, Anteile verwalten und dein gesamtes Portfolio im Blick behalten.
          </p>
        </div>
        <div className="md:w-1/2">
          <img src="/portfolio-illustration.svg" alt="Portfolio" className="w-full h-auto" />
        </div>
      </section>

      {/* Tabelle */}
      <section className="bg-white shadow rounded-md p-4">
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="WKN/Ticker"
              className="border p-2 rounded w-40"
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
            />
            {suggestions.length > 0 && (
              <ul className="absolute bg-white border rounded w-40 mt-1 max-h-40 overflow-auto z-10">
                {suggestions.map((s, idx) => (
                  <li
                    key={idx}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setSymbol(s)}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            type="number"
            placeholder="Anteile"
            className="border p-2 rounded w-24"
            value={shares}
            step={0.01}
            onChange={e => setShares(Number(e.target.value))}
          />
          <button
            onClick={handleAddOrEdit}
            className="bg-blue-600 text-white p-2 rounded"
          >
            {editIndex !== null ? "Speichern" : "Hinzufügen"}
          </button>
        </div>

        <table className="min-w-full border border-gray-200 rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">Symbol</th>
              <th className="p-2 border text-right">Anteile</th>
              <th className="p-2 border text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 text-center">
                <td className="p-2 border text-left">{item.symbol}</td>
                <td className="p-2 border text-right">{item.shares}</td>
                <td className="p-2 border text-right space-x-2">
                  <button
                    className="bg-yellow-400 text-white px-2 py-1 rounded"
                    onClick={() => handleEdit(idx)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(idx)}
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
