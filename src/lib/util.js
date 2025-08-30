// src/lib/util.js
export async function pickServerMessage(res) {
  // デフォルトはステータス表示
  let msg = `HTTP ${res.status} ${res.statusText}`;
  try {
    const data = await res.json();

    // よくあるパターンを優先して拾う
    if (data?.ErrorMessageJP)
      msg = data.ErrorMessageJP; // ← これが今回のスクショ
    else if (data?.message) msg = data.message;
    else if (data?.ErrorMessageEN) msg = data.ErrorMessageEN;
    else if (Array.isArray(data?.errors))
      msg = data.errors.map((e) => e.message ?? String(e)).join("\n");
    else if (data?.fieldErrors)
      msg = Object.values(data.fieldErrors).join("\n");
    else if (typeof data === "string") msg = data;
  } catch {
    // JSONでない or 既に読み取り済みなどは黙ってデフォルトを返す
  }
  return msg;
}
