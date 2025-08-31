// src/lib/util.js
export async function pickServerMessage(res) {
  // デフォルトはステータス表示
  let msg = `HTTP ${res.status} ${res.statusText}`;
  try {
    const data = await res.json();

    // よくあるパターンを優先して拾う
    if (data?.ErrorMessageJP)
      msg = `HTTP ${res.status}: ${data.ErrorMessageJP}`; // ← これが今回のスクショ
    else if (data?.message) msg = `HTTP ${res.status}: ${data.message}`;
    else if (data?.ErrorMessageEN)
      msg = `HTTP ${res.status}: ${data.ErrorMessageEN}`;
    // 2つ以上エラーがでた場合の配列
    else if (Array.isArray(data?.errors))
      msg =
        `HTTP ${res.status}: ` +
        data.errors.map((e) => e.message ?? String(e)).join("\n");
    else if (data?.fieldErrors)
      msg = `HTTP ${res.status}: ` + Object.values(data.fieldErrors).join("\n");
    else if (typeof data === "string") msg = `HTTP ${res.status}: ${data}`;
  } catch {
    // JSONでない or 既に読み取り済みなどは黙ってデフォルトを返す
  }

  // デバッグ用ログ
  console.log("pickServerMessage:", msg);
  return msg;
}
