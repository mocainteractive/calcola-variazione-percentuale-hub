import VariationCalculator from './VariationCalculator';
import ApplyPercentageCalculator from './ApplyPercentageCalculator';

export function Dashboard() {
    return (
        <div className="space-y-6">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-moca-black">Calcola Variazione Percentuale</h1>
                <p className="text-moca-gray mt-1">
                    Due strumenti rapidi: calcola la variazione tra due valori o applica un aumento/diminuzione percentuale.
                </p>
            </div>

            <VariationCalculator />
            <ApplyPercentageCalculator />
        </div>
    );
}
