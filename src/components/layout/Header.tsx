import { ArrowLeft } from 'lucide-react';
import { useMoca } from '../../lib/moca-context';

interface HeaderProps {
    appName?: string;
}

export default function Header({ appName = 'App Name' }: HeaderProps) {
    const { client } = useMoca();

    return (
        <header className="bg-moca-black text-white h-16 flex items-center justify-between px-4 sticky top-0 z-50">
            {/* Left: Back + App Name */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={() => window.location.href = 'https://moca-central-hub.netlify.app'}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors group flex items-center gap-2"
                    aria-label="Torna al Hub"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </button>
                <div className="hidden sm:flex flex-col">
                    <span className="text-sm font-medium tracking-wide">{appName}</span>
                </div>
            </div>

            {/* Center: Client Logo */}
            <div className="flex-1 flex justify-center items-center">
                {client?.logo_url ? (
                    <img src={client.logo_url} alt={client.name || 'Client Logo'}
                         className="h-8 md:h-10 object-contain max-w-[150px]" />
                ) : (
                    <div className="h-8 md:h-10 px-4 bg-white/10 rounded flex items-center justify-center font-bold tracking-wider">
                        MOCA
                    </div>
                )}
            </div>

            {/* Right: Powered by Moca */}
            <div className="flex items-center justify-end gap-4 flex-1">
                <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moca-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-moca-red"></span>
                    </span>
                    Powered by Moca
                </div>
            </div>
        </header>
    );
}
