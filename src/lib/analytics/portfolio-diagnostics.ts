import { PortfolioHolding } from '../brokers/broker-service';
import { supabase } from '@/lib/supabase';

/**
 * Portfolio Analysis Result
 */
export interface PortfolioAnalysis {
    allocation: AllocationMetrics;
    riskMetrics: RiskMetrics;
    diversification: DiversificationMetrics;
    warnings: string[];
}

export interface AllocationMetrics {
    sectorAllocation: Record<string, number>; // Sector -> percentage
    top3Concentration: number; // Percentage in top 3 stocks
    largestPosition: number; // Largest single position percentage
    numberOfHoldings: number;
}

export interface RiskMetrics {
    portfolioBeta: number;
    portfolioVolatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
}

export interface DiversificationMetrics {
    diversificationScore: number; // 0-100
    averageCorrelation: number;
    effectiveNumberOfStocks: number;
}

/**
 * Portfolio Diagnostics Engine
 * Analyzes portfolio allocation, risk, and diversification
 */
export class PortfolioDiagnostics {
    private readonly RISK_FREE_RATE = 0.06; // 6% annual risk-free rate

    /**
     * Analyze complete portfolio
     */
    async analyzePortfolio(holdings: PortfolioHolding[]): Promise<PortfolioAnalysis> {
        if (holdings.length === 0) {
            return this.getDefaultAnalysis();
        }

        const allocation = this.calculateAllocation(holdings);
        const riskMetrics = await this.calculateRiskMetrics(holdings);
        const diversification = await this.calculateDiversification(holdings);
        const warnings = this.generateWarnings(allocation, riskMetrics);

        return {
            allocation,
            riskMetrics,
            diversification,
            warnings,
        };
    }

    /**
     * Calculate allocation metrics
     */
    private calculateAllocation(holdings: PortfolioHolding[]): AllocationMetrics {
        const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.lastPrice, 0);

        // Sector allocation
        const sectorMap: Record<string, number> = {};
        holdings.forEach((h) => {
            const sector = h.sector || 'Others';
            const value = h.quantity * h.lastPrice;
            sectorMap[sector] = (sectorMap[sector] || 0) + value;
        });

        // Convert to percentages
        const sectorAllocation: Record<string, number> = {};
        Object.entries(sectorMap).forEach(([sector, value]) => {
            sectorAllocation[sector] = (value / totalValue) * 100;
        });

        // Top 3 concentration
        const sorted = [...holdings].sort(
            (a, b) => b.quantity * b.lastPrice - a.quantity * a.lastPrice
        );
        const top3Value = sorted
            .slice(0, 3)
            .reduce((sum, h) => sum + h.quantity * h.lastPrice, 0);
        const top3Concentration = (top3Value / totalValue) * 100;

        // Largest position
        const largestValue = sorted[0] ? sorted[0].quantity * sorted[0].lastPrice : 0;
        const largestPosition = (largestValue / totalValue) * 100;

        return {
            sectorAllocation,
            top3Concentration,
            largestPosition,
            numberOfHoldings: holdings.length,
        };
    }

    /**
     * Calculate portfolio risk metrics
     */
    private async calculateRiskMetrics(holdings: PortfolioHolding[]): Promise<RiskMetrics> {
        const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.lastPrice, 0);

        // Weighted Beta
        let portfolioBeta = 0;
        for (const holding of holdings) {
            const weight = (holding.quantity * holding.lastPrice) / totalValue;
            const beta = await this.getStockBeta(holding.symbol);
            portfolioBeta += weight * beta;
        }

        // Portfolio Volatility (simplified - using weighted average)
        let portfolioVolatility = 0;
        for (const holding of holdings) {
            const weight = (holding.quantity * holding.lastPrice) / totalValue;
            const volatility = await this.getStockVolatility(holding.symbol);
            portfolioVolatility += weight * volatility;
        }

        // Sharpe Ratio
        const expectedReturn = 0.12; // Assume 12% annual return
        const sharpeRatio = (expectedReturn - this.RISK_FREE_RATE) / (portfolioVolatility / 100);

        // Max Drawdown (simplified estimate)
        const maxDrawdown = portfolioVolatility * 2; // Rough estimate

        return {
            portfolioBeta: Math.round(portfolioBeta * 100) / 100,
            portfolioVolatility: Math.round(portfolioVolatility * 100) / 100,
            sharpeRatio: Math.round(sharpeRatio * 100) / 100,
            maxDrawdown: Math.round(maxDrawdown * 100) / 100,
        };
    }

    /**
     * Calculate diversification metrics
     */
    private async calculateDiversification(
        holdings: PortfolioHolding[]
    ): Promise<DiversificationMetrics> {
        if (holdings.length < 2) {
            return {
                diversificationScore: 0,
                averageCorrelation: 0,
                effectiveNumberOfStocks: holdings.length,
            };
        }

        // Calculate average correlation between all pairs
        let totalCorrelation = 0;
        let pairCount = 0;

        for (let i = 0; i < holdings.length; i++) {
            for (let j = i + 1; j < holdings.length; j++) {
                const correlation = await this.getStockCorrelation(
                    holdings[i].symbol,
                    holdings[j].symbol
                );
                totalCorrelation += correlation;
                pairCount++;
            }
        }

        const averageCorrelation = pairCount > 0 ? totalCorrelation / pairCount : 0;

        // Diversification score (lower correlation = higher score)
        const diversificationScore = Math.max(0, (1 - averageCorrelation) * 100);

        // Effective number of stocks (Herfindahl index)
        const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.lastPrice, 0);
        const sumOfSquares = holdings.reduce((sum, h) => {
            const weight = (h.quantity * h.lastPrice) / totalValue;
            return sum + weight ** 2;
        }, 0);
        const effectiveNumberOfStocks = 1 / sumOfSquares;

        return {
            diversificationScore: Math.round(diversificationScore),
            averageCorrelation: Math.round(averageCorrelation * 100) / 100,
            effectiveNumberOfStocks: Math.round(effectiveNumberOfStocks * 10) / 10,
        };
    }

    /**
     * Generate portfolio warnings
     */
    private generateWarnings(
        allocation: AllocationMetrics,
        riskMetrics: RiskMetrics
    ): string[] {
        const warnings: string[] = [];

        // Concentration warnings
        if (allocation.top3Concentration > 55) {
            warnings.push(
                `High concentration risk: Top 3 stocks represent ${allocation.top3Concentration.toFixed(1)}% of portfolio`
            );
        }

        if (allocation.largestPosition > 25) {
            warnings.push(
                `Single stock risk: Largest position is ${allocation.largestPosition.toFixed(1)}% of portfolio`
            );
        }

        // Sector concentration
        Object.entries(allocation.sectorAllocation).forEach(([sector, percentage]) => {
            if (percentage > 40) {
                warnings.push(
                    `Sector overweight: ${sector} represents ${percentage.toFixed(1)}% of portfolio`
                );
            }
        });

        // Risk warnings
        if (riskMetrics.portfolioBeta > 1.3) {
            warnings.push(`High market risk: Portfolio beta is ${riskMetrics.portfolioBeta}`);
        }

        if (riskMetrics.portfolioVolatility > 30) {
            warnings.push(
                `High volatility: Portfolio volatility is ${riskMetrics.portfolioVolatility.toFixed(1)}%`
            );
        }

        // Diversification warnings
        if (allocation.numberOfHoldings < 5) {
            warnings.push('Low diversification: Consider adding more stocks to reduce risk');
        }

        return warnings;
    }

    /**
     * Get stock beta from database
     */
    private async getStockBeta(symbol: string): Promise<number> {
        try {
            const { data } = await supabase
                .from('stock_fundamentals')
                .select('beta')
                .eq('symbol', symbol)
                .single();

            return data?.beta || 1.0; // Default to market beta
        } catch {
            return 1.0;
        }
    }

    /**
     * Get stock volatility from database
     */
    private async getStockVolatility(symbol: string): Promise<number> {
        try {
            const { data } = await supabase
                .from('stock_fundamentals')
                .select('volatility')
                .eq('symbol', symbol)
                .single();

            return data?.volatility || 20; // Default to 20% volatility
        } catch {
            return 20;
        }
    }

    /**
     * Get correlation between two stocks
     */
    private async getStockCorrelation(symbolA: string, symbolB: string): Promise<number> {
        try {
            const { data } = await supabase
                .from('stock_correlations')
                .select('correlation')
                .or(`and(symbol_a.eq.${symbolA},symbol_b.eq.${symbolB}),and(symbol_a.eq.${symbolB},symbol_b.eq.${symbolA})`)
                .single();

            return data?.correlation || 0.5; // Default to moderate correlation
        } catch {
            return 0.5;
        }
    }

    /**
     * Get default analysis for empty portfolio
     */
    private getDefaultAnalysis(): PortfolioAnalysis {
        return {
            allocation: {
                sectorAllocation: {},
                top3Concentration: 0,
                largestPosition: 0,
                numberOfHoldings: 0,
            },
            riskMetrics: {
                portfolioBeta: 1.0,
                portfolioVolatility: 0,
                sharpeRatio: 0,
                maxDrawdown: 0,
            },
            diversification: {
                diversificationScore: 0,
                averageCorrelation: 0,
                effectiveNumberOfStocks: 0,
            },
            warnings: ['No holdings in portfolio'],
        };
    }
}
