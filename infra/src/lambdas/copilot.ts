import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const body = event.body ? JSON.parse(event.body) : {};
    const { prompt, context } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    // Simulate AI response (in real implementation, integrate with OpenAI/Bedrock)
    const response = `AI Response to: "${prompt}". Context: ${context || 'none'}. Generated at ${new Date().toISOString()}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response,
        timestamp: new Date().toISOString(),
        model: 'simulated',
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