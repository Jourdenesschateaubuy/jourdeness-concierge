export async function readJsonResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<T> {
  const text = await response.text();

  if (!text.trim()) {
    if (!response.ok) {
      throw new Error(`${fallbackMessage}（HTTP ${response.status}）`);
    }

    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      response.ok
        ? `${fallbackMessage}：伺服器回傳格式錯誤`
        : `${fallbackMessage}（HTTP ${response.status}）`
    );
  }
}
