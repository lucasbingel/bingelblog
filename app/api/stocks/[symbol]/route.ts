import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(
  req: Request,
  context: { params: { symbol: string } }
) {
  try {
    const { symbol } = context.params;
    if (!symbol)
      return NextResponse.json(
        { error: "Kein Symbol angegeben" },
        { status: 400 }
      );

    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "1mo";

    let quote: any = {};
    let history: { date: string; close: number }[] = [];

    try {
      // QuoteSummary
      quote = await yahooFinance.quoteSummary(symbol, {
        modules: [
          "price",
          "summaryDetail",
          "defaultKeyStatistics",
          "calendarEvents",
          "assetProfile",
        ],
      });

      // Historische Daten über 'historical' mit passendem Intervall
      const interval = getIntervalForRange(range);
      const hist = await yahooFinance.historical(symbol, {
        period1: new Date(Date.now() - getRangeMillis(range)),
        period2: new Date(),
        interval,
      });

      history = hist.map((h: any) => ({
        date:
          range === "1d" || range === "1wk"
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
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}

// Intervall passend zum Zeitraum
function getIntervalForRange(range: string): "1d" | "1wk" | "1mo" | "5m" | "1h" {
  switch (range) {
    case "1d":
      return "5m"; // 5 Minuten
    case "1wk":
      return "1h"; // 1 Stunde
    case "1mo":
    case "1y":
    case "5y":
    default:
      return "1d"; // Tagesdaten
  }
}
