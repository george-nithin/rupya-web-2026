import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { strategy_id, symbol, start_date, end_date, initial_capital = 100000 } = body;

        // Validate inputs
        if (!strategy_id || !symbol || !start_date || !end_date) {
            return NextResponse.json(
                { error: 'Missing required fields: strategy_id, symbol, start_date, end_date' },
                { status: 400 }
            );
        }

        // Path to Python script
        const backendPath = path.join(process.cwd(), 'backend');

        // Check if venv exists (prioritize backend/venv, then root .venv)
        const backendVenvPath = path.join(backendPath, 'venv');
        const rootVenvPath = path.join(process.cwd(), '.venv');

        let venvPath = '';
        if (fs.existsSync(backendVenvPath)) {
            venvPath = backendVenvPath;
        } else if (fs.existsSync(rootVenvPath)) {
            venvPath = rootVenvPath;
        }

        // Build command with JSON output
        let command;
        if (venvPath) {
            command = `cd ${backendPath} && source ${venvPath}/bin/activate && python run_backtest.py --strategy ${strategy_id} --symbol ${symbol} --start-date ${start_date} --end-date ${end_date} --capital ${initial_capital} --json`;
        } else {
            // Fallback to system python
            command = `cd ${backendPath} && python3 run_backtest.py --strategy ${strategy_id} --symbol ${symbol} --start-date ${start_date} --end-date ${end_date} --capital ${initial_capital} --json`;
        }

        // Execute backtest
        const { stdout, stderr } = await execAsync(command, {
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            timeout: 120000, // 120 second timeout
            env: {
                ...process.env,
                PYTHONPATH: backendPath,
                NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!
            }
        });

        if (stderr && !stderr.includes('FutureWarning')) {
            console.error('Backtest stderr:', stderr);
        }

        // Parse JSON output
        try {
            // Find the start of JSON in case there's noise before it
            const jsonStart = stdout.indexOf('{');
            const jsonEnd = stdout.lastIndexOf('}');

            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error('No JSON found in output');
            }

            const jsonStr = stdout.substring(jsonStart, jsonEnd + 1);
            const result = JSON.parse(jsonStr);

            return NextResponse.json(result);

        } catch (e) {
            console.error('Failed to parse Python output:', stdout);
            return NextResponse.json(
                {
                    error: 'Invalid output from backtest engine',
                    details: stdout,
                    raw: stdout
                },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Backtest execution error:', error);

        // Attempt to recover JSON from stdout even if exit code was non-zero
        if (error.stdout) {
            try {
                const jsonStart = error.stdout.indexOf('{');
                const jsonEnd = error.stdout.lastIndexOf('}');

                if (jsonStart !== -1 && jsonEnd !== -1) {
                    const jsonStr = error.stdout.substring(jsonStart, jsonEnd + 1);
                    const result = JSON.parse(jsonStr);
                    // If result looks valid (has metrics or equity_curve), return it
                    if (result.metrics || result.equity_curve || result.status) {
                        return NextResponse.json(result);
                    }
                }
            } catch (e) {
                // Ignore JSON parse error here, fall through to error handling
            }
        }

        let details = error.stderr || error.message || 'Unknown error';

        if (typeof details === 'string') {
            // Remove NotOpenSSLWarning lines
            details = details.replace(/.*NotOpenSSLWarning.*\n?/g, '');
            // Remove FutureWarning lines
            details = details.replace(/.*FutureWarning.*\n?/g, '');
            // Remove generic warnings.warn lines
            details = details.replace(/.*warnings\.warn.*\n?/g, '');
            // Remove HTTP request logs
            details = details.replace(/.*HTTP Request:.*\n?/g, '');

            details = details.trim();
        }

        if (!details) {
            details = "Process exited with error but no specific error message found (check server logs).";
        }

        return NextResponse.json(
            {
                error: `Backtest failed: ${details}`,
                details: details,
                suggestion: 'Ensure Python environment is set up and historical data exists for the symbol'
            },
            { status: 500 }
        );
    }
}
