"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react";

type ParsedTrade = {
  symbol: string;
  side: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  trade_date: string;
  market_type: string;
  instrument: string;
  trading_style: string;
  broker: string;
  strategy: string;
  tag: string;
};

export default function ImportPage() {
  const [fileName, setFileName] = useState("");
  const [parsedTrades, setParsedTrades] = useState<ParsedTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  function parseCSV(text: string) {
    const rows = text
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean);

    if (rows.length < 2) return [];

    const headers = rows[0].split(",").map((h) => clean(h));

    const data = rows.slice(1).map((row) => {
      const values = row.split(",").map((v) => v.replace(/"/g, "").trim());
      const obj: Record<string, string> = {};

      headers.forEach((header, index) => {
        obj[header] = values[index] || "";
      });

      return obj;
    });

    return data.map((row) => {
      const symbol =
        row["symbol"] ||
        row["tradingsymbol"] ||
        row["instrument"] ||
        row["scrip"] ||
        "UNKNOWN";

      const sideRaw = row["type"] || row["side"] || row["buy/sell"] || row["transactiontype"] || "BUY";

      const side = sideRaw.toUpperCase().includes("SELL") ? "SELL" : "BUY";

      const entry = Number(
        row["buy price"] ||
          row["entry price"] ||
          row["price"] ||
          row["average price"] ||
          row["avg price"] ||
          0
      );

      const exit = Number(
        row["sell price"] ||
          row["exit price"] ||
          row["price"] ||
          row["average price"] ||
          row["avg price"] ||
          0
      );

      const quantity = Math.abs(
        Number(row["quantity"] || row["qty"] || row["filled quantity"] || 1)
      );

      const pnl =
        Number(row["p&l"] || row["pnl"] || row["profit"] || row["net pnl"]) ||
        (exit - entry) * quantity * (side === "BUY" ? 1 : -1);

      const date =
        row["date"] ||
        row["trade date"] ||
        row["order execution time"] ||
        row["exchange timestamp"] ||
        new Date().toISOString().split("T")[0];

      return {
        symbol: symbol.toUpperCase(),
        side,
        entry_price: entry,
        exit_price: exit,
        quantity,
        pnl,
        trade_date: formatDate(date),
        market_type: detectMarket(symbol),
        instrument: detectInstrument(symbol),
        trading_style: "Intraday",
        broker: "Zerodha",
        strategy: "CSV Import",
        tag: "Zerodha",
      };
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("");
    setFileName(file.name);

    const text = await file.text();
    const trades = parseCSV(text);

    setParsedTrades(trades);
    setLoading(false);
  }

  async function importTrades() {
    if (parsedTrades.length === 0) return;

    setImporting(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      setImporting(false);
      return;
    }

    const payload = parsedTrades.map((trade) => ({
      user_id: user.id,
      ...trade,
      notes: "Imported from Zerodha CSV",
      risk: 0,
      reward: 0,
      rr_ratio: 0,
      emotion: "",
      mistake: "",
      setup: "",
      timeframe: "",
    }));

    const { error } = await supabase.from("trades").insert(payload);

    setImporting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(`${parsedTrades.length} trades imported successfully.`);
    setParsedTrades([]);
    setFileName("");
  }

  return (
    <div className="min-h-screen bg-[#070A0F] p-6 text-white">
      <div className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B111C] to-[#07130F] p-6">
        <p className="text-sm font-medium text-emerald-400">
          Zerodha CSV Import
        </p>
        <h1 className="mt-2 text-3xl font-bold">Import Trades</h1>
        <p className="mt-2 text-sm text-gray-400">
          Upload Zerodha Tradebook CSV and import trades automatically.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0B111C] p-6">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-500/30 bg-emerald-500/10 p-10 text-center hover:bg-emerald-500/15">
          <Upload className="h-10 w-10 text-emerald-400" />
          <p className="mt-4 text-lg font-semibold">Upload CSV File</p>
          <p className="mt-1 text-sm text-gray-400">
            Zerodha Tradebook CSV supported
          </p>

          <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
        </label>

        {fileName && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <FileText className="h-5 w-5 text-emerald-400" />
            <p className="text-sm text-gray-300">{fileName}</p>
          </div>
        )}

        {loading && <p className="mt-4 text-sm text-gray-400">Parsing CSV...</p>}

        {parsedTrades.length > 0 && (
          <>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.04] text-gray-400">
                  <tr>
                    <th className="px-4 py-3 text-left">Symbol</th>
                    <th className="px-4 py-3 text-left">Side</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Entry</th>
                    <th className="px-4 py-3 text-right">Exit</th>
                    <th className="px-4 py-3 text-right">P&L</th>
                  </tr>
                </thead>

                <tbody>
                  {parsedTrades.slice(0, 20).map((trade, index) => (
                    <tr key={index} className="border-t border-white/10">
                      <td className="px-4 py-3 font-medium text-white">
                        {trade.symbol}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{trade.side}</td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        {trade.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        ₹{trade.entry_price}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        ₹{trade.exit_price}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        ₹{trade.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={importTrades}
              disabled={importing}
              className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
            >
              {importing ? "Importing..." : `Import ${parsedTrades.length} Trades`}
            </button>
          </>
        )}

        {message && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            {message.includes("success") ? (
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400" />
            )}
            <p className="text-sm text-gray-300">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function clean(value: string) {
  return value.replace(/"/g, "").trim().toLowerCase();
}

function formatDate(value: string) {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return new Date().toISOString().split("T")[0];
  }

  return date.toISOString().split("T")[0];
}

function detectMarket(symbol: string) {
  const s = symbol.toUpperCase();

  if (s.includes("BANKNIFTY")) return "Bank Nifty";
  if (s.includes("NIFTY")) return "Nifty 50";
  if (s.includes("SENSEX")) return "Sensex";

  return "NSE Equity";
}

function detectInstrument(symbol: string) {
  const s = symbol.toUpperCase();

  if (s.includes("CE") || s.includes("PE")) return "Options";
  if (s.includes("FUT")) return "Futures";

  return "Equity";
}