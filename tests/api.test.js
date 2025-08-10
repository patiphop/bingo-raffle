import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();

// Mock console.warn for pollBoard error handling
global.console = { ...console, warn: vi.fn() };

// Helper to load api.js and capture CommonJS-style exports in an ESM test env
function loadApiExports(){
  const code = readFileSync(join(process.cwd(), 'frontend/js/api.js'), 'utf8');
  const mod = { exports: {} };
  // Provide a local `module` identifier to the evaluated code so the export guard triggers
  const factory = new Function('module', 'globalThis', code + '\n;return module.exports;');
  return factory(mod, globalThis);
}

let testEnv;

beforeEach(() => {
  vi.clearAllMocks();
  // Reset localStorage mock default
  localStorageMock.getItem.mockReturnValue('https://api.example.com');
  // Reset fetch mock
  fetch.mockClear();
  // Load exports
  testEnv = loadApiExports();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('API Base URL Management', () => {
  it('should use API_BASE from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('https://test-api.com');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('apiBaseUrl');
  });

  it('should use empty string when localStorage returns null', () => {
    localStorageMock.getItem.mockReturnValue(null);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('apiBaseUrl');
  });
});

describe('ensureBase function', () => {
  it('should throw error when API_BASE is empty', () => {
    localStorageMock.getItem.mockReturnValue('');
    const testEnvEmpty = loadApiExports();
    expect(() => {
      testEnvEmpty.ensureBase();
    }).toThrow('Please set API Base URL on index.html');
  });

  it('should not throw error when API_BASE is set', () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    
    expect(() => {
      testEnv.ensureBase();
    }).not.toThrow();
  });
});

describe('getJSON function', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
  });

  it('should make GET request and return JSON', async () => {
    const mockResponse = { data: 'test' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await testEnv.getJSON('/test');
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/test', { method: 'GET' });
    expect(result).toEqual(mockResponse);
  });

  it('should throw error when response is not ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await expect(testEnv.getJSON('/test')).rejects.toThrow('HTTP 404');
  });

  it('should throw error when API_BASE is not set', async () => {
    localStorageMock.getItem.mockReturnValue('');
    const testEnvEmpty = loadApiExports();
    await expect(testEnvEmpty.getJSON('/test')).rejects.toThrow('Please set API Base URL on index.html');
  });
});

describe('postJSON function', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
  });

  it('should make POST request with payload and return JSON', async () => {
    const mockResponse = { success: true };
    const payload = { name: 'test' };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await testEnv.postJSON('/test', payload);
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/test', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    expect(result).toEqual(mockResponse);
  });

  it('should handle empty payload', async () => {
    const mockResponse = { success: true };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await testEnv.postJSON('/test');
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/test', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({})
    });
    expect(result).toEqual(mockResponse);
  });

  it('should throw error with status when response is not ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('')
    });

    await expect(testEnv.postJSON('/test', {})).rejects.toThrow('HTTP 500');
  });

  it('should include response text in error message when available', async () => {
    const errorText = 'Internal Server Error';
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve(errorText)
    });

    await expect(testEnv.postJSON('/test', {})).rejects.toThrow('HTTP 500\nInternal Server Error');
  });

  it('should handle JSON parsing errors and return empty object', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON'))
    });

    const result = await testEnv.postJSON('/test', {});
    expect(result).toEqual({});
  });

  it('should throw error when API_BASE is not set', async () => {
    localStorageMock.getItem.mockReturnValue('');
    const testEnvEmpty = loadApiExports();
    await expect(testEnvEmpty.postJSON('/test', {})).rejects.toThrow('Please set API Base URL on index.html');
  });
});

describe('Host API functions', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  it('should call apiStart with correct parameters', async () => {
    const config = { gameType: 'bingo' };
    await testEnv.apiStart(config);
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/start', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(config)
    });
  });

  it('should call apiDraw with correct parameters', async () => {
    const params = { gameId: '123' };
    await testEnv.apiDraw(params);
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(params)
    });
  });

  it('should call apiUndo with correct parameters', async () => {
    const params = { gameId: '123' };
    await testEnv.apiUndo(params);
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(params)
    });
  });

  it('should call apiEnd with correct parameters', async () => {
    const params = { gameId: '123' };
    await testEnv.apiEnd(params);
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/end', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(params)
    });
  });

  it('should call apiReset with correct parameters', async () => {
    const params = { gameId: '123' };
    await testEnv.apiReset(params);
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(params)
    });
  });
});

describe('Public API functions', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  it('should call apiJoin with correct parameters', async () => {
    const params = { gameId: '123', playerName: 'John' };
    await testEnv.apiJoin(params);
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(params)
    });
  });

  it('should call apiCard with correct parameters', async () => {
    await testEnv.apiCard('game123', 'player456');
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/card?gameId=game123&participantId=player456', {
      method: 'GET'
    });
  });

  it('should call apiCard with URL encoding', async () => {
    await testEnv.apiCard('game 123', 'player@456');
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/card?gameId=game%20123&participantId=player%40456', {
      method: 'GET'
    });
  });

  it('should call apiClaim with correct parameters', async () => {
    const params = { gameId: '123', participantId: '456' };
    await testEnv.apiClaim(params);
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(params)
    });
  });

  it('should call apiBoard with correct parameters', async () => {
    await testEnv.apiBoard('game123');
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/board?gameId=game123', {
      method: 'GET'
    });
  });

  it('should call apiBoard with URL encoding', async () => {
    await testEnv.apiBoard('game 123');
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/board?gameId=game%20123', {
      method: 'GET'
    });
  });
});

describe('pollBoard function', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    vi.useFakeTimers();
  });

  afterEach(() => {
    // advance timers to flush pending microtasks and intervals
    try { vi.runOnlyPendingTimers(); } catch {}
    vi.useRealTimers();
    // Reset polling state
    testEnv.__polling = false;
  });

  it('should poll board with default interval', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'apiBaseUrl') return 'https://api.example.com';
      if (key === 'boardRefreshSec') return null;
      return null;
    });

    const mockBoard = { lastUpdatedAt: '2023-01-01T00:00:00Z', data: 'test' };
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBoard)
    });

    const onUpdate = vi.fn();
    
    // Start polling (this will run in background)
    testEnv.pollBoard('game123', onUpdate);
    
    // allow one loop tick
    await vi.advanceTimersByTimeAsync(0);
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/board?gameId=game123', {
      method: 'GET'
    });
    expect(onUpdate).toHaveBeenCalledWith(mockBoard);
  });

  it('should use custom interval from parameter', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'apiBaseUrl') return 'https://api.example.com';
      return null;
    });

    const mockBoard = { lastUpdatedAt: '2023-01-01T00:00:00Z', data: 'test' };
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBoard)
    });

    const onUpdate = vi.fn();
    
    // Start polling with 5 second interval
    testEnv.pollBoard('game123', onUpdate, 5);
    
    // Fast-forward time
    await vi.advanceTimersByTimeAsync(100);
    
    expect(onUpdate).toHaveBeenCalledWith(mockBoard);
  });

  it('should use interval from localStorage', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'apiBaseUrl') return 'https://api.example.com';
      if (key === 'boardRefreshSec') return '2';
      return null;
    });

    const mockBoard = { lastUpdatedAt: '2023-01-01T00:00:00Z', data: 'test' };
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBoard)
    });

    const onUpdate = vi.fn();
    
    // Start polling
    testEnv.pollBoard('game123', onUpdate);
    
    // Fast-forward time
    await vi.advanceTimersByTimeAsync(100);
    
    expect(onUpdate).toHaveBeenCalledWith(mockBoard);
  });

  it('should not call onUpdate if timestamp has not changed', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');

    const mockBoard = { lastUpdatedAt: '2023-01-01T00:00:00Z', data: 'test' };
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBoard)
    });

    const onUpdate = vi.fn();
    
    // Start polling
    testEnv.pollBoard('game123', onUpdate, 1);
    
    // First poll
    await vi.advanceTimersByTimeAsync(100);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    
    // Second poll with same timestamp
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUpdate).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it('should call onUpdate when timestamp changes', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');

    const mockBoard1 = { lastUpdatedAt: '2023-01-01T00:00:00Z', data: 'test1' };
    const mockBoard2 = { lastUpdatedAt: '2023-01-01T00:01:00Z', data: 'test2' };
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBoard1)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBoard2)
      });

    const onUpdate = vi.fn();
    
    // Start polling
    testEnv.pollBoard('game123', onUpdate, 1);
    
    // First poll
    await vi.advanceTimersByTimeAsync(100);
    expect(onUpdate).toHaveBeenCalledWith(mockBoard1);
    
    // Second poll with different timestamp
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUpdate).toHaveBeenCalledWith(mockBoard2);
    expect(onUpdate).toHaveBeenCalledTimes(2);
  });

  it('should handle polling errors gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');

    fetch.mockRejectedValue(new Error('Network error'));

    const onUpdate = vi.fn();
    
    // Start polling
    testEnv.pollBoard('game123', onUpdate, 1);
    
    // Fast-forward time
    await vi.advanceTimersByTimeAsync(100);
    
    expect(console.warn).toHaveBeenCalledWith('poll error', expect.any(Error));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('should not start polling if already polling', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');

    // Set polling state to true
    testEnv.__polling = true;

    const onUpdate = vi.fn();
    
    // Try to start polling
    await testEnv.pollBoard('game123', onUpdate);
    
    expect(fetch).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('should handle missing lastUpdatedAt in response', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');

    const mockBoard = { data: 'test' }; // No lastUpdatedAt
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBoard)
    });

    const onUpdate = vi.fn();
    
    // Start polling
    testEnv.pollBoard('game123', onUpdate, 1);
    
    // Fast-forward time
    await vi.advanceTimersByTimeAsync(100);
    
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('should handle null response', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null)
    });

    const onUpdate = vi.fn();
    
    // Start polling
    testEnv.pollBoard('game123', onUpdate, 1);
    
    // Fast-forward time
    await vi.advanceTimersByTimeAsync(100);
    
    expect(onUpdate).not.toHaveBeenCalled();
  });
});