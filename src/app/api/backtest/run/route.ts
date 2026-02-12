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
            // Use . instead of source for better compatibility
            command = `cd "${backendPath}" && . "${venvPath}/bin/activate" && python run_backtest.py --strategy ${strategy_id} --symbol ${symbol} --start-date ${start_date} --end-date ${end_date} --capital ${initial_capital} --json`;
        } else {
            // Fallback to system python
            command = `cd "${backendPath}" && python3 run_backtest.py --strategy ${strategy_id} --symbol ${symbol} --start-date ${start_date} --end-date ${end_date} --capital ${initial_capital} --json`;
        }

        // Execute backtest
        const { stdout, stderr } = await execAsync(command, {
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            timeout: 120000, // 120 second timeout
            env: {
                ...process.env,
                PYTHONPATH: backendPath,
                NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
                // Ensure Python script can see these
                SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
            }
        });

        if (stderr && !stderr.includes('FutureWarning') && !stderr.includes('NotOpenSSLWarning')) {
            console.error('Backtest stderr:', stderr);
        }

        // Parse JSON output
        try {
            // Find the start of JSON in case there's noise before it
            const jsonStart = stdout.indexOf('{');
            const jsonEnd = stdout.lastIndexOf('}');

            if (jsonStart === -1 || jsonEnd === -1) {
                console.error("Backtest stdout (no JSON found):", stdout);
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
                    details: stdout ? stdout.substring(0, 500) : "No stdout", // Truncate for safety
                    raw: stdout
                },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Backtest execution error:', error);

        // Log the command that failed
        if (error.cmd) console.error("Failed command:", error.cmd);
        if (error.code) console.error("Exit code:", error.code);
        if (error.stdout) console.error("Stdout at failure:", error.stdout);
        if (error.stderr) console.error("Stderr at failure:", error.stderr);



        if (error.cmd) console.error("Failed command:", error.cmd);
        if (error.code) console.error("Exit code:", error.code);
        if (error.stdout) console.error("Stdout at failure:", error.stdout);
        if (error.stderr) console.error("Stderr at failure:", error.stderr);

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
            // If stderr was cleaned out (only warnings), check stdout for clues
            if (error.stdout) {
                // Take the last 500 chars of stdout which might have the error message
                // Or maybe the whole thing if short
                const stdoutText = error.stdout.trim();
                // Check if it looks like an error
                if (stdoutText.toLowerCase().includes('error') || stdoutText.toLowerCase().includes('exception') || stdoutText.toLowerCase().includes('traceback')) {
                    details = stdoutText;
                } else {
                    details = "Process exited with error but no specific error message found (check server logs). Stdout snippet: " + stdoutText.substring(0, 200);
                }
            } else {
                details = "Process exited with error but no specific error message found (check server logs).";
            }
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
