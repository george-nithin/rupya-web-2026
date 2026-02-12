import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { FundamentalScoringEngine } from '@/lib/analytics/fundamental-scoring';
import { PortfolioDiagnostics } from '@/lib/analytics/portfolio-diagnostics';
import { MonteCarloSimulator } from '@/lib/analytics/monte-carlo';
import { PortfolioHolding } from '@/lib/brokers/broker-service';

/**
 * POST /api/portfolio/analyze
 * Analyze portfolio with fundamental scores, risk metrics, and forecasts
 */
export async function POST(request: NextRequest) {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get portfolio holdings
        const { data: portfolio, error: portfolioError } = await supabase
            .from('user_portfolio')
            .select('*')
            .eq('user_id', user.id);

        if (portfolioError) {
            return NextResponse.json({ error: portfolioError.message }, { status: 500 });
        }

        if (!portfolio || portfolio.length === 0) {
            return NextResponse.json({
                message: 'No holdings found',
                healthScore: 0,
                stockScores: [],
                portfolioAnalysis: null,
                forecast: null,
            });
        }

        // 2. Get current market prices
        const symbols = portfolio.map((p) => p.symbol);
        const { data: quotes } = await supabase
            .from('market_equity_quotes')
            .select('symbol, last_price, sector')
            .in('symbol', symbols);

        // 3. Build holdings array
        const holdings: PortfolioHolding[] = portfolio.map((p) => {
            const quote = quotes?.find((q) => q.symbol === p.symbol);
            return {
                symbol: p.symbol,
                quantity: p.quantity,
                avgPrice: p.avg_price,
                lastPrice: quote?.last_price || p.avg_price,
                sector: quote?.sector || 'Others',
            };
        });

        // 4. Run analytics engines
        const scoringEngine = new FundamentalScoringEngine();
        const diagnostics = new PortfolioDiagnostics();
        const simulator = new MonteCarloSimulator();

        // Calculate stock scores
        const stockScores = await scoringEngine.calculatePortfolioScores(symbols);

        // Analyze portfolio
        const portfolioAnalysis = await diagnostics.analyzePortfolio(holdings);

        // Run Monte Carlo simulation
        const forecast = await simulator.simulatePortfolio(holdings, 30);

        // 5. Calculate Portfolio Health Score
        const healthScore = calculateHealthScore(stockScores, portfolioAnalysis, forecast);

        // 6. Cache results
        await supabase.from('portfolio_analytics').upsert({
            user_id: user.id,
            portfolio_health_score: healthScore,
            diversification_score: portfolioAnalysis.diversification.diversificationScore,
            portfolio_beta: portfolioAnalysis.riskMetrics.portfolioBeta,
            portfolio_volatility: portfolioAnalysis.riskMetrics.portfolioVolatility,
            sharpe_ratio: portfolioAnalysis.riskMetrics.sharpeRatio,
            expected_return_30d: forecast.expectedReturn,
            var_95: forecast.var95,
            upside_95: forecast.upside95,
            downside_5: forecast.downside5,
            probability_of_profit: forecast.probabilityOfProfit,
            top_3_concentration: portfolioAnalysis.allocation.top3Concentration,
            largest_position_pct: portfolioAnalysis.allocation.largestPosition,
            sector_allocation: portfolioAnalysis.allocation.sectorAllocation,
            stock_scores: stockScores,
            risk_metrics: portfolioAnalysis.riskMetrics,
            forecast_data: forecast,
            warnings: portfolioAnalysis.warnings,
            calculated_at: new Date().toISOString(),
        });

        return NextResponse.json({
            healthScore,
            stockScores,
            portfolioAnalysis,
            forecast,
            classification: getPortfolioClassification(healthScore, portfolioAnalysis),
        });
    } catch (error: any) {
        console.error('Portfolio analysis error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Calculate overall portfolio health score (0-100)
 */
function calculateHealthScore(
    stockScores: any[],
    portfolioAnalysis: any,
    forecast: any
): number {
    // Weighted average of stock scores
    const avgStockScore =
        stockScores.reduce((sum, s) => sum + s.totalScore, 0) / stockScores.length || 50;

    // Diversification score (0-100)
    const diversificationScore = portfolioAnalysis.diversification.diversificationScore;

    // Risk-adjusted return score
    const sharpeScore = Math.min(100, Math.max(0, portfolioAnalysis.riskMetrics.sharpeRatio * 50));

    // Stability score (lower volatility = higher score)
    const stabilityScore = Math.max(
        0,
        100 - portfolioAnalysis.riskMetrics.portfolioVolatility * 2
    );

    // Weighted health score
    const healthScore =
        avgStockScore * 0.4 +
        diversificationScore * 0.2 +
        sharpeScore * 0.2 +
        stabilityScore * 0.2;

    return Math.round(healthScore);
}

/**
 * Get portfolio classification
 */
function getPortfolioClassification(healthScore: number, analysis: any): string {
    const beta = analysis.riskMetrics.portfolioBeta;
    const volatility = analysis.riskMetrics.portfolioVolatility;

    if (healthScore >= 80) {
        return 'Elite - Low Risk';
    } else if (healthScore >= 70) {
        if (beta > 1.2 || volatility > 25) {
            return 'Strong - Growth Oriented';
        } else {
            return 'Strong - Balanced';
        }
    } else if (healthScore >= 60) {
        if (beta > 1.3 || volatility > 30) {
            return 'Moderate - High Risk';
        } else {
            return 'Moderate - Moderate Risk';
        }
    } else {
        return 'Needs Improvement - High Risk';
    }
}
