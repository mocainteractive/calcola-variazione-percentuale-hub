import { useState } from 'react';
import { ArrowRightLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { parseNumber, formatNumber, formatPercent, percentageChange } from '../lib/calc';
import ChartEditor from './ChartEditor';

export default function VariationCalculator() {
    const [initialRaw, setInitialRaw] = useState('');
    const [finalRaw, setFinalRaw] = useState('');

    const initial = parseNumber(initialRaw);
    const final = parseNumber(finalRaw);
    const bothValid = initial !== null && final !== null;

    const percent = bothValid ? percentageChange(initial, final) : null;
    const diff = bothValid ? final - initial : null;
    const undefinedChange = bothValid && initial === 0;

    const direction =
        diff === null || diff === 0 ? 'flat' : diff > 0 ? 'up' : 'down';

    const accentClass =
        direction === 'up'
            ? 'text-moca-green'
            : direction === 'down'
            ? 'text-moca-red'
            : 'text-moca-gray';

    const DirectionIcon =
        direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;

    return (
        <div className="card animate-fade-in">
            <h2 className="section-title">
                <ArrowRightLeft className="w-5 h-5 text-moca-red" />
                Variazione tra due valori
            </h2>
            <p className="text-sm text-moca-gray mb-5 -mt-2">
                Inserisci un valore iniziale e uno finale per scoprire di quanto è cambiato in percentuale.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-moca-black mb-1.5">
                        Valore iniziale
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        className="input-field"
                        placeholder="Es. 100"
                        value={initialRaw}
                        onChange={(e) => setInitialRaw(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-moca-black mb-1.5">
                        Valore finale
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        className="input-field"
                        placeholder="Es. 120"
                        value={finalRaw}
                        onChange={(e) => setFinalRaw(e.target.value)}
                    />
                </div>
            </div>

            {bothValid && (
                <>
                    {undefinedChange ? (
                        <div className="rounded-md bg-moca-red-light text-moca-red px-4 py-3 text-sm">
                            La variazione percentuale non è definita quando il valore iniziale è 0.
                            La differenza assoluta è <strong>{formatNumber(diff!)}</strong>.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="stat-card">
                                    <div className={`flex items-center justify-center gap-1 text-2xl font-bold ${accentClass}`}>
                                        <DirectionIcon className="w-6 h-6" />
                                        {formatPercent(percent!)}
                                    </div>
                                    <div className="text-xs text-moca-gray mt-1">Variazione %</div>
                                </div>
                                <div className="stat-card">
                                    <div className={`text-2xl font-bold ${accentClass}`}>
                                        {diff! > 0 ? '+' : ''}{formatNumber(diff!)}
                                    </div>
                                    <div className="text-xs text-moca-gray mt-1">Differenza assoluta</div>
                                </div>
                            </div>
                            <ChartEditor
                                fileName="variazione-percentuale"
                                defaultBeforeLabel="Iniziale"
                                defaultAfterLabel="Finale"
                                defaultAfterColor={direction === 'down' ? '#E52217' : '#16A34A'}
                                beforeValue={initial!}
                                afterValue={final!}
                                percent={percent}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
