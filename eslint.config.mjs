import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("eslint:recommended"), {
    languageOptions: {
        globals: {
            ...globals.browser,
        },

        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {
        "no-inline-comments": "error",
        "no-sequences": "error",
        "no-unused-expressions": "error",
        "no-useless-call": "error",
        "no-useless-return": "error",
        "no-var": "error",
        "prefer-const": "error",
        "no-trailing-spaces": "error",
        radix: "error",
    },
}];