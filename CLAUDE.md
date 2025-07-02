## 00-基本情報

**プロジェクト**: sample-todo
**技術スタック**: JavaScript, Jest, GitHub Actions
**開発方式**: TDD (Test-Driven Development)

## 01-開発ルール

### ワークフロー
1. あなたがタスクを指示 → 私が Linear Issue 作成
2. ブランチ名: `{username}/fortune-{number}-{title}` 形式
3. TDD: Red → Green → Refactor サイクルを厳守
4. PR 作成時に Linear Issue ID を含める

### コマンド
```bash
npm test          # テスト実行
npm run test:coverage  # カバレッジ付きテスト
```

## 02-禁止事項

- [ ] テストなしでの実装
- [ ] 手動での Linear ステータス更新
- [ ] main ブランチへの直接コミット
- [ ] 2KB を超える単一ファイルの作成

## 03-外部ドキュメント

詳細は以下を参照:
- @docs/linear-github-claude-workflow.md
- @docs/quick-reference.md
- @.claude/plan.md
- @.claude/architecture.md

## 04-Gemini 活用

実装前に `gemini -p` で技術検証を実施。特に:
- 新規ライブラリ導入時
- アーキテクチャ変更時
- エラー解決時

