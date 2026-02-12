import { PortfolioHolding } from '../brokers/broker-service';

/**
 * Forecast Result from Monte Carlo Simulation
 */
export interface ForecastResult {
    medianReturn: number; // Median expected return (%)
    downside5: number; // 5th percentile (worst case)
    upside95: number; // 95th percentile (best case)
    probabilityOfProfit: number; // Probability of positive return (0-1)
    var95: number; // Value at Risk at 95% confidence
    expectedReturn: number; // Mean expected return
    volatility: number; // Portfolio volatility
}

/**
 * Monte Carlo Simulator
 * Simulates 10,000 portfolio return scenarios for 30-day forecast
 */
export class MonteCarloSimulator {
    private readonly SIMULATIONS = 10000;
    private readonly TRADING_DAYS_PER_YEAR = 252;

    /**
     * Run Monte Carlo simulation for portfolio
     */
    async simulatePortfolio(
        holdings: PortfolioHolding[],
        days: number = 30
    ): Promise<ForecastResult> {
        if (holdings.length === 0) {
            return this.getDefaultForecast();
        }

        const results: number[] = [];
        const totalValue = this.calculateTotalValue(holdings);

        // Run simulations
        for (let i = 0; i < this.SIMULATIONS; i++) {
            const portfolioReturn = this.simulateSinglePath(holdings, totalValue, days);
            results.push(portfolioReturn);
        }

        // Sort results for percentile calculation
        results.sort((a, b) => a - b);

        const meanReturn = results.reduce((sum, r) => sum + r, 0) / results.length;
        const variance =
            results.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / results.length;
        const volatility = Math.sqrt(variance);

        return {
            medianReturn: this.percentile(results, 50),
            downside5: this.percentile(results, 5),
            upside95: this.percentile(results, 95),
            probabilityOfProfit: results.filter((r) => r > 0).length / this.SIMULATIONS,
            var95: this.calculateVaR(results, 0.95),
            expectedReturn: meanReturn,
            volatility: volatility,
        };
    }

    /**
     * Simulate a single price path for the portfolio
     */
    private simulateSinglePath(
        holdings: PortfolioHolding[],
        totalValue: number,
        days: number
    ): number {
        let totalReturn = 0;

        holdings.forEach((holding) => {
            const weight = (holding.quantity * holding.lastPrice) / totalValue;

            // Estimate daily return and volatility
            // Using historical average: 12% annual return, 20% volatility
            const annualReturn = 0.12;
            const annualVolatility = 0.20;

            const dailyReturn = annualReturn / this.TRADING_DAYS_PER_YEAR;
            const dailyVolatility = annualVolatility / Math.sqrt(this.TRADING_DAYS_PER_YEAR);

            // Simulate price path using Geometric Brownian Motion
            let price = holding.lastPrice;
            for (let day = 0; day < days; day++) {
                const z = this.randomNormal();
                const drift = dailyReturn - 0.5 * dailyVolatility ** 2;
                const diffusion = dailyVolatility * z;
                price *= Math.exp(drift + diffusion);
            }

            const stockReturn = (price - holding.lastPrice) / holding.lastPrice;
            totalReturn += stockReturn * weight;
        });

        return totalReturn * 100; // Return as percentage
    }

    /**
     * Generate random number from standard normal distribution
     * Using Box-Muller transform
     */
    private randomNormal(): number {
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    /**
     * Calculate percentile from sorted array
     */
    private percentile(sortedArray: number[], p: number): number {
        const index = (p / 100) * (sortedArray.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;

        if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
        if (lower < 0) return sortedArray[0];

        return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
    }

    /**
     * Calculate Value at Risk (VaR)
     */
    private calculateVaR(sortedReturns: number[], confidence: number): number {
        const index = Math.floor((1 - confidence) * sortedReturns.length);
        return sortedReturns[index];
    }

    /**
     * Calculate total portfolio value
     */
    private calculateTotalValue(holdings: PortfolioHolding[]): number {
        return holdings.reduce((sum, h) => sum + h.quantity * h.lastPrice, 0);
    }

    /**
     * Get default forecast when no holdings
     */
    private getDefaultForecast(): ForecastResult {
        return {
            medianReturn: 0,
            downside5: 0,
            upside95: 0,
            probabilityOfProfit: 0.5,
            var95: 0,
            expectedReturn: 0,
            volatility: 0,
        };
    }

    /**
     * Run scenario testing
     */
    async runScenarioTests(
        holdings: PortfolioHolding[]
    ): Promise<Record<string, ForecastResult>> {
        const scenarios = {
            base: await this.simulatePortfolio(holdings, 30),
            marketCrash5: await this.simulateScenario(holdings, 30, -0.05),
            marketCrash10: await this.simulateScenario(holdings, 30, -0.10),
            marketRally5: await this.simulateScenario(holdings, 30, 0.05),
            marketRally10: await this.simulateScenario(holdings, 30, 0.10),
        };

        return scenarios;
    }

    /**
     * Simulate with market shock
     */
    private async simulateScenario(
        holdings: PortfolioHolding[],
        days: number,
        marketShock: number
    ): Promise<ForecastResult> {
        // Apply market shock to all holdings
        const shockedHoldings = holdings.map((h) => ({
            ...h,
            lastPrice: h.lastPrice * (1 + marketShock),
        }));

        return this.simulatePortfolio(shockedHoldings, days);
    }
}
