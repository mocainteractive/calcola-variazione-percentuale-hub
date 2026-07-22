import { MocaProvider, useMoca } from './lib/moca-context';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Dashboard } from './components/Dashboard';
import { FeedbackWidget } from './components/FeedbackWidget';
import { APP_NAME } from './lib/constants';

function AppContent() {
    useMoca();
    return (
        <div className="flex flex-col min-h-screen bg-moca-bg font-sans">
            <Header appName={APP_NAME} />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <Dashboard />
            </main>
            <Footer appName={APP_NAME} />
            <FeedbackWidget />
        </div>
    );
}

function App() {
    return (
        <MocaProvider>
            <AppContent />
        </MocaProvider>
    );
}

export default App;
