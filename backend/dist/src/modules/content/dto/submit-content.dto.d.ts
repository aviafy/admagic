import { ContentType, AIProvider } from '../../../common/constants';
export declare class SubmitContentDto {
    contentType: ContentType;
    contentText?: string;
    contentUrl?: string;
    aiProvider?: AIProvider;
}
