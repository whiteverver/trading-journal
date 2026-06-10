"use client";

import { saveAs } from "file-saver";

export default function ExportTradesButton({ trades }: any) {
  function exportCSV() {
    const headers = Object.keys(trades[0]).join(",");

    const rows = trades.map((trade: any) =>
      Object.values(trade).join(",")
    );

    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(blob, "trades.csv");
  }

  return (
    <button
      onClick={exportCSV}
      className="rounded-md border px-4 py-2"
    >
      Export CSV
    </button>
  );
}