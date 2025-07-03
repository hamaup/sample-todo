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

## 03-外部参照

@.claude/imports.md

## 04-AI 連携

実装前に技術検証を実施:
- 新規ライブラリ導入時
- アーキテクチャ変更時
- 複雑なエラー解決時

詳細: @.claude/ai-guidelines.md

## 05-自動テスト修正・マージ

### 自動修正対象
- スナップショットテストの更新
- テスト期待値の実装との同期
- 軽微なリント警告の修正

### 自動マージ条件
1. 全てのCIチェックが合格
2. `auto-merge`ラベルが付与されている
3. ブロッキングラベルがない
4. PRがドラフトではない

### 禁止事項
- セキュリティ関連の自動修正
- 破壊的変更の自動マージ
- 手動レビューが必要なPRの自動処理

## 06-マージ後自動処理

### 自動実行タスク
1. **CHANGELOG.md更新**
   - Conventional Commits形式の解析
   - セマンティックバージョニングに従った更新
   
2. **Linear Issue管理**
   - FORTUNE-XXX形式のIssue自動クローズ
   - マージ完了コメントの追加
   
3. **リリースノート生成**
   - docs/RELEASE_NOTES.mdの更新
   - 重要な変更点の要約

4. **GitHub Release作成**
   - `release`ラベル付きPRの場合
   - タグ作成とリリースノート公開

### 実行条件
- mainブランチへのマージ時のみ
- Claude Code GitHub Actionsによる自動実行

