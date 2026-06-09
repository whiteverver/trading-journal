"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RecentTrades({
  trades,
}: {
  trades: any[];
}) {
  return (
    <div className="border rounded-xl p-4 mt-6">
      <h2 className="text-xl font-bold mb-4">
        Recent Trades
      </h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>PnL</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>{trade.symbol}</TableCell>
              <TableCell>{trade.side}</TableCell>
              <TableCell>${trade.pnl}</TableCell>
              <TableCell>{trade.notes || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}