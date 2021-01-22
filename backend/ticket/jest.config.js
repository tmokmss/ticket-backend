module.exports = {
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  setupFiles: ["dotenv/config"],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: "reports",
      outputName: "jest.xml",
    }]
  ],
  collectCoverage: true,
  coverageDirectory: "reports",
  coverageReporters: ["clover"],
};
