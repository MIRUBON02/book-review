// vitest.config.js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    // ← ここで「単体テストだけ」拾うようにする
    globals: true,
    include: [
      "src/**/*.{test,spec}.{js,jsx,ts,tsx}",
      "src/**/__tests__/*.{js,jsx,ts,tsx}",
    ],
    exclude: ["node_modules", "dist", "e2e", "tests", "tests-examples"],
  },
});
