import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Basic authorization check
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Authorization required' }),
    };
  }

  try {
    const url = event.queryStringParameters?.url;
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL parameter is required' }),
      };
    }

    // Basic URL validation
    const allowedDomains = ['asurion.com', 'verizon.com', 'att.com'];
    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some(domain => urlObj.hostname.endsWith(domain));

    if (!isAllowed) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Domain not allowed' }),
      };
    }

    // Simulate fetch (in real implementation, use fetch or axios)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        url,
        message: 'Fetch endpoint working',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};