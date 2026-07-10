/**
 * Utility di calcolo e formattazione per il calcolatore di variazione percentuale.
 * I numeri vengono interpretati in formato italiano (virgola come separatore decimale).
 */

/**
 * Converte una stringa inserita dall'utente in un numero.
 * Accetta la virgola o il punto come separatore decimale e ignora
 * i separatori delle migliaia. Restituisce null se non è un numero valido.
 */
export function parseNumber(raw: string): number | null {
    if (raw == null) return null;
    const trimmed = raw.trim();
    if (trimmed === '') return null;

    // Rimuove spazi (anche separatori migliaia) e normalizza la virgola in punto.
    // Se sono presenti sia "." che "," si assume "." = migliaia e "," = decimali.
    let normalized = trimmed.replace(/\s/g, '');
    if (normalized.includes(',') && normalized.includes('.')) {
        normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else {
        normalized = normalized.replace(',', '.');
    }

    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
}

/**
 * Formatta un numero in locale italiano con un massimo di 2 decimali
 * (senza decimali inutili). Es. 1234.5 -> "1.234,5".
 */
export function formatNumber(value: number, maxDecimals = 2): string {
    return value.toLocaleString('it-IT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals,
    });
}

/**
 * Formatta una percentuale con segno esplicito (+/-) e massimo 2 decimali.
 * Es. 20 -> "+20%", -12.5 -> "-12,5%".
 */
export function formatPercent(value: number, maxDecimals = 2): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${formatNumber(value, maxDecimals)}%`;
}

/**
 * Calcola la variazione percentuale da un valore iniziale a uno finale.
 * variazione% = ((finale - iniziale) / |iniziale|) * 100
 * Restituisce null se il valore iniziale è 0 (variazione non definita).
 */
export function percentageChange(initial: number, final: number): number | null {
    if (initial === 0) return null;
    return ((final - initial) / Math.abs(initial)) * 100;
}

/**
 * Applica una variazione percentuale a un valore base.
 * risultato = base * (1 + percentuale/100)
 */
export function applyPercentage(base: number, percent: number): number {
    return base * (1 + percent / 100);
}
