---
sidebar_label: Chutes AI
---

# Using Chutes AI With Kilo Code

Chutes.ai offers free API access to several large language models (LLMs), allowing developers to integrate and experiment with these models without immediate financial commitment. They provide access to a curated set of open-source and proprietary language models, often with a focus on specific capabilities or regional language support.

**Website:** [https://chutes.ai/](https://chutes.ai/)

## Getting an API Key

To use Chutes AI with Kilo Code, obtain an API key from the [Chutes AI platform](https://chutes.ai/). After signing up or logging in, you should find an option to generate or retrieve your API key within your account dashboard or settings.

## Supported Models

Kilo Code **automatically fetches all available models** from the Chutes AI API in real-time. This means you'll always have access to the latest models without needing to update the extension.

The extension will:
- Fetch the complete list of models from `https://llm.chutes.ai/v1/models`
- Include both well-known models (like DeepSeek, Qwen, Llama series) and any new models added by Chutes AI
- Cache the model list for performance while ensuring freshness
- Fall back to a curated list of popular models if the API is temporarily unavailable

**Popular model categories available:**
- **DeepSeek R1 Series:** Advanced reasoning models with thinking capabilities
- **DeepSeek V3 Series:** High-performance general-purpose models  
- **Qwen Series:** Powerful multilingual and coding-focused models
- **Llama Series:** Open-source models optimized for various tasks
- **Moonshot Kimi:** Long-context models excellent for document analysis

Always refer to your Kilo Code model dropdown for the most current list, as new models are added regularly.

## Configuration in Kilo Code

1.  **Open Kilo Code Settings:** Click the gear icon (<Codicon name="gear" />) in the Kilo Code panel.
2.  **Select Provider:** Choose "Chutes AI" from the "API Provider" dropdown.
3.  **Enter API Key:** Paste your Chutes AI API key into the "Chutes AI API Key" field.
4.  **Select Model:** Choose your desired model from the "Model" dropdown.

## Tips and Notes

*   **Free Access:** Chutes AI provides free API access, making it an excellent option for experimentation and development without immediate costs.
*   **Dynamic Model Loading:** The extension automatically discovers and loads all available models from Chutes AI, so you'll always see the latest offerings without manual updates.
*   **Model Variety:** The platform offers access to both open-source and proprietary models, giving you flexibility in choosing the right model for your needs.
*   **Smart Fallbacks:** If a specific model is temporarily unavailable, the extension intelligently falls back to similar alternatives.
*   **Rate Limits:** As with any free service, be aware of potential rate limits or usage restrictions that may apply to your API key.