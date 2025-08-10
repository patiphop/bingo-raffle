import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
// attach to global
// We will set return values BEFORE importing the module under test since it reads at import time
Object.defineProperty(global, 'localStorage', { value: localStorageMock, configurable: true });

// Mock fetch
Object.defineProperty(global, 'fetch', { value: vi.fn(), configurable: true });

// Mock console.warn for pollBoard error handling
global.console = { ...console, warn: vi.fn() };

async function loadApi(){
  vi.resetModules();
  return await import('../frontend/src/lib/api.js');
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('API Base URL Management', () => {
  it('should use API_BASE from localStorage', async () => {
    localStorageMock.getItem.mockImplementation((key)=>{
      if(key==='apiBaseUrl') return 'https://test-api.com';
      return null;
    });
    const api = await loadApi();
    expect(localStorageMock.getItem).toHaveBeenCalledWith('apiBaseUrl');
    // sanity check with a GET to see base is used
    fetch.mockResolvedValueOnce({ ok:true, json:()=>Promise.resolve({ok:true}) });
    await api.getJSON('/test');
    expect(fetch).toHaveBeenCalledWith('https://test-api.com/test', { method: 'GET' });
  });

  it('should allow empty string when localStorage returns null', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    const api = await loadApi();
    // ensureBase should throw when not set
    await expect(()=>api.ensureBase()).toThrow('Please set SHEET_URL in .env (or localStorage apiBaseUrl)');
  });
});

describe('ensureBase function', () => {
  it('should throw error when API_BASE is empty', async () => {
    localStorageMock.getItem.mockReturnValue('');
    const api = await loadApi();
    expect(() => {
      api.ensureBase();
    }).toThrow('Please set SHEET_URL in .env (or localStorage apiBaseUrl)');
  });

  it('should not throw error when API_BASE is set', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    const api = await loadApi();
    expect(() => {
      api.ensureBase();
    }).not.toThrow();
  });
});

describe('getJSON function', () => {
  it('should make GET request and return JSON', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    const api = await loadApi();

    const mockResponse = { data: 'test' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await api.getJSON('/test');
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/test', { method: 'GET' });
    expect(result).toEqual(mockResponse);
  });

  it('should throw error when response is not ok', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    const api = await loadApi();

    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(api.getJSON('/test')).rejects.toThrow('HTTP 404');
  });

  it('should throw error when API_BASE is not set', async () => {
    localStorageMock.getItem.mockReturnValue('');
    const api = await loadApi();
    await expect(api.getJSON('/test')).rejects.toThrow('Please set SHEET_URL in .env (or localStorage apiBaseUrl)');
  });
});

describe('postJSON function', () => {
  it('should make POST request with payload and return JSON', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    const api = await loadApi();

    const mockResponse = { success: true };
    const payload = { name: 'test' };

    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

    const result = await api.postJSON('/test', payload);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/test', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    expect(result).toEqual(mockResponse);
  });

  it('should handle empty payload', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    const api = await loadApi();

    const mockResponse = { success: true };
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

    const result = await api.postJSON('/test');
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/test', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({})
    });
    expect(result).toEqual(mockResponse);
  });

  it('should throw error with status when response is not ok', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    const api = await loadApi();

    fetch.mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('') });
    await expect(api.postJSON('/test', {})).rejects.toThrow('HTTP 500');
  });

  it('should include response text in error message when available', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    const api = await loadApi();

    const errorText = 'Internal Server Error';
    fetch.mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve(errorText) });
    await expect(api.postJSON('/test', {})).rejects.toThrow('HTTP 500\nInternal Server Error');
  });

  it('should handle JSON parsing errors and return empty object', async () => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    const api = await loadApi();

    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.reject(new Error('Invalid JSON')) });
    const result = await api.postJSON('/test', {});
    expect(result).toEqual({});
  });

  it('should throw error when API_BASE is not set', async () => {
    localStorageMock.getItem.mockReturnValue('');
    const api = await loadApi();
    await expect(api.postJSON('/test', {})).rejects.toThrow('Please set SHEET_URL in .env (or localStorage apiBaseUrl)');
  });
});

describe('Host and Public API functions', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('https://api.example.com');
    fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });
  });

  it('apiStart', async () => {
    const api = await loadApi();
    const config = { gameType: 'bingo' };
    await api.apiStart(config);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/start', {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(config)
    });
  });

  it('apiDraw', async () => {
    const api = await loadApi();
    const params = { gameId: '123' };
    await api.apiDraw(params);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/draw', {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(params)
    });
  });

  it('apiUndo', async () => {
    const api = await loadApi();
    const params = { gameId: '123' };
    await api.apiUndo(params);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/undo', {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(params)
    });
  });

  it('apiEnd', async () => {
    const api = await loadApi();
    const params = { gameId: '123' };
    await api.apiEnd(params);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/end', {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(params)
    });
  });

  it('apiReset', async () => {
    const api = await loadApi();
    const params = { gameId: '123' };
    await api.apiReset(params);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/reset', {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(params)
    });
  });

  it('apiJoin', async () => {
    const api = await loadApi();
    const params = { gameId: '123', playerName: 'John' };
    await api.apiJoin(params);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/join', {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(params)
    });
  });

  it('apiCard', async () => {
    const api = await loadApi();
    await api.apiCard('game123', 'player456');
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/card?gameId=game123&participantId=player456', { method: 'GET' });
  });

  it('apiCard encodes params', async () => {
    const api = await loadApi();
    await api.apiCard('game 123', 'player@456');
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/card?gameId=game%20123&participantId=player%40456', { method: 'GET' });
  });

  it('apiClaim', async () => {
    const api = await loadApi();
    const params = { gameId: '123', participantId: '456' };
    await api.apiClaim(params);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/claim', {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(params)
    });
  });

  it('apiBoard', async () => {
    const api = await loadApi();
    await api.apiBoard('game123');
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/board?gameId=game123', { method: 'GET' });
  });

  it('apiBoard encodes params', async () => {
    const api = await loadApi();
    await api.apiBoard('game 123');
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/board?gameId=game%20123', { method: 'GET' });
  });
});

describe('pollBoard function', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockImplementation((key)=>{
      if(key==='apiBaseUrl') return 'https://api.example.com';
      return null;
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    try { vi.runOnlyPendingTimers(); } catch {}
    vi.useRealTimers();
  });

  it('should poll board with default interval and call onUpdate on first change', async () => {
    const api = await loadApi();
    const mockBoard = { lastUpdatedAt: '2023-01-01T00:00:00Z', data: 'test' };
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockBoard) });
    const onUpdate = vi.fn();
    const stop = api.pollBoard('game123', onUpdate);
    await vi.advanceTimersByTimeAsync(0);
    expect(onUpdate).toHaveBeenCalledWith(mockBoard);
    stop();
  });

  it('should use custom interval from parameter', async () => {
    const api = await loadApi();
    const mockBoard = { lastUpdatedAt: '2023-01-01T00:00:00Z', data: 'test' };
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockBoard) });
    const onUpdate = vi.fn();
    const stop = api.pollBoard('game123', onUpdate, 5);
    await vi.advanceTimersByTimeAsync(100);
    expect(onUpdate).toHaveBeenCalledWith(mockBoard);
    stop();
  });

  it('should use interval from localStorage', async () => {
    localStorageMock.getItem.mockImplementation((key)=>{
      if(key==='apiBaseUrl') return 'https://api.example.com';
      if(key==='boardRefreshSec') return '2';
      return null;
    });
    const api = await loadApi();
    const mockBoard = { lastUpdatedAt: '2023-01-01T00:00:00Z', data: 'test' };
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockBoard) });
    const onUpdate = vi.fn();
    const stop = api.pollBoard('game123', onUpdate);
    await vi.advanceTimersByTimeAsync(100);
    expect(onUpdate).toHaveBeenCalledWith(mockBoard);
    stop();
  });

  it('should not call onUpdate again if timestamp has not changed', async () => {
    const api = await loadApi();
    const mockBoard = { lastUpdatedAt: '2023-01-01T00:00:00Z', data: 'test' };
    fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockBoard) });
    const onUpdate = vi.fn();
    const stop = api.pollBoard('game123', onUpdate, 1);
    await vi.advanceTimersByTimeAsync(0);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    stop();
  });

  it('should call onUpdate when timestamp changes', async () => {
    const api = await loadApi();
    const mockBoard1 = { lastUpdatedAt: '2023-01-01T00:00:00Z', data: 'test1' };
    const mockBoard2 = { lastUpdatedAt: '2023-01-01T00:01:00Z', data: 'test2' };
    fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockBoard1) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockBoard2) });
    const onUpdate = vi.fn();
    const stop = api.pollBoard('game123', onUpdate, 1);
    await vi.advanceTimersByTimeAsync(0);
    expect(onUpdate).toHaveBeenCalledWith(mockBoard1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUpdate).toHaveBeenCalledWith(mockBoard2);
    expect(onUpdate).toHaveBeenCalledTimes(2);
    stop();
  });

  it('should handle polling errors gracefully', async () => {
    const api = await loadApi();
    fetch.mockRejectedValue(new Error('Network error'));
    const onUpdate = vi.fn();
    const stop = api.pollBoard('game123', onUpdate, 1);
    await vi.advanceTimersByTimeAsync(100);
    expect(console.warn).toHaveBeenCalledWith('poll error', expect.any(Error));
    expect(onUpdate).not.toHaveBeenCalled();
    stop();
  });
});
