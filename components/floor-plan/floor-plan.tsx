"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { Table, Section } from "@prisma/client";

interface FloorPlanProps {
  sections: (Section & { tables: Table[] })[];
  selectedTable: Table | null;
  onTableSelect: (table: Table) => void;
  reservedTableIds?: string[];
  isEditable?: boolean;
}

type TableWithSection = Table & { section?: Section };

export function FloorPlan({
  sections,
  selectedTable,
  onTableSelect,
  reservedTableIds = [],
  isEditable = false,
}: FloorPlanProps) {
  const [hoveredTable, setHoveredTable] = useState<TableWithSection | null>(null);

  const getTableColor = useCallback(
    (table: Table, section: Section) => {
      if (reservedTableIds.includes(table.id)) {
        return "fill-gray-600 stroke-gray-500";
      }
      if (selectedTable?.id === table.id) {
        return "fill-gold-500 stroke-gold-400";
      }
      if (hoveredTable?.id === table.id) {
        return "fill-gold-500/50 stroke-gold-400";
      }
      // Section-based colors
      const colors: Record<string, string> = {
        VIP: "fill-purple-600/50 stroke-purple-400",
        "Main Floor": "fill-blue-600/50 stroke-blue-400",
        Lounge: "fill-green-600/50 stroke-green-400",
      };
      return colors[section.name] || "fill-white/10 stroke-white/30";
    },
    [selectedTable, hoveredTable, reservedTableIds]
  );

  const renderTable = (table: Table, section: Section) => {
    const position = table.position as { x: number; y: number; width: number; height: number; rotation?: number };
    const isReserved = reservedTableIds.includes(table.id);
    const isSelected = selectedTable?.id === table.id;

    const handleClick = () => {
      if (!isReserved) {
        onTableSelect(table);
      }
    };

    const tableProps = {
      className: cn(
        "transition-all duration-200 cursor-pointer",
        getTableColor(table, section),
        isReserved && "cursor-not-allowed opacity-50",
        !isReserved && "hover:opacity-80"
      ),
      onClick: handleClick,
      onMouseEnter: () => setHoveredTable({ ...table, section }),
      onMouseLeave: () => setHoveredTable(null),
      style: {
        transform: position.rotation ? `rotate(${position.rotation}deg)` : undefined,
        transformOrigin: "center",
      },
    };

    if (table.shape === "CIRCLE") {
      return (
        <motion.ellipse
          key={table.id}
          cx={position.x + position.width / 2}
          cy={position.y + position.height / 2}
          rx={position.width / 2}
          ry={position.height / 2}
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={!isReserved ? { scale: 1.05 } : undefined}
          {...tableProps}
        />
      );
    }

    if (table.shape === "BOOTH") {
      // Rounded rectangle for booths
      return (
        <motion.rect
          key={table.id}
          x={position.x}
          y={position.y}
          width={position.width}
          height={position.height}
          rx={12}
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={!isReserved ? { scale: 1.02 } : undefined}
          {...tableProps}
        />
      );
    }

    // Rectangle or Square
    return (
      <motion.rect
        key={table.id}
        x={position.x}
        y={position.y}
        width={position.width}
        height={position.height}
        rx={table.shape === "SQUARE" ? 4 : 8}
        strokeWidth={2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={!isReserved ? { scale: 1.05 } : undefined}
        {...tableProps}
      />
    );
  };

  // Calculate SVG bounds
  const allPositions = sections.flatMap((s) =>
    s.tables.map((t) => t.position as { x: number; y: number; width: number; height: number })
  );
  const maxX = Math.max(...allPositions.map((p) => p.x + p.width), 600) + 50;
  const maxY = Math.max(...allPositions.map((p) => p.y + p.height), 500) + 50;

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        {sections.map((section) => (
          <div key={section.id} className="flex items-center gap-2">
            <div
              className={cn(
                "w-4 h-4 rounded",
                section.name === "VIP" && "bg-purple-600",
                section.name === "Main Floor" && "bg-blue-600",
                section.name === "Lounge" && "bg-green-600"
              )}
            />
            <span className="text-white/70">{section.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-600" />
          <span className="text-white/70">Reserved</span>
        </div>
      </div>

      {/* Floor Plan SVG */}
      <div className="relative bg-navy-950 rounded-xl border border-white/10 overflow-hidden">
        <svg
          viewBox={`0 0 ${maxX} ${maxY}`}
          className="w-full h-auto min-h-[400px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Dance Floor */}
          <rect
            x={250}
            y={250}
            width={200}
            height={150}
            rx={8}
            fill="rgba(212, 175, 55, 0.1)"
            stroke="rgba(212, 175, 55, 0.3)"
            strokeWidth={2}
            strokeDasharray="8,4"
          />
          <text
            x={350}
            y={330}
            textAnchor="middle"
            fill="rgba(212, 175, 55, 0.5)"
            fontSize="14"
            fontWeight="500"
          >
            DANCE FLOOR
          </text>

          {/* DJ Booth */}
          <rect
            x={300}
            y={420}
            width={100}
            height={40}
            rx={4}
            fill="rgba(123, 44, 191, 0.3)"
            stroke="rgba(123, 44, 191, 0.5)"
            strokeWidth={2}
          />
          <text
            x={350}
            y={445}
            textAnchor="middle"
            fill="rgba(123, 44, 191, 0.7)"
            fontSize="12"
            fontWeight="500"
          >
            DJ
          </text>

          {/* Bar */}
          <rect
            x={50}
            y={250}
            width={20}
            height={150}
            rx={4}
            fill="rgba(255, 255, 255, 0.1)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={2}
          />
          <text
            x={60}
            y={330}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.4)"
            fontSize="12"
            fontWeight="500"
            transform="rotate(-90, 60, 330)"
          >
            BAR
          </text>

          {/* Section Labels */}
          {sections.map((section) => {
            const sectionTables = section.tables;
            if (sectionTables.length === 0) return null;

            const positions = sectionTables.map(
              (t) => t.position as { x: number; y: number; width: number; height: number }
            );
            const avgX = positions.reduce((sum, p) => sum + p.x + p.width / 2, 0) / positions.length;
            const minY = Math.min(...positions.map((p) => p.y));

            return (
              <text
                key={section.id}
                x={avgX}
                y={minY - 15}
                textAnchor="middle"
                fill={section.color || "rgba(255,255,255,0.5)"}
                fontSize="14"
                fontWeight="600"
              >
                {section.name.toUpperCase()}
              </text>
            );
          })}

          {/* Tables */}
          {sections.map((section) =>
            section.tables.map((table) => renderTable(table, section))
          )}

          {/* Table Labels */}
          {sections.flatMap((section) =>
            section.tables.map((table) => {
              const pos = table.position as { x: number; y: number; width: number; height: number };
              return (
                <text
                  key={`label-${table.id}`}
                  x={pos.x + pos.width / 2}
                  y={pos.y + pos.height / 2 + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="500"
                  pointerEvents="none"
                >
                  {table.name.replace(/Table |Booth |Lounge /, "")}
                </text>
              );
            })
          )}
        </svg>

        {/* Tooltip */}
        {hoveredTable && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-navy-800/95 backdrop-blur-sm rounded-lg border border-white/10 p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-white">{hoveredTable.name}</h4>
                <p className="text-sm text-white/60">{hoveredTable.section?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">Capacity: {hoveredTable.capacity}</p>
                {hoveredTable.minimumSpend && (
                  <p className="text-sm text-gold-500">
                    Min: {formatCurrency(Number(hoveredTable.minimumSpend))}
                  </p>
                )}
              </div>
            </div>
            {reservedTableIds.includes(hoveredTable.id) && (
              <p className="text-sm text-red-400 mt-2">This table is already reserved</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
