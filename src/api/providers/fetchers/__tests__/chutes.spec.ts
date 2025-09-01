// kilocode_change - new file
import { describe, it, expect, vi, beforeEach } from "vitest"
import axios from "axios"
import { getChutesModels } from "../chutes"
import type { ModelInfo } from "@roo-code/types"

// Mock axios
vi.mock("axios", () => ({
	default: {
		get: vi.fn(),
	},
}))

const mockedAxios = axios as { get: ReturnType<typeof vi.fn> }

describe("getChutesModels", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should fetch models from Chutes AI API", async () => {
		const mockResponse = {
			data: {
				object: "list",
				data: [
					{
						id: "deepseek-ai/DeepSeek-R1-0528",
						object: "model",
						created: 1640995200,
						owned_by: "deepseek-ai",
					},
					{
						id: "deepseek-ai/DeepSeek-V3",
						object: "model",
						created: 1640995200,
						owned_by: "deepseek-ai",
					},
					{
						id: "Qwen/Qwen3-235B-A22B-Instruct-2507",
						object: "model",
						created: 1640995200,
						owned_by: "qwen",
					},
					{
						id: "unsloth/Llama-3.3-70B-Instruct",
						object: "model",
						created: 1640995200,
						owned_by: "unsloth",
					},
					{
						id: "moonshotai/Kimi-K2-Instruct",
						object: "model",
						created: 1640995200,
						owned_by: "moonshot",
					},
				],
			},
		}

		mockedAxios.get.mockResolvedValue(mockResponse)

		const result = await getChutesModels("test-api-key")

		expect(mockedAxios.get).toHaveBeenCalledWith(
			"https://llm.chutes.ai/v1/models",
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: "Bearer test-api-key",
				}),
				timeout: 30000,
			}),
		)

		expect(result).toEqual({
			"deepseek-ai/DeepSeek-R1-0528": expect.objectContaining({
				maxTokens: 32768,
				contextWindow: 163840,
				supportsImages: false,
				supportsPromptCache: false,
				inputPrice: 0,
				outputPrice: 0,
				description: "deepseek-ai/DeepSeek-R1-0528 - DeepSeek R1 model with reasoning capabilities",
			}),
			"deepseek-ai/DeepSeek-V3": expect.objectContaining({
				maxTokens: 32768,
				contextWindow: 163840,
				supportsImages: false,
				supportsPromptCache: false,
				inputPrice: 0,
				outputPrice: 0,
				description: "deepseek-ai/DeepSeek-V3 - DeepSeek V3 model",
			}),
			"Qwen/Qwen3-235B-A22B-Instruct-2507": expect.objectContaining({
				maxTokens: 32768,
				contextWindow: 262144,
				supportsImages: false,
				supportsPromptCache: false,
				inputPrice: 0,
				outputPrice: 0,
				description: "Qwen/Qwen3-235B-A22B-Instruct-2507 - Qwen model series",
			}),
			"unsloth/Llama-3.3-70B-Instruct": expect.objectContaining({
				maxTokens: 32768,
				contextWindow: 131072,
				supportsImages: false,
				supportsPromptCache: false,
				inputPrice: 0,
				outputPrice: 0,
				description: "unsloth/Llama-3.3-70B-Instruct - Llama model series",
			}),
			"moonshotai/Kimi-K2-Instruct": expect.objectContaining({
				maxTokens: 32768,
				contextWindow: 131072,
				supportsImages: false,
				supportsPromptCache: false,
				inputPrice: 0,
				outputPrice: 0,
				description: "moonshotai/Kimi-K2-Instruct - Moonshot AI Kimi model",
			}),
		})
	})

	it("should work without API key", async () => {
		const mockResponse = {
			data: {
				object: "list",
				data: [
					{
						id: "test-model",
						object: "model",
						created: 1640995200,
						owned_by: "test",
					},
				],
			},
		}

		mockedAxios.get.mockResolvedValue(mockResponse)

		const result = await getChutesModels()

		expect(mockedAxios.get).toHaveBeenCalledWith(
			"https://llm.chutes.ai/v1/models",
			expect.objectContaining({
				headers: expect.not.objectContaining({
					Authorization: expect.any(String),
				}),
			}),
		)

		expect(result).toEqual({
			"test-model": expect.objectContaining({
				maxTokens: 32768,
				contextWindow: 131072,
				description: "test-model - Chutes AI model",
			}),
		})
	})

	it("should use custom base URL", async () => {
		const mockResponse = {
			data: {
				object: "list",
				data: [],
			},
		}

		mockedAxios.get.mockResolvedValue(mockResponse)

		await getChutesModels("test-key", "https://custom.chutes.ai/v1")

		expect(mockedAxios.get).toHaveBeenCalledWith(
			"https://custom.chutes.ai/v1/models",
			expect.any(Object),
		)
	})

	it("should handle API errors", async () => {
		const error = new Error("API Error")
		mockedAxios.get.mockRejectedValue(error)

		await expect(getChutesModels("test-key")).rejects.toThrow("API Error")
	})

	it("should handle invalid response format", async () => {
		const invalidResponse = {
			data: {
				invalid: "format",
			},
		}

		mockedAxios.get.mockResolvedValue(invalidResponse)

		await expect(getChutesModels("test-key")).rejects.toThrow("Invalid Chutes AI models response format")
	})
})