export interface MetadataProviderInterface {
    canHandle(path: string, type: string): boolean;
    getMetadata(path: string, type: string): any;
    ensureMetadataCached?(path: string, type: string): Promise<void>;
}