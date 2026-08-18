// Rules 规则文件 —— 参照 Continue 的 .continue/rules 机制
// 规则目录：<库根目录>/.notepilot-rules/*.md（向后兼容旧目录 .qoder-rules）
// 支持 frontmatter：alwaysApply: true（默认 true）

import { App, TFile } from "obsidian";

export const RULES_DIR = ".notepilot-rules";
/** 旧品牌目录（向后兼容，重名规则以新目录为准） */
const LEGACY_RULES_DIR = ".qoder-rules";

interface Rule {
	name: string;
	content: string;
	alwaysApply: boolean;
}

function parseFrontmatter(text: string): { body: string; alwaysApply: boolean } {
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { body: text, alwaysApply: true };
	const body = text.slice(match[0].length);
	const alwaysApply = !/alwaysApply:\s*false/.test(match[1]);
	return { body, alwaysApply };
}

/** 加载库内所有启用的规则，拼接为文本（新目录优先，旧目录兜底） */
export async function loadRules(app: App): Promise<string> {
	const files = app.vault.getMarkdownFiles().filter(
		(f: TFile) =>
			f.path.startsWith(RULES_DIR + "/") || f.path.startsWith(LEGACY_RULES_DIR + "/")
	);
	if (files.length === 0) return "";

	const rules: Rule[] = [];
	for (const file of files) {
		try {
			const raw = await app.vault.read(file);
			const { body, alwaysApply } = parseFrontmatter(raw);
			if (alwaysApply && body.trim()) {
				rules.push({ name: file.basename, content: body.trim(), alwaysApply });
			}
		} catch {
			// 跳过无法读取的规则文件
		}
	}

	// 新目录优先：去掉旧目录中与新目录重名的规则
	const newNames = new Set(
		files
			.filter((f) => f.path.startsWith(RULES_DIR + "/"))
			.map((f) => f.basename)
	);
	const deduped = rules.filter(
		(r) => newNames.has(r.name) || !files.some((f) => f.path.startsWith(LEGACY_RULES_DIR + "/") && f.basename === r.name)
	);

	if (deduped.length === 0) return "";
	return deduped
		.map((r) => `### 规则：${r.name}\n${r.content}`)
		.join("\n\n");
}
