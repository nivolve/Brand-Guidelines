export async function onRequest(context) {
  const response = await context.next();
  const mutableResponse = new Response(response.body, response);
  mutableResponse.headers.set("X-Robots-Tag", "noindex");
  return mutableResponse;
}
