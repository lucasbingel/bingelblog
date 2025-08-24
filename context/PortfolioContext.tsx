"use client";
import React, { createContext, useContext, useState } from "react";

interface PortfolioItem { symbol: string; shares: number; }
interface PortfolioContextType { portfolio: PortfolioItem[]; addStock: (s: PortfolioItem) => void; }

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  const addStock = (stock: PortfolioItem) => {
    setPortfolio(prev => {
      const existing = prev.find(p => p.symbol === stock.symbol.toUpperCase());
      if(existing) return prev.map(p => p.symbol === stock.symbol.toUpperCase() ? {...p, shares: p.shares + stock.shares} : p);
      return [...prev, {symbol: stock.symbol.toUpperCase(), shares: stock.shares}];
    });
  };

  return <PortfolioContext.Provider value={{portfolio, addStock}}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if(!context) throw new Error("usePortfolio muss innerhalb des Providers verwendet werden");
  return context;
};
