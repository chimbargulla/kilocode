import { DEEP_SEEK_DEFAULT_TEMPERATURE, type ChutesModelId, chutesDefaultModelId, chutesModels } from "@roo-code/types"
import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"

import type { ApiHandlerOptions } from "../../shared/api"
import { XmlMatcher } from "../../utils/xml-matcher"
import { convertToR1Format } from "../transform/r1-format"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { ApiStream } from "../transform/stream"
import { getChutesModels } from "./fetchers/chutes" // kilocode_change

import { BaseOpenAiCompatibleProvider } from "./base-openai-compatible-provider"

export class ChutesHandler extends BaseOpenAiCompatibleProvider<ChutesModelId> {
	private dynamicModels: Record<string, any> = {} // kilocode_change
	private modelsFetched = false // kilocode_change

	constructor(options: ApiHandlerOptions) {
		super({
			...options,
			providerName: "Chutes",
			baseURL: "https://llm.chutes.ai/v1",
			apiKey: options.chutesApiKey,
			defaultProviderModelId: chutesDefaultModelId,
			providerModels: chutesModels,
			defaultTemperature: 0.5,
		})
	}

	private getCompletionParams(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
	): OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming {
		const {
			id: model,
			info: { maxTokens: max_tokens },
		} = this.getModel()

		const temperature = this.options.modelTemperature ?? this.getModel().info.temperature

		return {
			model,
			max_tokens,
			temperature,
			messages: [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messages)],
			stream: true,
			stream_options: { include_usage: true },
		}
	}

	override async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const model = this.getModel()

		if (model.id.includes("DeepSeek-R1")) {
			const stream = await this.client.chat.completions.create({
				...this.getCompletionParams(systemPrompt, messages),
				messages: convertToR1Format([{ role: "user", content: systemPrompt }, ...messages]),
			})

			const matcher = new XmlMatcher(
				"think",
				(chunk) =>
					({
						type: chunk.matched ? "reasoning" : "text",
						text: chunk.data,
					}) as const,
			)

			for await (const chunk of stream) {
				const delta = chunk.choices[0]?.delta

				if (delta?.content) {
					for (const processedChunk of matcher.update(delta.content)) {
						yield processedChunk
					}
				}

				if (chunk.usage) {
					yield {
						type: "usage",
						inputTokens: chunk.usage.prompt_tokens || 0,
						outputTokens: chunk.usage.completion_tokens || 0,
					}
				}
			}

			// Process any remaining content
			for (const processedChunk of matcher.final()) {
				yield processedChunk
			}
		} else {
			yield* super.createMessage(systemPrompt, messages)
		}
	}

	// kilocode_change start
	/**
	 * Fetch models dynamically from Chutes AI API if not already fetched
	 */
	private async ensureDynamicModels(): Promise<void> {
		if (this.modelsFetched) {
			return
		}

		try {
			this.dynamicModels = await getChutesModels(this.options.chutesApiKey)
			this.modelsFetched = true
			console.log(`Fetched ${Object.keys(this.dynamicModels).length} models from Chutes AI`)
		} catch (error) {
			console.warn("Failed to fetch dynamic models from Chutes AI, using static models:", error)
			// Don't throw - fallback to static models
			this.modelsFetched = true // Prevent repeated attempts
		}
	}

	/**
	 * Get all available models (static + dynamic)
	 */
	private async getAllModels(): Promise<Record<string, any>> {
		await this.ensureDynamicModels()
		
		// Merge static models with dynamic models, with static models taking precedence
		// for any models that exist in both (to preserve pricing and detailed info)
		return {
			...this.dynamicModels,
			...this.providerModels,
		}
	}

	/**
	 * Get all available model IDs (for external use)
	 */
	async getAvailableModels(): Promise<string[]> {
		const allModels = await this.getAllModels()
		return Object.keys(allModels)
	}

	override getModel() {
		// First try to get from static models
		const staticModel = super.getModel()
		if (this.options.apiModelId && this.options.apiModelId in this.providerModels) {
			const isDeepSeekR1 = staticModel.id.includes("DeepSeek-R1")
			return {
				...staticModel,
				info: {
					...staticModel.info,
					temperature: isDeepSeekR1 ? DEEP_SEEK_DEFAULT_TEMPERATURE : this.defaultTemperature,
				},
			}
		}

		// If not in static models, check dynamic models
		const modelId = this.options.apiModelId || this.defaultProviderModelId
		const dynamicModelInfo = this.dynamicModels[modelId]
		
		if (dynamicModelInfo) {
			const isDeepSeekR1 = modelId.includes("DeepSeek-R1")
			return {
				id: modelId as ChutesModelId, // Cast since dynamic models should be compatible
				info: {
					...dynamicModelInfo,
					temperature: isDeepSeekR1 ? DEEP_SEEK_DEFAULT_TEMPERATURE : this.defaultTemperature,
				},
			}
		}

		// Fallback to default static model
		const isDeepSeekR1 = staticModel.id.includes("DeepSeek-R1")
		return {
			...staticModel,
			info: {
				...staticModel.info,
				temperature: isDeepSeekR1 ? DEEP_SEEK_DEFAULT_TEMPERATURE : this.defaultTemperature,
			},
		}
	}
	// kilocode_change end
}
