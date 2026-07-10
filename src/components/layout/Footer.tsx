interface FooterProps {
    appName?: string;
}

export default function Footer({ appName = 'App Name' }: FooterProps) {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-white border-t border-moca-red-light py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-sm text-moca-gray">
                    &copy; {currentYear} Moca - {appName}. Tutti i diritti riservati.
                </p>
            </div>
        </footer>
    );
}
