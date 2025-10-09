import { supabase } from './supabaseClient';

// Upload an image and return its public URL
export async function uploadLeadImage(file: File, leadId: string) {
  const filePath = `leads/${leadId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from('lead-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('lead-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Delete an image from storage given its public URL
export async function deleteLeadImage(imageUrl: string) {
  if (!imageUrl) return;
  try {
    const url = new URL(imageUrl);
    const imagePath = url.pathname.split('/public/lead-images/')[1];
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const { error } = await supabase.storage
      .from('lead-images')
      .remove([cleanImagePath]);
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting image:', err);
  }
}