"use client";

type TradeFiltersProps = {
  symbolFilter: string;
  setSymbolFilter: (value: string) => void;

  strategyFilter: string;
  setStrategyFilter: (value: string) => void;

  tagFilter: string;
  setTagFilter: (value: string) => void;

  resultFilter: string;
  setResultFilter: (value: string) => void;
};

export default function TradeFilters({
  symbolFilter,
  setSymbolFilter,
  strategyFilter,
  setStrategyFilter,
  tagFilter,
  setTagFilter,
  resultFilter,
  setResultFilter,
}: TradeFiltersProps) {
  function clearFilters() {
    setSymbolFilter("");
    setStrategyFilter("");
    setTagFilter("");
    setResultFilter("all");
  }

  return (
    <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <input
          value={symbolFilter}
          onChange={(e) => setSymbolFilter(e.target.value)}
          placeholder="Search symbol"
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />

        <input
          value={strategyFilter}
          onChange={(e) => setStrategyFilter(e.target.value)}
          placeholder="Strategy"
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />

        <input
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          placeholder="Tag"
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />

        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Results</option>
          <option value="win">Wins</option>
          <option value="loss">Losses</option>
        </select>

        <button
          onClick={clearFilters}
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}