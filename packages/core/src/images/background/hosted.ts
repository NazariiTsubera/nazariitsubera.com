/**
 * Posts the image to a background-removal endpoint and expects a PNG with alpha back.
 * Provider-agnostic on purpose: any service that takes multipart image bytes and returns a
 * cutout works, so swapping providers is an env change.
 */
export async function hostedRemoveBackground(
  image: Uint8Array,
  endpoint: string,
  apiKey: string,
): Promise<Uint8Array> {
  const form = new FormData();
  form.append("image_file", new Blob([image as BlobPart], { type: "image/jpeg" }), "image.jpg");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    body: form,
  });
  if (!response.ok) {
    throw new Error(`Background removal failed (${response.status}): ${await response.text().catch(() => "")}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}
