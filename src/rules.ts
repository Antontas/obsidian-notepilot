// Rules 规则文件 —— 参照 Continue 的 .continue/rules 机制
// 规则目录：<库根目录>/.qoder-rules/*.md
// 支持 frontmatter：alwaysApply: true（默认 true）

import { App, TFile } from "obsidian";

export const RULES_DIR = ".qoder-rules";

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

/** 加载库内所有启用的规则，拼接为文本 */
export async function loadRules(app: App): Promise<string> {
	const folder = app.vault.getAbstractFileByPath(RULES_DIR);
	if (!folder) return "";

	const rules: Rule[] = [];
	const files = app.vault.getMarkdownFiles().filter((f: TFile) =>
		f.path.startsWith(RULES_DIR + "/")
	);
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

	if (rules.length === 0) return "";
	return rules
		.map((r) => `### 规则：${r.name}\n${r.content}`)
		.join("\n\n");
}
