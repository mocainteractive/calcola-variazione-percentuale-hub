import { useEffect, useRef, useState } from 'react';
import { Download, SlidersHorizontal } from 'lucide-react';
import BeforeAfterChart from './BeforeAfterChart';

interface ChartEditorProps {
    /** Etichette e titolo di default (l'utente può modificarli). */
    defaultTitle?: string;
    defaultBeforeLabel: string;
    defaultAfterLabel: string;
    /** Colore di default della barra "dopo" (segue aumento/diminuzione finché non viene modificato). */
    defaultAfterColor: string;
    beforeValue: number;
    afterValue: number;
    percent: number | null;
    /** Nome base del file scaricato (senza estensione). */
    fileName: string;
}

const DEFAULT_BEFORE_COLOR = '#8A8A8A';

const SIZE_PRESETS = [
    { id: 'standard', label: 'Standard 16:9 (1280×720)', w: 1280, h: 720 },
    { id: 'fullhd', label: 'Full HD 16:9 (1920×1080)', w: 1920, h: 1080 },
    { id: 'square', label: 'Quadrato (1080×1080)', w: 1080, h: 1080 },
];

export default function ChartEditor({
    defaultTitle = '',
    defaultBeforeLabel,
    defaultAfterLabel,
    defaultAfterColor,
    beforeValue,
    afterValue,
    percent,
    fileName,
}: ChartEditorProps) {
    const [showControls, setShowControls] = useState(false);
    const [title, setTitle] = useState(defaultTitle);
    const [beforeLabel, setBeforeLabel] = useState(defaultBeforeLabel);
    const [afterLabel, setAfterLabel] = useState(defaultAfterLabel);
    const [beforeColor, setBeforeColor] = useState(DEFAULT_BEFORE_COLOR);
    const [afterColor, setAfterColor] = useState(defaultAfterColor);
    const [sizeId, setSizeId] = useState(SIZE_PRESETS[0].id);

    const svgRef = useRef<SVGSVGElement>(null);
    // Finché l'utente non sceglie manualmente un colore, la barra "dopo"
    // segue il verde/rosso in base ad aumento o diminuzione.
    const afterColorTouched = useRef(false);
    useEffect(() => {
        if (!afterColorTouched.current) setAfterColor(defaultAfterColor);
    }, [defaultAfterColor]);

    const handleDownload = () => {
        const svg = svgRef.current;
        if (!svg) return;
        const size = SIZE_PRESETS.find((s) => s.id === sizeId) ?? SIZE_PRESETS[0];

        const clone = svg.cloneNode(true) as SVGSVGElement;
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const svgString = new XMLSerializer().serializeToString(clone);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const scale = 2; // rasterizza a 2x per una resa nitida
            const canvas = document.createElement('canvas');
            canvas.width = size.w * scale;
            canvas.height = size.h * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // "Contain": mantiene le proporzioni del grafico, centrato su sfondo bianco.
            const vb = svg.viewBox.baseVal;
            const fit = Math.min(canvas.width / vb.width, canvas.height / vb.height);
            const dw = vb.width * fit;
            const dh = vb.height * fit;
            ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
            URL.revokeObjectURL(url);

            canvas.toBlob((blob) => {
                if (!blob) return;
                const a = document.createElement('a');
                const href = URL.createObjectURL(blob);
                a.href = href;
                a.download = `${fileName}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(href);
            }, 'image/png');
        };
        img.src = url;
    };

    return (
        <div className="w-full">
            <BeforeAfterChart
                svgRef={svgRef}
                title={title}
                beforeLabel={beforeLabel}
                afterLabel={afterLabel}
                beforeValue={beforeValue}
                afterValue={afterValue}
                beforeColor={beforeColor}
                afterColor={afterColor}
                percent={percent}
            />

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                <button
                    type="button"
                    className="btn-secondary text-sm py-1.5 px-3"
                    onClick={() => setShowControls((v) => !v)}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Personalizza
                </button>
                <button
                    type="button"
                    className="btn-primary text-sm py-1.5 px-3"
                    onClick={handleDownload}
                >
                    <Download className="w-4 h-4" />
                    Scarica PNG
                </button>
            </div>

            {showControls && (
                <div className="mt-4 p-4 rounded-md bg-moca-bg border border-gray-100 space-y-3 animate-fade-in">
                    <div>
                        <label className="block text-xs font-medium text-moca-gray mb-1">
                            Titolo del grafico (opzionale)
                        </label>
                        <input
                            type="text"
                            className="input-field text-sm py-1.5"
                            placeholder="Es. Andamento fatturato"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-moca-gray mb-1">
                                Etichetta 1 (sinistra)
                            </label>
                            <input
                                type="text"
                                className="input-field text-sm py-1.5"
                                value={beforeLabel}
                                onChange={(e) => setBeforeLabel(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-moca-gray mb-1">
                                Etichetta 2 (destra)
                            </label>
                            <input
                                type="text"
                                className="input-field text-sm py-1.5"
                                value={afterLabel}
                                onChange={(e) => setAfterLabel(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-moca-gray mb-1">
                                Colore barra 1
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    className="h-9 w-12 rounded border border-gray-200 cursor-pointer bg-white"
                                    value={beforeColor}
                                    onChange={(e) => setBeforeColor(e.target.value)}
                                />
                                <span className="text-xs text-moca-gray uppercase">{beforeColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-moca-gray mb-1">
                                Colore barra 2
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    className="h-9 w-12 rounded border border-gray-200 cursor-pointer bg-white"
                                    value={afterColor}
                                    onChange={(e) => {
                                        afterColorTouched.current = true;
                                        setAfterColor(e.target.value);
                                    }}
                                />
                                <span className="text-xs text-moca-gray uppercase">{afterColor}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-moca-gray mb-1">
                            Dimensioni immagine
                        </label>
                        <select
                            className="input-field text-sm py-1.5"
                            value={sizeId}
                            onChange={(e) => setSizeId(e.target.value)}
                        >
                            {SIZE_PRESETS.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
