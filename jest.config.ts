import type { Config } from "jest";

const configuracao: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/src/**/*.test.ts"],
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts"],
  coverageThreshold: {
    global: {},
    "./src/pricing/": { branches: 80 },
    "./src/facade/": { branches: 80 }
  }
};

export default configuracao;
