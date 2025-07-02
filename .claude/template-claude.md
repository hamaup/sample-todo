# 汎用 CLAUDE.md テンプレート

このファイルを新規プロジェクトの CLAUDE.md として使用できます。

```markdown
## 00-基本情報

**プロジェクト**: @.claude/project.md
**技術スタック**: @.claude/tech-stack.md
**開発方式**: TDD (Test-Driven Development)

## 01-開発ルール

### ワークフロー
1. タスク指示 → Issue 自動作成
2. ブランチ名: `{prefix}/{issue-key}-{description}` 形式
3. TDD: Red → Green → Refactor サイクル厳守
4. PR 作成時に Issue ID を含める

### 実行前確認
\`\`\`bash
# テストコマンドは package.json 参照
# Linter/Formatter は設定ファイル参照
\`\`\`

## 02-禁止事項

- [ ] テストなしでの実装
- [ ] Issue 管理システムの手動更新
- [ ] デフォルトブランチへの直接コミット
- [ ] 単一ファイル 500行超

## 03-外部参照

@.claude/imports.md

## 04-AI 連携

実装前に技術検証を実施:
- 新規ライブラリ導入時
- アーキテクチャ変更時
- 複雑なエラー解決時

詳細: @.claude/ai-guidelines.md
```

## カスタマイズ方法

1. `.claude/` ディレクトリを作成
2. 以下のファイルを配置:
   - `project.md` - プロジェクト固有情報
   - `tech-stack.md` - 使用技術一覧
   - `imports.md` - 参照ドキュメント一覧
   - `ai-guidelines.md` - AI 活用ルール

3. 必要に応じて追加:
   - `plan.md` - スプリント計画
   - `architecture.md` - アーキテクチャ設計
   - `commands.md` - カスタムコマンド集