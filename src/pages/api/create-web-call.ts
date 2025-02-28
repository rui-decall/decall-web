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

  let today_information = await fetch('https://time-api.junyaoxiandingchan.workers.dev/time/Asia-Singapore', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  let today_information_data = await today_information.json();

  // Ensure all dynamic variables are strings
  if (retell_llm_dynamic_variables) {
    // Create a new object with stringified values
    const stringifiedVariables: Record<string, string> = {};
    
    // Process existing variables from the request
    for (const [key, value] of Object.entries(retell_llm_dynamic_variables)) {
      stringifiedVariables[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    
    // Add today_information as a stringified value
    stringifiedVariables.today_information = JSON.stringify(today_information_data);
    
    payload.retell_llm_dynamic_variables = stringifiedVariables;
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