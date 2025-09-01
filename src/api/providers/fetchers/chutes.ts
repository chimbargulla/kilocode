// kilocode_change - new file
import axios from "axios"
import { z } from "zod"

import type { ModelInfo } from "@roo-code/types"
import { parseApiPrice } from "../../../shared/cost"
import { DEFAULT_HEADERS } from "../constants"

/**
 * Chutes AI Model Schema
 */
const chutesModelSchema = z.object({
	id: z.string(),
	object: z.string().optional(),
	created: z.number().optional(),
	owned_by: z.string().optional(),
	permission: z.array(z.any()).optional(),
	root: z.string().optional(),
	parent: z.string().optional(),
})

type ChutesModel = z.infer<typeof chutesModelSchema>

const chutesModelsResponseSchema = z.object({
	object: z.string(),
	data: z.array(chutesModelSchema),
})

type ChutesModelsResponse = z.infer<typeof chutesModelsResponseSchema>

/**
 * Fetch models from Chutes AI API
 * Uses the OpenAI-compatible models endpoint at https://llm.chutes.ai/v1/models
 */
export async function getChutesModels(apiKey?: string, baseUrl?: string): Promise<Record<string, ModelInfo>> {
	const models: Record<string, ModelInfo> = {}
	const endpoint = (baseUrl || "https://llm.chutes.ai/v1") + "/models"

	try {
		const headers = {
			...DEFAULT_HEADERS,
			...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
		}

		const response = await axios.get<ChutesModelsResponse>(endpoint, {
			headers,
			timeout: 30000, // 30 second timeout
		})

		const result = chutesModelsResponseSchema.safeParse(response.data)
		
		if (!result.success) {
			console.error("Chutes AI models response is invalid:", result.error.format())
			throw new Error("Invalid Chutes AI models response format")
		}

		const data = result.data.data

		for (const model of data) {
			// Parse the model and create ModelInfo with reasonable defaults
			// Since Chutes AI doesn't provide detailed pricing/limits in the models endpoint,
			// we'll use conservative defaults that can be overridden by static configuration
			models[model.id] = parseChutesModel(model)
		}

		console.log(`Successfully fetched ${Object.keys(models).length} models from Chutes AI`)
	} catch (error) {
		console.error(
			`Error fetching Chutes AI models: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
		)
		throw error
	}

	return models
}

/**
 * Parse a Chutes AI model into ModelInfo format
 */
function parseChutesModel(model: ChutesModel): ModelInfo {
	// Default values based on typical Chutes AI model capabilities
	// These can be overridden by static configuration in chutes.ts if more specific info is available
	const modelInfo: ModelInfo = {
		maxTokens: 32768, // Conservative default
		contextWindow: 131072, // Conservative default
		supportsImages: false, // Most models don't support images
		supportsPromptCache: false, // Most models don't support prompt caching
		inputPrice: 0, // Free by default, can be overridden
		outputPrice: 0, // Free by default, can be overridden
		description: `${model.id} - Chutes AI model`,
	}

	// Apply specific configurations for known model types
	if (model.id.includes("DeepSeek-R1")) {
		modelInfo.contextWindow = 163840
		modelInfo.maxTokens = 32768
		modelInfo.description = `${model.id} - DeepSeek R1 model with reasoning capabilities`
	} else if (model.id.includes("DeepSeek-V3")) {
		modelInfo.contextWindow = 163840
		modelInfo.maxTokens = 32768
		modelInfo.description = `${model.id} - DeepSeek V3 model`
	} else if (model.id.includes("Qwen")) {
		modelInfo.contextWindow = 262144
		modelInfo.maxTokens = 32768
		modelInfo.description = `${model.id} - Qwen model series`
	} else if (model.id.includes("Llama")) {
		modelInfo.contextWindow = 131072
		modelInfo.maxTokens = 32768
		modelInfo.description = `${model.id} - Llama model series`
	} else if (model.id.includes("Kimi")) {
		modelInfo.contextWindow = 131072
		modelInfo.maxTokens = 32768
		modelInfo.description = `${model.id} - Moonshot AI Kimi model`
	}

	return modelInfo
}