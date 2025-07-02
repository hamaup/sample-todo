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

### 開発サイクル (CI/CDフロー)
**重要**: CIが通るまでプルリクエストは完了とみなさない

```bash
# 1. 実装前：ローカルテスト実行
npm test                    # 全テスト実行
npm run test:coverage       # カバレッジチェック (80%以上必須)

# 2. 実装 → コミット → プッシュ

# 3. CI確認
gh pr checks <PR番号>       # CI状況確認
gh run view <run-id> --log-failed  # 失敗時の詳細ログ確認

# 4. CI失敗時の対処
# - ローカルで再現・修正・テスト
# - 修正コミット・プッシュ
# - 再度CI確認
# - ✅全チェック成功まで繰り返し
```

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
- [ ] CI失敗状態でのPRマージ
- [ ] カバレッジ80%未満でのプッシュ
- [ ] テスト実行なしでのコミット

## 03-外部参照

@.claude/imports.md

## 04-AI 連携

実装前に技術検証を実施:
- 新規ライブラリ導入時
- アーキテクチャ変更時
- 複雑なエラー解決時

詳細: @.claude/ai-guidelines.md

