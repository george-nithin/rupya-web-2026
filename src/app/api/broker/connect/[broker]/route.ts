import { NextRequest, NextResponse } from 'next/server';
import { getBrokerService } from '@/lib/brokers/broker-service';

/**
 * GET /api/broker/connect/[broker]
 * Initiate OAuth flow for broker connection
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ broker: string }> }
) {
    try {
        const { broker } = await context.params;

        if (!broker) {
            return NextResponse.json(
                { error: 'Broker parameter is required' },
                { status: 400 }
            );
        }

        // Get user from session
        const userId = request.headers.get('x-user-id') || 'demo-user';

        // Get broker service
        const brokerService = getBrokerService(broker as any);

        // Get OAuth URL
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/broker/callback/${broker}`;
        const authUrl = brokerService.getAuthorizationUrl(userId, redirectUri);

        // Redirect to broker OAuth page
        return NextResponse.redirect(authUrl);
    } catch (error: any) {
        console.error('Broker connect error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to connect broker' },
            { status: 500 }
        );
    }
}
