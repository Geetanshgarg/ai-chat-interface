export async function GET() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models from Ollama');
    }

    const data = await response.json();
    
    // Extract model names from the response
    const models = data.models?.map(model => model.name) || [];
    
    return Response.json({ 
      success: true, 
      models: models 
    });
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    
    // Return fallback models if Ollama is not available
    const fallbackModels = [
      "gemma3:12b",
      "mistralai/Mistral-7B-Instruct-v0.2", 
      "llama3:8b",
      "llama3:70b",
      "codellama:7b",
      "phi3:14b"
    ];
    
    return Response.json({ 
      success: false, 
      models: fallbackModels,
      error: error.message 
    });
  }
}
