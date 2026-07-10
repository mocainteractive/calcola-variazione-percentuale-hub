import React, { createContext, useContext, useEffect, useState } from 'react';

const HUB_URL = import.meta.env.VITE_MOCA_HUB_URL || 'https://moca-central-hub.netlify.app';

interface MocaContextType {
    authenticated: boolean;
    loading: boolean;
    user: any | null;
    client: any | null;
    getConfig: (key: string) => string | null;
    getAllConfigs: () => Record<string, string>;
}

const MocaContext = createContext<MocaContextType | undefined>(undefined);

export function MocaProvider({ children }: { children: React.ReactNode }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any | null>(null);
    const [client, setClient] = useState<any | null>(null);
    const [mocaInstance, setMocaInstance] = useState<any>(null);

    useEffect(() => {
        const initMoca = async () => {
            try {
                const moca = new window.MocaSDK(HUB_URL);

                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    moca.enableMockMode({
                        client: {
                            id: 'demo-client-id',
                            name: 'Cliente Demo',
                            email: 'demo@moca.it',
                            logo_url: 'https://placehold.co/150x50/E52217/FFFFFF?text=MOCA'
                        },
                        user: {
                            id: 'demo-user-id',
                            name: 'Sviluppatore Locale',
                            role: 'admin'
                        },
                        configurations: {}
                    });
                }

                const isAuth = await moca.init();

                if (isAuth) {
                    setAuthenticated(true);
                    setUser(moca.getUser());
                    setClient(moca.getClient());
                    setMocaInstance(moca);
                } else {
                    moca.showAccessDenied();
                }
            } catch (error) {
                console.error('Error initializing Moca SDK:', error);
            } finally {
                setLoading(false);
            }
        };

        initMoca();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-moca-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moca-red"></div>
            </div>
        );
    }

    if (!authenticated) {
        return null;
    }

    return (
        <MocaContext.Provider
            value={{
                authenticated,
                loading,
                user,
                client,
                getConfig: (key: string) => (mocaInstance ? mocaInstance.getConfig(key) : null),
                getAllConfigs: () => (mocaInstance ? mocaInstance.getAllConfigs() : {}),
            }}
        >
            {children}
        </MocaContext.Provider>
    );
}

export function useMoca() {
    const context = useContext(MocaContext);
    if (context === undefined) {
        throw new Error('useMoca must be used within a MocaProvider');
    }
    return context;
}
