import { PromptVersion } from './prompt-registry';
export interface LLMClientConfig {
    modelProvider: 'openai' | 'anthropic' | 'custom';
    apiKey: string;
    environment: 'development' | 'production';
    enableLogging?: boolean;
}
export interface LLMCallOptions {
    prompt: PromptVersion;
    input: Record<string, any>;
    context?: Record<string, any>;
}
export interface LLMResponse {
    content: string;
    tokens: number;
    cost: number;
    model: string;
}
/**
 * LLM Client - Handles calls to LLM APIs
 */
export declare class LLMClient {
    private config;
    constructor(config: LLMClientConfig);
    /**
     * Call LLM with prompt
     */
    call(options: LLMCallOptions): Promise<string>;
    /**
     * Build user message from template
     */
    private buildUserMessage;
    /**
     * Call OpenAI API (stub)
     */
    private callOpenAI;
    /**
     * Call Anthropic API (stub)
     */
    private callAnthropic;
}
//# sourceMappingURL=llm-client.d.ts.map