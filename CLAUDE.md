## 基本情報

**プロジェクト**: sample-todo
**技術スタック**: JavaScript, Jest, Node.js
**開発方式**: TDD (Test-Driven Development)

## 開発ルール

### ワークフロー
1. Issue に @claude メンション → 自動実装
2. ブランチ名: `{username}/{issue-key}-{description}` 形式
3. PR 作成時に Issue ID を含める（例: Closes #FORTUNE-123）

### 実行コマンド
```bash
npm test     # テスト実行
npm run lint # Lintチェック
```

## 禁止事項

- テストなしでの実装
- main ブランチへの直接コミット
- セキュリティキーのハードコーディング

## マージ後の自動処理

PRがマージされると自動的に：
1. CHANGELOG.md 更新
2. Linear Issue を Done に更新
3. リリースノート生成（docs/RELEASE_NOTES.md）
4. release ラベル付きPRの場合は GitHub Release 作成

