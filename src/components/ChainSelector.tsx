import React from "react";

interface ChainSelectorProps {
  label: string;
  value: string;
  isDisabled?: boolean;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  label,
  value,
  isDisabled = true,
}) => (
  <div className="mb-4">
    <label className="block mb-1 font-semibold">{label}</label>
    <select
      value={value}
      disabled={isDisabled}
      className="w-full  bg-white dark:bg-zinc-900 text-black dark:text-white border px-3 py-2 rounded"
    >
      <option value={value}>
        {value === "1" ? "Ethereum Sepolia" : "Polygon Mumbai"}
      </option>
    </select>
  </div>
);
