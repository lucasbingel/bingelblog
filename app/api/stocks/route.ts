// app/api/stocks/route.ts
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const symbols = url.searchParams.get("symbols")?.split(",") || [];
    if (symbols.length === 0) return NextResponse.json([]);

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        let quote: any = {};
        try {
          quote = await yahooFinance.quoteSummary(symbol, {
            modules: ["price", "summaryDetail", "defaultKeyStatistics", "calendarEvents", "assetProfile"],
          });
        } catch (e) {
          console.warn(`Fehler bei Symbol ${symbol}:`, e);
        }

        const price = quote.price?.regularMarketPrice ?? 0;
        const prevClose = quote.price?.regularMarketPreviousClose ?? 0;
        const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
        const dividend = quote.summaryDetail?.dividendRate ?? null;

        const nextDividend =
          quote.calendarEvents?.dividendDate instanceof Date
            ? new Date(quote.calendarEvents.dividendDate).toLocaleDateString("de-DE")
            : "—";

        return {
          symbol,
          shortName: quote.price?.shortName ?? symbol,
          regularMarketPrice: price,
          regularMarketChangePercent: changePercent,
          dividend,
          nextDividend,
          peRatio: price && quote.defaultKeyStatistics?.trailingEps
            ? price / quote.defaultKeyStatistics.trailingEps
            : null,
          lastTradeTime: typeof quote.price?.regularMarketTime === "number"
            ? new Date(quote.price.regularMarketTime * 1000).toLocaleDateString("de-DE")
            : "—",
          type: quote.assetProfile?.industry ? "Aktie" : "ETF",
          sector: quote.assetProfile?.sector ?? "—",
          beta: quote.defaultKeyStatistics?.beta ?? null,
          forwardPE: quote.summaryDetail?.forwardPE ?? null,
          enterpriseValue: quote.defaultKeyStatistics?.enterpriseValue ?? null,
          eps: quote.defaultKeyStatistics?.trailingEps ?? null,
        };
      })
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Fehler beim Abrufen der Daten" }, { status: 500 });
  }
}
