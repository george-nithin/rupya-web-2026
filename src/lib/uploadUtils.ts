import { supabase } from "@/lib/supabase";

export async function uploadTradeScreenshot(file: File, userId: string): Promise<string | null> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('trade-screenshots')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('trade-screenshots')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Upload failed:', error);
        return null;
    }
}
