import { describe, it, expect } from 'vitest';
import config from '../vite.config.js';

describe('Vite Configuration', () => {
  it('should export a valid configuration object', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });

  it('should have correct root directory', () => {
    expect(config.root).toBe('frontend');
  });

  it('should have correct base path', () => {
    expect(config.base).toBe('./');
  });

  it('should have server configuration', () => {
    expect(config.server).toBeDefined();
    expect(typeof config.server).toBe('object');
  });

  it('should have correct server port', () => {
    expect(config.server.port).toBe(5173);
  });

  it('should have host enabled', () => {
    expect(config.server.host).toBe(true);
  });

  it('should have build configuration', () => {
    expect(config.build).toBeDefined();
    expect(typeof config.build).toBe('object');
  });

  it('should have correct output directory', () => {
    expect(config.build.outDir).toBe('../dist');
  });

  it('should have emptyOutDir enabled', () => {
    expect(config.build.emptyOutDir).toBe(true);
  });

  it('should have all required configuration properties', () => {
    const requiredProps = ['root', 'base', 'server', 'build'];
    requiredProps.forEach(prop => {
      expect(config).toHaveProperty(prop);
    });
  });

  it('should have correct server configuration structure', () => {
    expect(config.server).toHaveProperty('port');
    expect(config.server).toHaveProperty('host');
  });

  it('should have correct build configuration structure', () => {
    expect(config.build).toHaveProperty('outDir');
    expect(config.build).toHaveProperty('emptyOutDir');
  });

  it('should use relative paths correctly', () => {
    // Test that paths are relative and properly formatted
    expect(config.root).not.toStartWith('/');
    expect(config.base).toBe('./');
    expect(config.build.outDir).toStartWith('../');
  });

  it('should have numeric port value', () => {
    expect(typeof config.server.port).toBe('number');
    expect(config.server.port).toBeGreaterThan(0);
    expect(config.server.port).toBeLessThan(65536);
  });

  it('should have boolean values for boolean properties', () => {
    expect(typeof config.server.host).toBe('boolean');
    expect(typeof config.build.emptyOutDir).toBe('boolean');
  });
});
