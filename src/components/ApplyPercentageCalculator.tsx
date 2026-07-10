import { useState } from 'react';
import { Percent, Plus, Minus } from 'lucide-react';
import { parseNumber, formatNumber, formatPercent, applyPercentage } from '../lib/calc';
import BeforeAfterChart from './BeforeAfterChart';

type Direction = 'increase' | 'decrease';

export default function ApplyPercentageCalculator() {
    const [baseRaw, setBaseRaw] = useState('');
    const [percentRaw, setPercentRaw] = useState('');
    const [direction, setDirection] = useState<Direction>('increase');

    const base = parseNumber(baseRaw);
    const percentMagnitude = parseNumber(percentRaw);
    const bothValid = base !== null && percentMagnitude !== null;

    // La percentuale con segno in base alla direzione selezionata.
    const signedPercent =
        percentMagnitude === null
            ? null
            : direction === 'increase'
            ? Math.abs(percentMagnitude)
            : -Math.abs(percentMagnitude);

    const result = bothValid ? applyPercentage(base!, signedPercent!) : null;
    const diff = result !== null && base !== null ? result - base : null;

    return (
        <div className="card animate-fade-in">
            <h2 className="section-title">
                <Percent className="w-5 h-5 text-moca-red" />
                Applica una variazione percentuale
            </h2>
            <p className="text-sm text-moca-gray mb-5 -mt-2">
                Inserisci un valore, scegli aumento o diminuzione e la percentuale per ottenere il risultato.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <label className="block text-sm font-medium text-moca-black mb-1.5">
                        Valore di partenza
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        className="input-field"
                        placeholder="Es. 200"
                        value={baseRaw}
                        onChange={(e) => setBaseRaw(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-moca-black mb-1.5">
                        Percentuale
                    </label>
                    <div className="flex gap-2">
                        <div className="flex rounded-md border border-gray-200 overflow-hidden shrink-0">
                            <button
                                type="button"
                                onClick={() => setDirection('increase')}
                                aria-pressed={direction === 'increase'}
                                className={`px-3 flex items-center justify-center transition-colors ${
                                    direction === 'increase'
                                        ? 'bg-moca-green text-white'
                                        : 'bg-white text-moca-gray hover:bg-gray-50'
                                }`}
                                aria-label="Aumento"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setDirection('decrease')}
                                aria-pressed={direction === 'decrease'}
                                className={`px-3 flex items-center justify-center transition-colors ${
                                    direction === 'decrease'
                                        ? 'bg-moca-red text-white'
                                        : 'bg-white text-moca-gray hover:bg-gray-50'
                                }`}
                                aria-label="Diminuzione"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                inputMode="decimal"
                                className="input-field pr-8"
                                placeholder="Es. 20"
                                value={percentRaw}
                                onChange={(e) => setPercentRaw(e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-moca-gray">%</span>
                        </div>
                    </div>
                </div>
            </div>

            {bothValid && result !== null && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="stat-card">
                            <div className="text-2xl font-bold text-moca-black">
                                {formatNumber(result)}
                            </div>
                            <div className="text-xs text-moca-gray mt-1">
                                Risultato ({formatPercent(signedPercent!)})
                            </div>
                        </div>
                        <div className="stat-card">
                            <div
                                className={`text-2xl font-bold ${
                                    diff! >= 0 ? 'text-moca-green' : 'text-moca-red'
                                }`}
                            >
                                {diff! > 0 ? '+' : ''}{formatNumber(diff!)}
                            </div>
                            <div className="text-xs text-moca-gray mt-1">Differenza assoluta</div>
                        </div>
                    </div>
                    <BeforeAfterChart
                        beforeLabel="Partenza"
                        afterLabel="Risultato"
                        beforeValue={base!}
                        afterValue={result}
                        percent={signedPercent}
                    />
                </div>
            )}
        </div>
    );
}
