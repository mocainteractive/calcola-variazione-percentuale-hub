import { formatNumber, formatPercent } from '../lib/calc';

interface BeforeAfterChartProps {
    beforeLabel: string;
    afterLabel: string;
    beforeValue: number;
    afterValue: number;
    /** Variazione percentuale già calcolata (può essere null se non definita). */
    percent: number | null;
}

/**
 * Grafico a barre "prima / dopo" disegnato in SVG puro.
 * Le barre partono dalla linea dello zero, così i valori negativi
 * vengono rappresentati sotto la baseline.
 */
export default function BeforeAfterChart({
    beforeLabel,
    afterLabel,
    beforeValue,
    afterValue,
    percent,
}: BeforeAfterChartProps) {
    const increased = afterValue >= beforeValue;
    const accent = increased ? '#16A34A' : '#E52217';

    // Dimensioni "viewBox" (coordinate interne, poi scalate in modo responsive).
    const W = 320;
    const H = 220;
    const padTop = 24;
    const padBottom = 40;
    const plotH = H - padTop - padBottom;

    // Scala basata sul massimo valore assoluto (incluso lo zero).
    const maxAbs = Math.max(Math.abs(beforeValue), Math.abs(afterValue), 1);
    const hasNegative = beforeValue < 0 || afterValue < 0;
    // Posizione della linea dello zero: in basso se tutti positivi, al centro se ci sono negativi.
    const zeroY = hasNegative ? padTop + plotH / 2 : padTop + plotH;
    const unit = hasNegative ? plotH / 2 / maxAbs : plotH / maxAbs;

    const bars = [
        { label: beforeLabel, value: beforeValue, x: 70, color: '#8A8A8A' },
        { label: afterLabel, value: afterValue, x: 190, color: accent },
    ];
    const barWidth = 60;

    return (
        <div className="w-full">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full h-auto"
                role="img"
                aria-label={`Confronto tra ${beforeLabel} e ${afterLabel}`}
            >
                {/* Linea dello zero */}
                <line
                    x1={30}
                    y1={zeroY}
                    x2={W - 20}
                    y2={zeroY}
                    stroke="#E5E7EB"
                    strokeWidth={1}
                />

                {bars.map((bar) => {
                    const barH = Math.abs(bar.value) * unit;
                    const y = bar.value >= 0 ? zeroY - barH : zeroY;
                    const labelY = bar.value >= 0 ? y - 8 : y + barH + 16;
                    return (
                        <g key={bar.label}>
                            <rect
                                x={bar.x}
                                y={y}
                                width={barWidth}
                                height={Math.max(barH, 1)}
                                rx={4}
                                fill={bar.color}
                                className="transition-all duration-500"
                            />
                            {/* Valore sopra/sotto la barra */}
                            <text
                                x={bar.x + barWidth / 2}
                                y={labelY}
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight="600"
                                fill="#191919"
                            >
                                {formatNumber(bar.value)}
                            </text>
                            {/* Etichetta della categoria */}
                            <text
                                x={bar.x + barWidth / 2}
                                y={H - 18}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#8A8A8A"
                            >
                                {bar.label}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {percent !== null && (
                <div className="mt-2 text-center">
                    <span
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                            color: accent,
                            backgroundColor: increased ? '#DCFCE7' : '#FFE7E6',
                        }}
                    >
                        {formatPercent(percent)}
                    </span>
                </div>
            )}
        </div>
    );
}
