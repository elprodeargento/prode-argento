const BASE = 'https://graph.facebook.com/v22.0'

async function callIG<T>(path: string, params: Record<string, string>, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  if (method === 'GET') Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(method === 'POST' ? { body: JSON.stringify(params) } : {}),
  })

  if (!res.ok) throw new Error(`Instagram API error: ${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

/**
 * Step 1: Create a media container with the image URL + caption
 * The imageUrl must be publicly accessible (e.g., stored in Supabase Storage)
 */
export async function createMediaContainer({
  igUserId,
  accessToken,
  imageUrl,
  caption,
}: {
  igUserId: string
  accessToken: string
  imageUrl: string
  caption: string
}): Promise<{ id: string }> {
  return callIG<{ id: string }>(
    `/${igUserId}/media`,
    { image_url: imageUrl, caption, access_token: accessToken },
    'POST',
  )
}

/**
 * Step 2: Publish the media container
 */
export async function publishMedia({
  igUserId,
  accessToken,
  creationId,
}: {
  igUserId: string
  accessToken: string
  creationId: string
}): Promise<{ id: string }> {
  return callIG<{ id: string }>(
    `/${igUserId}/media_publish`,
    { creation_id: creationId, access_token: accessToken },
    'POST',
  )
}

/**
 * Full flow: upload image URL → publish post → return post ID
 */
export async function publishPodioPost({
  igUserId,
  accessToken,
  imageUrl,
  caption,
  hashtags,
}: {
  igUserId: string
  accessToken: string
  imageUrl: string
  caption: string
  hashtags: string[]
}) {
  const fullCaption = `${caption}\n\n${hashtags.join(' ')}`
  const container = await createMediaContainer({ igUserId, accessToken, imageUrl, caption: fullCaption })
  const post = await publishMedia({ igUserId, accessToken, creationId: container.id })
  return post
}

/** Instagram webhook: validate subscription */
export function validateWebhookChallenge(
  mode: string,
  token: string,
  challenge: string,
): string | null {
  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return challenge
  }
  return null
}
