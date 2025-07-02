# アーキテクチャ設計

## ディレクトリ構造
```
sample-todo/
├── src/
│   ├── todoApp.js      # メインロジック
│   ├── todoApp.test.js # テスト
│   └── styles.css      # スタイル
├── docs/               # ドキュメント
├── .github/           # CI/CD設定
└── .claude/           # Claude専用設定
```

## 状態管理
- 配列ベースのシンプルな状態管理
- `todos` 配列に全てのTODOを格納
- `render()` 関数で DOM を再構築

## テスト戦略
- Jest + jest-environment-jsdom
- TDD アプローチ
- カバレッジ目標: 90%以上

## CI/CD
- GitHub Actions で自動テスト
- Node.js 18.x, 20.x でマトリックステスト
- PR 時に自動実行