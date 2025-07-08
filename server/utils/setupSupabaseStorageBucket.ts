import { supabase, PRODUCT_IMAGES_BUCKET, isSupabaseConfigured } from '../config/supabase';

/**
 * Set up Supabase Storage bucket for product images
 * This function ensures the bucket exists and is configured for public access
 */
export const setupProductImagesBucket = async (): Promise<void> => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing storage buckets:', listError.message);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.id === PRODUCT_IMAGES_BUCKET);

    if (!bucketExists) {
      // Create the bucket with public access
      const { error } = await supabase.storage.createBucket(PRODUCT_IMAGES_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (error) {
        console.error('Error creating storage bucket:', error.message);
        return;
      }
    }

  } catch (error) {
    console.error('Error setting up storage bucket:', (error as Error).message);
  }
};