export interface WatchlistItem {
    id: string;
    symbol: string;
    name: string;
    exchange: string;
    priceAtAddition: number;
    addedAt: string;
    // Current data (would be fetched live)
    currentPrice: number;
    change: number;
    changePercent: number;
}

export interface Watchlist {
    id: string;
    name: string;
    items: WatchlistItem[];
    createdAt: string;
}
