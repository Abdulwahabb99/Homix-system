import path from "path";

export type MockMap = Record<string, unknown>;

const resolveMockPath = (modulePath: string, relativePath: string): string => {
  return path.resolve(path.dirname(modulePath), relativePath);
};

export const loadModuleWithMocks = <TModule>(
  modulePath: string,
  mocks: MockMap = {},
): TModule => {
  jest.resetModules();

  let loadedModule: unknown;
  jest.isolateModules(() => {
    Object.entries(mocks).forEach(([relativePath, mockValue]) => {
      jest.doMock(resolveMockPath(modulePath, relativePath), () => mockValue);
    });

    loadedModule = require(modulePath);
  });

  if (
    loadedModule &&
    typeof loadedModule === "object" &&
    "default" in (loadedModule as Record<string, unknown>)
  ) {
    return (loadedModule as { default: TModule }).default;
  }

  return loadedModule as TModule;
};
