"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Users, Wine, Star, Sparkles } from "lucide-react";
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

  const getSectionColor = (sectionName: string) => {
    const colors: Record<string, { fill: string; stroke: string; glow: string }> = {
      Jungle: { fill: "#22c55e", stroke: "#4ade80", glow: "0 0 30px rgba(34, 197, 94, 0.5)" },
      Royal: { fill: "#dc2626", stroke: "#f87171", glow: "0 0 30px rgba(220, 38, 38, 0.5)" },
      Balcony: { fill: "#d4af37", stroke: "#f4e3a8", glow: "0 0 30px rgba(212, 175, 55, 0.5)" },
      Cove: { fill: "#d4af37", stroke: "#f4e3a8", glow: "0 0 30px rgba(212, 175, 55, 0.5)" },
      Stage: { fill: "#f59e0b", stroke: "#fcd34d", glow: "0 0 30px rgba(245, 158, 11, 0.5)" },
      VIP: { fill: "#d4af37", stroke: "#f4e3a8", glow: "0 0 30px rgba(212, 175, 55, 0.6)" },
    };
    return colors[sectionName] || { fill: "#d4af37", stroke: "#f4e3a8", glow: "0 0 30px rgba(212, 175, 55, 0.5)" };
  };

  const getTableState = useCallback(
    (table: Table, section: Section) => {
      const isReserved = reservedTableIds.includes(table.id);
      const isSelected = selectedTable?.id === table.id;
      const isHovered = hoveredTable?.id === table.id;
      const colors = getSectionColor(section.name);

      if (isReserved) {
        return {
          fill: "rgba(75, 85, 99, 0.3)",
          stroke: "rgba(75, 85, 99, 0.5)",
          glow: "none",
          cursor: "not-allowed",
          opacity: 0.4,
        };
      }

      if (isSelected) {
        return {
          fill: `${colors.fill}`,
          stroke: colors.stroke,
          glow: colors.glow,
          cursor: "pointer",
          opacity: 1,
        };
      }

      if (isHovered) {
        return {
          fill: `${colors.fill}99`,
          stroke: colors.stroke,
          glow: colors.glow.replace("0.5", "0.3"),
          cursor: "pointer",
          opacity: 0.9,
        };
      }

      return {
        fill: `${colors.fill}40`,
        stroke: `${colors.stroke}80`,
        glow: "none",
        cursor: "pointer",
        opacity: 0.7,
      };
    },
    [selectedTable, hoveredTable, reservedTableIds]
  );

  const renderTable = (table: Table, section: Section) => {
    const position = table.position as { x: number; y: number; width: number; height: number; rotation?: number };
    const isReserved = reservedTableIds.includes(table.id);
    const isSelected = selectedTable?.id === table.id;
    const state = getTableState(table, section);

    const handleClick = () => {
      if (!isReserved) {
        onTableSelect(table);
      }
    };

    const commonProps = {
      onClick: handleClick,
      onMouseEnter: () => setHoveredTable({ ...table, section }),
      onMouseLeave: () => setHoveredTable(null),
      style: {
        cursor: state.cursor,
        filter: state.glow !== "none" ? `drop-shadow(${state.glow})` : undefined,
      },
    };

    // Pulse animation for selected table
    const pulseAnimation = isSelected
      ? {
          scale: [1, 1.02, 1],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }
      : {};

    if (table.shape === "CIRCLE") {
      return (
        <motion.g key={table.id} {...commonProps}>
          <motion.ellipse
            cx={position.x + position.width / 2}
            cy={position.y + position.height / 2}
            rx={position.width / 2}
            ry={position.height / 2}
            fill={state.fill}
            stroke={state.stroke}
            strokeWidth={isSelected ? 3 : 2}
            opacity={state.opacity}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: state.opacity, ...pulseAnimation }}
            whileHover={!isReserved ? { scale: 1.08, opacity: 1 } : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
          {/* Inner glow effect */}
          {isSelected && (
            <motion.ellipse
              cx={position.x + position.width / 2}
              cy={position.y + position.height / 2}
              rx={position.width / 2 - 5}
              ry={position.height / 2 - 5}
              fill="none"
              stroke={state.stroke}
              strokeWidth={1}
              opacity={0.5}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.g>
      );
    }

    const rx = table.shape === "BOOTH" ? 12 : table.shape === "SQUARE" ? 4 : 8;

    return (
      <motion.g key={table.id} {...commonProps}>
        <motion.rect
          x={position.x}
          y={position.y}
          width={position.width}
          height={position.height}
          rx={rx}
          fill={state.fill}
          stroke={state.stroke}
          strokeWidth={isSelected ? 3 : 2}
          opacity={state.opacity}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: state.opacity, ...pulseAnimation }}
          whileHover={!isReserved ? { scale: 1.05, opacity: 1 } : undefined}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          transform={position.rotation ? `rotate(${position.rotation} ${position.x + position.width / 2} ${position.y + position.height / 2})` : undefined}
        />
        {/* Shimmer effect for selected */}
        {isSelected && (
          <motion.rect
            x={position.x + 3}
            y={position.y + 3}
            width={position.width - 6}
            height={position.height - 6}
            rx={rx - 2}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
            opacity={0.5}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.g>
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
      {/* Section Legend with animations */}
      <div className="flex flex-wrap gap-3 mb-6">
        {sections.map((section) => {
          const colors = getSectionColor(section.name);
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.fill, boxShadow: colors.glow }}
              />
              <span className="text-sm text-white/70">{section.name}</span>
              <span className="text-xs text-white/40">
                ({section.tables.filter(t => !reservedTableIds.includes(t.id)).length} available)
              </span>
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
        >
          <div className="w-3 h-3 rounded-full bg-gray-600" />
          <span className="text-sm text-white/50">Reserved</span>
        </motion.div>
      </div>

      {/* Floor Plan SVG */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-black via-black/95 to-black rounded-2xl border border-white/10 overflow-hidden"
        style={{
          boxShadow: "inset 0 0 100px rgba(212, 175, 55, 0.03)",
        }}
      >
        {/* Ambient glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        <svg
          viewBox={`0 0 ${maxX} ${maxY}`}
          className="w-full h-auto min-h-[450px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background grid with subtle animation */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(212, 175, 55, 0.03)"
                strokeWidth="1"
              />
            </pattern>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Dance Floor with animated border */}
          <motion.rect
            x={250}
            y={250}
            width={200}
            height={150}
            rx={8}
            fill="rgba(212, 175, 55, 0.05)"
            stroke="rgba(212, 175, 55, 0.2)"
            strokeWidth={2}
            strokeDasharray="8,4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
          <motion.text
            x={350}
            y={325}
            textAnchor="middle"
            fill="rgba(212, 175, 55, 0.4)"
            fontSize="14"
            fontWeight="600"
            letterSpacing="0.1em"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            DANCE FLOOR
          </motion.text>
          {/* Pulsing dance floor effect */}
          <motion.rect
            x={255}
            y={255}
            width={190}
            height={140}
            rx={6}
            fill="none"
            stroke="rgba(212, 175, 55, 0.1)"
            strokeWidth={1}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* DJ Booth with glow */}
          <motion.g filter="url(#glow)">
            <motion.rect
              x={300}
              y={420}
              width={100}
              height={40}
              rx={4}
              fill="rgba(212, 175, 55, 0.2)"
              stroke="rgba(212, 175, 55, 0.5)"
              strokeWidth={2}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            />
          </motion.g>
          <motion.text
            x={350}
            y={445}
            textAnchor="middle"
            fill="rgba(212, 175, 55, 0.7)"
            fontSize="12"
            fontWeight="600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            DJ BOOTH
          </motion.text>

          {/* Bar */}
          <motion.rect
            x={50}
            y={250}
            width={20}
            height={150}
            rx={4}
            fill="rgba(255, 255, 255, 0.05)"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={2}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          />
          <motion.text
            x={60}
            y={330}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.3)"
            fontSize="12"
            fontWeight="500"
            transform="rotate(-90, 60, 330)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            BAR
          </motion.text>

          {/* Section Labels */}
          {sections.map((section, idx) => {
            const sectionTables = section.tables;
            if (sectionTables.length === 0) return null;

            const positions = sectionTables.map(
              (t) => t.position as { x: number; y: number; width: number; height: number }
            );
            const avgX = positions.reduce((sum, p) => sum + p.x + p.width / 2, 0) / positions.length;
            const minY = Math.min(...positions.map((p) => p.y));
            const colors = getSectionColor(section.name);

            return (
              <motion.text
                key={section.id}
                x={avgX}
                y={minY - 15}
                textAnchor="middle"
                fill={colors.stroke}
                fontSize="13"
                fontWeight="600"
                letterSpacing="0.05em"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                {section.name.toUpperCase()}
              </motion.text>
            );
          })}

          {/* Render Tables */}
          {sections.map((section, sIdx) =>
            section.tables.map((table, tIdx) => (
              <motion.g
                key={table.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + sIdx * 0.1 + tIdx * 0.05, type: "spring" }}
              >
                {renderTable(table, section)}
              </motion.g>
            ))
          )}

          {/* Table Labels */}
          {sections.flatMap((section) =>
            section.tables.map((table) => {
              const pos = table.position as { x: number; y: number; width: number; height: number };
              const isReserved = reservedTableIds.includes(table.id);
              const isSelected = selectedTable?.id === table.id;

              return (
                <motion.text
                  key={`label-${table.id}`}
                  x={pos.x + pos.width / 2}
                  y={pos.y + pos.height / 2 + 5}
                  textAnchor="middle"
                  fill={isSelected ? "#fff" : isReserved ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)"}
                  fontSize="11"
                  fontWeight={isSelected ? "700" : "500"}
                  pointerEvents="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {table.name.replace(/Table |Booth |Lounge /, "")}
                </motion.text>
              );
            })
          )}
        </svg>

        {/* Floating tooltip for hovered/selected table */}
        <AnimatePresence>
          {(hoveredTable || selectedTable) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72"
            >
              <div className="bg-black/90 backdrop-blur-xl rounded-xl border border-gold-500/30 p-5 shadow-2xl shadow-gold-500/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white text-lg flex items-center gap-2">
                      {(hoveredTable || selectedTable)?.name}
                      {selectedTable && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex"
                        >
                          <Sparkles className="h-4 w-4 text-gold-500" />
                        </motion.span>
                      )}
                    </h4>
                    <p className="text-sm text-gold-500/80">
                      {(hoveredTable || selectedTable)?.section?.name} Section
                    </p>
                  </div>
                  {selectedTable && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center"
                    >
                      <Star className="h-4 w-4 text-black" />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <Users className="h-4 w-4 text-gold-500" />
                    <span>Up to {(hoveredTable || selectedTable)?.capacity} guests</span>
                  </div>
                  {((hoveredTable || selectedTable)?.minimumSpend) && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Wine className="h-4 w-4 text-gold-500" />
                      <span>Min spend: {formatCurrency(Number((hoveredTable || selectedTable)?.minimumSpend))}</span>
                    </div>
                  )}
                  {((hoveredTable || selectedTable)?.depositRequired) && (
                    <div className="pt-2 mt-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Deposit Required</span>
                        <span className="text-gold-500 font-bold">
                          {formatCurrency(Number((hoveredTable || selectedTable)?.depositRequired))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {reservedTableIds.includes((hoveredTable || selectedTable)?.id || "") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-sm text-red-400 text-center">This table is reserved</p>
                  </motion.div>
                )}

                {selectedTable && !reservedTableIds.includes(selectedTable.id) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-4 p-3 rounded-lg bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30"
                  >
                    <p className="text-sm text-gold-400 text-center font-medium">
                      Table selected! Click Continue to proceed.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Instructions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-white/40 text-sm mt-4"
      >
        Click on a table to select it. Hover for details.
      </motion.p>
    </div>
  );
}
