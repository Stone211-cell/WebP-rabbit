
import { defineConfig, globalIgnores } from 'eslint/config'





export default defineConfig([
  {
    extends: ["next/core-web-vitals"], // <-- แก้ตรงนี้
    rules: {
      "next/core-web-vitals": "warn",
    },
  },
  globalIgnores([

    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',

    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "lib/generated/prisma/**",

  ]),
]);
