import type { Config } from "jest";

const configuracao: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  clearMocks: true
};

export default configuracao;
