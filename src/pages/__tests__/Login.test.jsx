// src/pages/__tests__/Login.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../Login";
import { MemoryRouter } from "react-router-dom";

//テスト用に Router コンテキストでラップする（/login を初期表示にする）
function renderWithRouter(ui) {
  return render(<MemoryRouter initialEntries={["/login"]}>{ui}</MemoryRouter>);
}

const mockFetchOk = () => {
  // 成功レスポンスを返す fetch を用意（token を返すことが大事）
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: "test-token" }),
    })
  );
};

describe("Login page", () => {
  beforeEach(() => {
    // window.alert をモック化（本物のポップアップを出さずに呼び出し回数や引数を記録できるようにする）
    vi.spyOn(window, "alert").mockImplementation(() => {});
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("見出し・メール・パスワード・ログインボタンが表示される", () => {
    renderWithRouter(<Login />);

    // 見出し（h1など）で "ログイン" という名前を持つ要素が存在することを確認
    expect(
      screen.getByRole("heading", { name: /ログイン/i })
    ).toBeInTheDocument();

    // メールアドレス入力欄が存在することを確認
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();

    // パスワード入力欄が存在することを確認
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();

    // ログインボタンが存在することを確認
    expect(
      screen.getByRole("button", { name: /ログイン/i })
    ).toBeInTheDocument();
  });

  it("未入力で送信するとエラー、正しく入力すると成功alert", async () => {
    // ユーザー操作を再現するためのインスタンスを作成
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    // 未入力のまま "ログイン" ボタンをクリック
    await user.click(screen.getByRole("button", { name: /ログイン/i }));

    // role="alert" を持つ要素（エラーメッセージ）が1つ以上表示されることを確認
    expect(await screen.findAllByRole("alert")).toBeTruthy();

    // メールアドレス欄を空にしてから "test@example.com" を入力
    await user.clear(screen.getByLabelText(/メールアドレス/i));
    await user.type(
      screen.getByLabelText(/メールアドレス/i),
      "test@example.com"
    );

    // パスワード欄を空にしてから "password123" を入力
    await user.clear(screen.getByLabelText(/パスワード/i));
    await user.type(screen.getByLabelText(/パスワード/i), "password123");

    // ここで fetch を成功モックに差し替える
    mockFetchOk();

    // 再び "ログイン" ボタンをクリック
    await user.click(screen.getByRole("button", { name: /ログイン/i }));

    // window.alert が指定したメッセージで呼ばれたことを確認
    expect(window.alert).toHaveBeenCalledWith("ログインできました");
  });
});
