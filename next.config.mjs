/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // このプロジェクトには .eslintrc を同梱していないため、ビルド時のESLint実行を無効化。
  // 型エラー（TypeScript）はこれまで通りビルドをブロックします。
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
