import { formatNumber, formatPercent } from '../lib/calc';

export interface BeforeAfterChartProps {
    title?: string;
    beforeLabel: string;
    afterLabel: string;
    beforeValue: number;
    afterValue: number;
    beforeColor: string;
    afterColor: string;
    /** Variazione percentuale già calcolata (può essere null se non definita). */
    percent: number | null;
    /** Ref opzionale all'elemento <svg> (per l'export in PNG). */
    svgRef?: React.Ref<SVGSVGElement>;
}

const FONT = "Figtree, system-ui, -apple-system, sans-serif";

/**
 * Grafico a barre "prima / dopo" disegnato in SVG puro e completamente
 * autonomo (titolo, barre, etichette e badge percentuale sono tutti dentro
 * l'SVG), così può essere serializzato ed esportato come immagine.
 * Le barre partono dalla linea dello zero: i valori negativi vanno sotto.
 */
export default function BeforeAfterChart({
    title,
    beforeLabel,
    afterLabel,
    beforeValue,
    afterValue,
    beforeColor,
    afterColor,
    percent,
    svgRef,
}: BeforeAfterChartProps) {
    const increased = afterValue >= beforeValue;

    // Coordinate interne (viewBox), poi scalate in modo responsive.
    // L'altezza delle barre (plotH) resta costante: con il titolo si aggiunge
    // solo spazio in alto, così titolo e valori non si sovrappongono.
    const W = 360;
    const hasTitle = !!title && title.trim() !== '';
    const plotH = 180;
    const chartTop = hasTitle ? 84 : 28;
    const plotBottom = chartTop + plotH;
    const catLabelY = plotBottom + 18;
    const badgeTop = catLabelY + 16;
    const H = badgeTop + 34;

    const maxAbs = Math.max(Math.abs(beforeValue), Math.abs(afterValue), 1);
    const hasNegative = beforeValue < 0 || afterValue < 0;
    const zeroY = hasNegative ? chartTop + plotH / 2 : plotBottom;
    const unit = hasNegative ? plotH / 2 / maxAbs : plotH / maxAbs;

    const barWidth = 64;
    const bars = [
        { label: beforeLabel, value: beforeValue, cx: 120, color: beforeColor },
        { label: afterLabel, value: afterValue, cx: 240, color: afterColor },
    ];

    const badgeText = percent !== null ? formatPercent(percent) : '';
    const badgeW = Math.max(56, badgeText.length * 9 + 20);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            fontFamily={FONT}
            role="img"
            aria-label={`Confronto tra ${beforeLabel} e ${afterLabel}`}
        >
            <rect x={0} y={0} width={W} height={H} fill="#FFFFFF" />

            {hasTitle && (
                <text
                    x={W / 2}
                    y={38}
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="700"
                    fontFamily={FONT}
                    fill="#191919"
                >
                    {title}
                </text>
            )}

            {/* Linea dello zero */}
            <line x1={40} y1={zeroY} x2={W - 40} y2={zeroY} stroke="#E5E7EB" strokeWidth={1} />

            {bars.map((bar) => {
                const barH = Math.abs(bar.value) * unit;
                const y = bar.value >= 0 ? zeroY - barH : zeroY;
                const labelY = bar.value >= 0 ? y - 8 : y + barH + 16;
                return (
                    <g key={bar.label}>
                        <rect
                            x={bar.cx - barWidth / 2}
                            y={y}
                            width={barWidth}
                            height={Math.max(barH, 1)}
                            rx={4}
                            fill={bar.color}
                        />
                        <text
                            x={bar.cx}
                            y={labelY}
                            textAnchor="middle"
                            fontSize="13"
                            fontWeight="600"
                            fontFamily={FONT}
                            fill="#191919"
                        >
                            {formatNumber(bar.value)}
                        </text>
                        <text
                            x={bar.cx}
                            y={catLabelY}
                            textAnchor="middle"
                            fontSize="13"
                            fontFamily={FONT}
                            fill="#8A8A8A"
                        >
                            {bar.label}
                        </text>
                    </g>
                );
            })}

            {percent !== null && (
                <g>
                    <rect
                        x={W / 2 - badgeW / 2}
                        y={badgeTop}
                        width={badgeW}
                        height={24}
                        rx={12}
                        fill={afterColor}
                        fillOpacity={0.15}
                    />
                    <text
                        x={W / 2}
                        y={badgeTop + 16}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="700"
                        fontFamily={FONT}
                        fill={afterColor}
                    >
                        {badgeText}
                    </text>
                </g>
            )}
        </svg>
    );
}
