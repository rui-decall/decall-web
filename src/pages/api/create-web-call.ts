import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  // Get the request body
  const body = await request.json();
  const { agent_id, metadata, retell_llm_dynamic_variables } = body;

  // Prepare the payload
  const payload: any = { agent_id };

  // Add optional fields if provided
  if (metadata) {
    payload.metadata = metadata;
  }

  if (retell_llm_dynamic_variables) {
    payload.retell_llm_dynamic_variables = retell_llm_dynamic_variables;
  }

  try {
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 123f1675-7f15-4030-9438-fdf90370351e`, 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create web call');
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error creating web call:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create web call' }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 