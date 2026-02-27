// utils/attachmentHelper.ts

export interface BackendAttachment {
    id: string;
    file_name: string;
    content_type: string;
    file_data_base64?: string | null;
}

const base64ToFile = (
    base64: string,
    fileName: string,
    contentType: string
): File => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    return new File([byteArray], fileName, {
        type: contentType,
    });
};

export const mapAttachmentsToFiles = (
    attachments: BackendAttachment[] = []
): FileWithPreview[] => {
    return attachments
        .filter((att) => att.file_data_base64)
        .map((att) => {
            const file = base64ToFile(
                att.file_data_base64!,
                att.file_name,
                att.content_type
            ) as FileWithPreview;

            file.preview = URL.createObjectURL(file);
            file.attachmentId = att.id;

            return file;
        });
};
/**
 * Cleanup preview URLs (IMPORTANT to avoid memory leaks)
 */
export const revokeAttachmentPreviews = (
    files: File[]
) => {
    files.forEach((file) => {
        const f = file as FileWithPreview;

        if (f.preview) {
            URL.revokeObjectURL(f.preview);
        }
    });
};

export type FileWithPreview = File & {
    preview?: string;
    attachmentId?: string; // existing backend file
};