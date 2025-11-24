import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginImport from "eslint-plugin-import";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js },
        extends: ["js/recommended"]
    },
    {
        files: ["**/*.{js,mjs,cjs}"],
        languageOptions: { globals: globals.browser }
    },
    {
        ignores: ["node_modules/**", "**/vendor/**", "dist/**", "*.min.js"],
        files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
                jQuery: 'readonly'
            }
        },
        plugins: {
            prettier: eslintPluginPrettier,
            import: eslintPluginImport
        },
        rules: {
            // 🧹 Formatting handled by Prettier
            ...eslintConfigPrettier.rules,
            "prettier/prettier": [
                "error",
                {
                    tabWidth: 4,
                    useTabs: false,
                    trailingComma: "none",
                    singleQuote: true,
                    semi: true
                }
            ],

            // 📦 Imports
            "no-duplicate-imports": "error",
            "import/order": [
                "error",
                {
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                    "newlines-between": "always"
                }
            ],

            // 📏 Code structure
            "padding-line-between-statements": [
                "error",
                { blankLine: "always", prev: "import", next: "*" },
                { blankLine: "any", prev: "import", next: "import" },

                { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
                { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },

                { blankLine: "always", prev: "*", next: "return" },
                { blankLine: "always", prev: "*", next: ["if", "for", "while", "switch", "try"] },
                { blankLine: "always", prev: "block-like", next: "*" }
            ],

            // 🛑 Prevent common bugs
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "warn",
            "no-debugger": "error",

            // ✅ Code clarity
            eqeqeq: ["error", "always"],
            curly: ["error", "all"],
            "no-multi-spaces": "error",

            // 💬 Comments
            "spaced-comment": ["error", "always", { markers: ["/"] }],

            // 🧠 Optional: Prevent nested ternaries (too hard to read)
            "no-nested-ternary": "error",

             // ⏸️ Disabled rules
            "no-redeclare": "off",
            "@typescript-eslint/no-redeclare": "off"
        }
    }
]);
