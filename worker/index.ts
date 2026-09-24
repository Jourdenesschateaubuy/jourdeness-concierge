import handler from "vinext/server/fetch-handler";

type R2ObjectLike = {
  body: ReadableStream;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
};

type R2BucketLike = {
  get(key: string): Promise<R2ObjectLike | null>;
  head(key: string): Promise<
    | {
        httpEtag: string;
        writeHttpMetadata(headers: Headers): void;
      }
    | null
  >;
};

type Env = {
  JOURDENESS_MEDIA: R2BucketLike;
  [key: string]: unknown;
};

const MEDIA_ROUTE =
  /^\/api\/studio\/media\/(\d+)\/file$/;

async function handleR2Media(
  request: Request,
  env: Env,
  mediaId: string
): Promise<Response | null> {
  const key = `media/${mediaId}`;

  if (request.method === "HEAD") {
    const object =
      await env.JOURDENESS_MEDIA.head(key);

    if (!object) {
      return null;
    }

    const headers =
      new Headers();

    object.writeHttpMetadata(headers);
    headers.set(
      "etag",
      object.httpEtag
    );

    headers.set(
      "Cache-Control",
      headers.get("Cache-Control") ||
        "public, max-age=3600"
    );

    return new Response(null, {
      status: 200,
      headers,
    });
  }

  if (request.method !== "GET") {
    return null;
  }

  const object =
    await env.JOURDENESS_MEDIA.get(key);

  if (!object) {
    return null;
  }

  const headers =
    new Headers();

  object.writeHttpMetadata(headers);

  headers.set(
    "etag",
    object.httpEtag
  );

  headers.set(
    "Cache-Control",
    headers.get("Cache-Control") ||
      "public, max-age=3600"
  );

  return new Response(
    object.body,
    {
      status: 200,
      headers,
    }
  );
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: Parameters<typeof handler.fetch>[2]
  ): Promise<Response> {
    const url =
      new URL(request.url);

    const match =
      MEDIA_ROUTE.exec(
        url.pathname
      );

    if (match) {
      const response =
        await handleR2Media(
          request,
          env,
          match[1]
        );

      if (response) {
        return response;
      }
    }

    /*
     * R2 沒有物件時，
     * 仍交回原本 vinext / Next route。
     *
     * 因此：
     * localhost:3000 原本 NAS 邏輯不受影響；
     * Cloudflare 若尚未發布到 R2，
     * 還保留原本 fallback 行為。
     */
    return handler.fetch(
      request,
      env as any,
      ctx
    );
  },
};
