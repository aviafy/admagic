export interface AuthenticatedUser {
    userId: string;
    email?: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
