import { supabase } from '@/lib/supabase';

/**
 * Fundamental Data Interface
 */
export interface Fundamentals {
    symbol: string;
    roe?: number;
    roce?: number;
    operatingMargin?: number;
    freeCashFlow?: number;
    debtToEquity?: number;
    revenueCagr3y?: number;
    epsCagr3y?: number;
    pe?: number;
    pegRatio?: number;
    evEbitda?: number;
    priceToBook?: number;
    beta?: number;
    volatility?: number;
    earningsConsistency?: number;
}

/**
 * Stock Score Result
 */
export interface StockScore {
    symbol: string;
    qualityScore: number; // 0-100
    growthScore: number; // 0-100
    valuationScore: number; // 0-100
    stabilityScore: number; // 0-100
    totalScore: number; // 0-100
    rating: 'Elite' | 'Strong' | 'Moderate' | 'Weak';
}

/**
 * Fundamental Scoring Engine
 * Calculates 4-pillar stock scores: Quality, Growth, Valuation, Stability
 */
export class FundamentalScoringEngine {
    /**
     * Calculate comprehensive stock score
     */
    async calculateStockScore(symbol: string): Promise<StockScore> {
        const fundamentals = await this.getFundamentals(symbol);

        if (!fundamentals) {
            // Return default scores if no fundamental data
            return {
                symbol,
                qualityScore: 50,
                growthScore: 50,
                valuationScore: 50,
                stabilityScore: 50,
                totalScore: 50,
                rating: 'Moderate',
            };
        }

        const qualityScore = await this.calculateQualityScore(fundamentals);
        const growthScore = await this.calculateGrowthScore(fundamentals);
        const valuationScore = await this.calculateValuationScore(fundamentals);
        const stabilityScore = await this.calculateStabilityScore(fundamentals);

        const totalScore =
            qualityScore * 0.3 +
            growthScore * 0.3 +
            valuationScore * 0.2 +
            stabilityScore * 0.2;

        return {
            symbol,
            qualityScore: Math.round(qualityScore),
            growthScore: Math.round(growthScore),
            valuationScore: Math.round(valuationScore),
            stabilityScore: Math.round(stabilityScore),
            totalScore: Math.round(totalScore),
            rating: this.getRating(totalScore),
        };
    }

    /**
     * Calculate Business Quality Score (0-100)
     * Inputs: ROE, ROCE, Operating Margin, FCF, Debt/Equity
     */
    private async calculateQualityScore(f: Fundamentals): Promise<number> {
        const roeScore = await this.percentileRank(f.roe, 'roe');
        const roceScore = await this.percentileRank(f.roce, 'roce');
        const marginScore = await this.percentileRank(f.operatingMargin, 'operating_margin');
        const fcfScore = await this.percentileRank(f.freeCashFlow, 'free_cash_flow');
        const debtScore = 100 - (await this.percentileRank(f.debtToEquity, 'debt_to_equity'));

        return (
            roeScore * 0.3 +
            roceScore * 0.25 +
            marginScore * 0.2 +
            fcfScore * 0.15 +
            debtScore * 0.1
        );
    }

    /**
     * Calculate Growth Strength Score (0-100)
     * Inputs: Revenue CAGR, EPS CAGR, Earnings Consistency
     */
    private async calculateGrowthScore(f: Fundamentals): Promise<number> {
        const revGrowth = await this.percentileRank(f.revenueCagr3y, 'revenue_cagr_3y');
        const epsGrowth = await this.percentileRank(f.epsCagr3y, 'eps_cagr_3y');
        const consistency = await this.percentileRank(f.earningsConsistency, 'earnings_consistency');

        return revGrowth * 0.4 + epsGrowth * 0.4 + consistency * 0.2;
    }

    /**
     * Calculate Valuation Comfort Score (0-100)
     * Lower valuation = higher score
     */
    private async calculateValuationScore(f: Fundamentals): Promise<number> {
        const peScore = 100 - (await this.percentileRank(f.pe, 'pe'));
        const pegScore = 100 - (await this.percentileRank(f.pegRatio, 'peg_ratio'));
        const evScore = 100 - (await this.percentileRank(f.evEbitda, 'ev_ebitda'));
        const pbScore = 100 - (await this.percentileRank(f.priceToBook, 'price_to_book'));

        return (peScore + pegScore + evScore + pbScore) / 4;
    }

    /**
     * Calculate Stability & Risk Score (0-100)
     * Lower volatility/beta = higher stability
     */
    private async calculateStabilityScore(f: Fundamentals): Promise<number> {
        const volatilityScore = 100 - (await this.percentileRank(f.volatility, 'volatility'));
        const betaScore = 100 - Math.abs((f.beta || 1) - 1) * 50; // Closer to 1 = more stable
        const debtScore = 100 - (await this.percentileRank(f.debtToEquity, 'debt_to_equity'));

        return (volatilityScore + betaScore + debtScore) / 3;
    }

    /**
     * Calculate percentile rank for a metric across all stocks
     */
    private async percentileRank(value: number | undefined, column: string): Promise<number> {
        if (value === undefined || value === null) return 50; // Default to median

        try {
            // Get all non-null values for this metric
            const { data, error } = await supabase
                .from('stock_fundamentals')
                .select(column)
                .not(column, 'is', null)
                .order(column, { ascending: true });

            if (error || !data || data.length === 0) return 50;

            const values = data.map((row: any) => row[column]).filter((v: any) => v !== null);
            if (values.length === 0) return 50;

            // Find percentile rank
            const rank = values.filter((v: number) => v <= value).length;
            return (rank / values.length) * 100;
        } catch (error) {
            console.error(`Error calculating percentile for ${column}:`, error);
            return 50;
        }
    }

    /**
     * Get fundamentals for a stock
     */
    private async getFundamentals(symbol: string): Promise<Fundamentals | null> {
        try {
            const { data, error } = await supabase
                .from('stock_fundamentals')
                .select('*')
                .eq('symbol', symbol)
                .single();

            if (error || !data) return null;

            return {
                symbol: data.symbol,
                roe: data.roe,
                roce: data.roce,
                operatingMargin: data.operating_margin,
                freeCashFlow: data.free_cash_flow,
                debtToEquity: data.debt_to_equity,
                revenueCagr3y: data.revenue_cagr_3y,
                epsCagr3y: data.eps_cagr_3y,
                pe: data.pe,
                pegRatio: data.peg_ratio,
                evEbitda: data.ev_ebitda,
                priceToBook: data.price_to_book,
                beta: data.beta,
                volatility: data.volatility,
                earningsConsistency: data.earnings_consistency,
            };
        } catch (error) {
            console.error(`Error fetching fundamentals for ${symbol}:`, error);
            return null;
        }
    }

    /**
     * Get rating based on total score
     */
    private getRating(score: number): 'Elite' | 'Strong' | 'Moderate' | 'Weak' {
        if (score >= 80) return 'Elite';
        if (score >= 70) return 'Strong';
        if (score >= 60) return 'Moderate';
        return 'Weak';
    }

    /**
     * Calculate scores for multiple stocks in parallel
     */
    async calculatePortfolioScores(symbols: string[]): Promise<StockScore[]> {
        const scores = await Promise.all(
            symbols.map((symbol) => this.calculateStockScore(symbol))
        );
        return scores;
    }
}
