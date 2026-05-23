# 関数のグラフ概形4択ゲーム

受験で頻出の関数について、数式から正しいグラフ概形を4択で選ぶ Next.js アプリです。

## 技術構成

- Next.js App Router
- TypeScript
- Tailwind CSS
- KaTeX
- 事前生成 SVG グラフ

## 開発コマンド

```bash
npm install
npm run generate:graphs
npm run dev
```

型チェック:

```bash
npm run lint
```

本番ビルド:

```bash
npm run build
```

## データ構成

- 問題定義: `data/problems.json`
- グラフ生成スクリプト: `scripts/generate_graphs.py`
- 生成先: `public/graphs`

各問題は `formula_latex` と `formula_python` を分けて持ちます。表示は KaTeX、SVG 生成は Python スクリプトが担当します。

## 現在の仕様

- 1プレイ10問固定
- 前半やさしめ、後半やや難しめ
- 回答後に正解グラフを拡大表示
- 解説は1〜2文の短文
- 結果画面は正答数のみ
- ローカル保存なし

## Vercel メモ

- この構成のまま静的アセット込みでデプロイ可能
- 問題追加時は `data/problems.json` を更新し、`npm run generate:graphs` を再実行する
