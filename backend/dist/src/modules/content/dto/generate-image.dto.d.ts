export declare class GenerateImageDto {
    prompt: string;
    size?: "1024x1024" | "1792x1024" | "1024x1792";
    quality?: "standard" | "hd";
}
export declare class GenerateImageResponseDto {
    imageUrl: string;
    revisedPrompt?: string;
}
