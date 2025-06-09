import { 
    HigherTierImageGenerationRequest, 
    HigherTierImageGenerationResponse, 
    LowerTierImageGenerationRequest, 
    LowerTierImageGenerationResponse 
} from "../types";


export interface ImageGenerationStrategy {
    generate(
        request: LowerTierImageGenerationRequest | HigherTierImageGenerationRequest
    ): Promise<LowerTierImageGenerationResponse | HigherTierImageGenerationResponse>;
}
