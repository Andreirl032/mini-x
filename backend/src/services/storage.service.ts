import { supabase } from "../config/supabase";
import { AppError } from "../errors/AppError";

export async function uploadImageToSupabase(
  fileBuffer: Buffer,
  fileName: string,
  mimetype: string,
  bucketName: string = "avatars"
): Promise<string> {
  // O método atualizado de upload usando SDK v2
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType: mimetype,
      upsert: true, // Se já existir uma imagem com esse nome, ele substitui
    });

  if (error) {
    throw new AppError(`Failed to upload image: ${error.message}`, 500);
  }

  // Pega a URL pública atualizada da imagem recém-upada
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}