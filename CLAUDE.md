## 00-基本情報

**プロジェクト**: @.claude/project.md
**技術スタック**: @.claude/tech-stack.md
**開発方式**: TDD (Test-Driven Development)

## 01-開発ルール

### ワークフロー
1. タスク指示 → Linear Issue 自動作成
2. ブランチ名: `{prefix}/{issue-key}-{description}` 形式
3. TDD: Red → Green → Refactor サイクル厳守
4. PR 作成時に Issue ID を含める

### CI/CDサイクル
詳細: @.claude/ci-cd-workflow.md

### 実行前確認
```bash
# テストコマンドは package.json 参照
# Linter/Formatter は設定ファイル参照
```

## 02-禁止事項

- [ ] テストなしでの実装
- [ ] Issue 管理システムの手動更新
- [ ] デフォルトブランチへの直接コミット
- [ ] 単一ファイル 500行超

### CI/CD関連禁止事項
詳細: @.claude/ci-cd-workflow.md

## 03-外部参照

@.claude/imports.md

## 04-AI 連携

実装前に技術検証を実施:
- 新規ライブラリ導入時
- アーキテクチャ変更時
- 複雑なエラー解決時

詳細: @.claude/ai-guidelines.md

