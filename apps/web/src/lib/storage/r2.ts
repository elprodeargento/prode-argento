export async function getPresignedUrl(filename: string, contentType: string) {
  // In a real app, this might point to a different API domain if WEB and API are separate
  // Based on context, the API is running on NEXT_PUBLIC_APP_URL/api or a separate domain.
  // For local dev, they might be on different ports, but usually nextjs calls the API via absolute URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const response = await fetch(`${apiUrl}/storage/presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filename, contentType }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate presigned URL');
  }

  return response.json();
}

export async function uploadToR2(file: File): Promise<string> {
  const { presignedUrl, publicUrl } = await getPresignedUrl(file.name, file.type);

  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to R2');
  }

  return publicUrl;
}
