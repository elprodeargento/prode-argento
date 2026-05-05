export async function uploadToR2(file: File, businessId?: string): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const formData = new FormData();
  formData.append('file', file);
  if (businessId) formData.append('businessId', businessId);

  const response = await fetch(`${apiUrl}/storage/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  const { url } = await response.json();
  return url;
}
