/**
 * Broker Service Interface
 * Abstract interface for all broker integrations
 */

export interface BrokerCredentials {
    accessToken: string;
    refreshToken?: string;
    tokenExpiry?: Date;
}

export interface PortfolioHolding {
    symbol: string;
    quantity: number;
    avgPrice: number;
    lastPrice: number;
    sector?: string;
    isin?: string;
}

export interface BrokerService {
    /**
     * Get OAuth authorization URL
     */
    getAuthorizationUrl(userId: string, redirectUri: string): string;

    /**
     * Exchange authorization code for access token
     */
    handleCallback(code: string, userId: string): Promise<BrokerCredentials>;

    /**
     * Fetch portfolio holdings from broker
     */
    fetchPortfolio(userId: string): Promise<PortfolioHolding[]>;

    /**
     * Refresh expired access token
     */
    refreshAccessToken(userId: string): Promise<BrokerCredentials>;

    /**
     * Disconnect broker account
     */
    disconnect(userId: string): Promise<void>;
}

export type BrokerName = 'upstox' | 'zerodha' | 'angelone' | 'fyers' | 'dhan';

/**
 * Get broker service instance by name
 */
export function getBrokerService(brokerName: BrokerName): BrokerService {
    switch (brokerName) {
        case 'upstox':
            return new UpstoxService();
        case 'zerodha':
            return new ZerodhaService();
        case 'angelone':
            return new AngelOneService();
        case 'fyers':
            return new FyersService();
        case 'dhan':
            return new DhanService();
        default:
            throw new Error(`Unsupported broker: ${brokerName}`);
    }
}

// Placeholder implementations (to be implemented in separate files)
class UpstoxService implements BrokerService {
    getAuthorizationUrl(userId: string, redirectUri: string): string {
        throw new Error('Not implemented');
    }
    async handleCallback(code: string, userId: string): Promise<BrokerCredentials> {
        throw new Error('Not implemented');
    }
    async fetchPortfolio(userId: string): Promise<PortfolioHolding[]> {
        throw new Error('Not implemented');
    }
    async refreshAccessToken(userId: string): Promise<BrokerCredentials> {
        throw new Error('Not implemented');
    }
    async disconnect(userId: string): Promise<void> {
        throw new Error('Not implemented');
    }
}

class ZerodhaService implements BrokerService {
    getAuthorizationUrl(userId: string, redirectUri: string): string {
        throw new Error('Not implemented');
    }
    async handleCallback(code: string, userId: string): Promise<BrokerCredentials> {
        throw new Error('Not implemented');
    }
    async fetchPortfolio(userId: string): Promise<PortfolioHolding[]> {
        throw new Error('Not implemented');
    }
    async refreshAccessToken(userId: string): Promise<BrokerCredentials> {
        throw new Error('Not implemented');
    }
    async disconnect(userId: string): Promise<void> {
        throw new Error('Not implemented');
    }
}

class AngelOneService implements BrokerService {
    getAuthorizationUrl(userId: string, redirectUri: string): string {
        throw new Error('Not implemented');
    }
    async handleCallback(code: string, userId: string): Promise<BrokerCredentials> {
        throw new Error('Not implemented');
    }
    async fetchPortfolio(userId: string): Promise<PortfolioHolding[]> {
        throw new Error('Not implemented');
    }
    async refreshAccessToken(userId: string): Promise<BrokerCredentials> {
        throw new Error('Not implemented');
    }
    async disconnect(userId: string): Promise<void> {
        throw new Error('Not implemented');
    }
}

class FyersService implements BrokerService {
    getAuthorizationUrl(userId: string, redirectUri: string): string {
        throw new Error('Not implemented');
    }
    async handleCallback(code: string, userId: string): Promise<BrokerCredentials> {
        throw new Error('Not implemented');
    }
    async fetchPortfolio(userId: string): Promise<PortfolioHolding[]> {
        throw new Error('Not implemented');
    }
    async refreshAccessToken(userId: string): Promise<BrokerCredentials> {
        throw new Error('Not implemented');
    }
    async disconnect(userId: string): Promise<void> {
        throw new Error('Not implemented');
    }
}

class DhanService implements BrokerService {
    getAuthorizationUrl(userId: string, redirectUri: string): string {
        throw new Error('Not implemented');
    }
    async handleCallback(code: string, userId: string): Promise<BrokerCredentials> {
        throw new Error('Not implemented');
    }
    async fetchPortfolio(userId: string): Promise<PortfolioHolding[]> {
        throw new Error('Not implemented');
    }
    async refreshAccessToken(userId: string): Promise<BrokerCredentials> {
        throw new Error('Not implemented');
    }
    async disconnect(userId: string): Promise<void> {
        throw new Error('Not implemented');
    }
}
