import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: Request, context: { params: Promise<{ symbol: string }> }) {
  try {
    // Warten auf die params-Promise
    const { symbol } = await context.params;
    if (!symbol) {
      return NextResponse.json(
        { error: "Kein Symbol angegeben" },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "1mo";

    let quote: any = {};
    let history: { date: string; close: number }[] = [];

    try {
      quote = await yahooFinance.quoteSummary(symbol, {
        modules: [
          "price",
          "summaryDetail",
          "defaultKeyStatistics",
          "calendarEvents",
          "assetProfile",
        ],
      });

      const hist = await yahooFinance.historical(symbol, {
        period1: new Date(Date.now() - getRangeMillis(range)),
        period2: new Date(),
        interval: getValidInterval(range),
      });

      history = hist.map((h: any) => ({
        date:
          range === "1d"
            ? new Date(h.date).toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date(h.date).toLocaleDateString("de-DE"),
        close: h.close,
      }));
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

    const lastTradeTime =
      typeof quote.price?.regularMarketTime === "number"
        ? new Date(quote.price.regularMarketTime * 1000).toLocaleDateString(
            "de-DE"
          )
        : "—";

    const peRatio =
      price && quote.defaultKeyStatistics?.trailingEps
        ? price / quote.defaultKeyStatistics.trailingEps
        : null;

    const earningsDate =
      quote.calendarEvents?.earnings?.earningsDate?.length > 0
        ? quote.calendarEvents.earnings.earningsDate
            .filter((d: any) => d)
            .map(
              (d: string | number | Date) =>
                new Date(d).toLocaleDateString("de-DE")
            )
        : [];

    return NextResponse.json({
      symbol,
      shortName: quote.price?.shortName ?? symbol,
      regularMarketPrice: price,
      regularMarketChangePercent: changePercent,
      dividend,
      nextDividend,
      peRatio,
      lastTradeTime,
      marketCap: quote.price?.marketCap ?? null,
      type: quote.assetProfile?.industry ? "Aktie" : "ETF",
      sector: quote.assetProfile?.sector ?? "—",
      beta: quote.defaultKeyStatistics?.beta ?? null,
      forwardPE: quote.summaryDetail?.forwardPE ?? null,
      enterpriseValue: quote.defaultKeyStatistics?.enterpriseValue ?? null,
      eps: quote.defaultKeyStatistics?.trailingEps ?? null,
      earningsDate,
      description: quote.assetProfile?.longBusinessSummary ?? "—",
      history,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Daten" },
      { status: 500 }
    );
  }
}

function getRangeMillis(range: string) {
  switch (range) {
    case "1d":
      return 24 * 60 * 60 * 1000;
    case "1wk":
      return 7 * 24 * 60 * 60 * 1000;
    case "1mo":
      return 30 * 24 * 60 * 60 * 1000;
    case "1y":
      return 365 * 24 * 60 * 60 * 1000;
    case "5y":
      return 5 * 365 * 24 * 60 * 60 * 1000;
    case "10y":
      return 10 * 365 * 24 * 60 * 60 * 1000;
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}

function getValidInterval(range: string): "1d" | "1wk" | "1mo" {
  switch (range) {
    case "1d":
      return "1d";   // Tageswerte
    case "1wk":
      return "1d";   // Wochendaten: täglich für kurze Zeiträume
    case "1mo":
      return "1d";   // Monatsdaten: täglich
    case "1y":
      return "1wk";  // Jahresdaten: Wochenwerte
    case "5y":
    case "10y":
      return "1mo";  // 5 oder 10 Jahre: Monatswerte
    default:
      return "1d";
  }
}

