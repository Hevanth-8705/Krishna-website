import { normalizeApiError } from '../../src/lib/errorUtils';

describe('errorUtils - normalizeApiError', () => {
  it('handles falsy values', () => {
    expect(normalizeApiError(null)).toEqual({ message: 'An unexpected error occurred.' });
    expect(normalizeApiError(undefined, 'Fallback')).toEqual({ message: 'Fallback' });
  });

  it('handles strings', () => {
    expect(normalizeApiError('Something went wrong')).toEqual({ message: 'Something went wrong' });
    expect(normalizeApiError(' [object Object] ')).toEqual({ message: 'An unexpected error occurred.' });
  });

  it('handles Error instances', () => {
    const err = new Error('Database connection failed');
    expect(normalizeApiError(err)).toEqual({ message: 'Database connection failed' });
    
    const badErr = new Error('[object Object]');
    expect(normalizeApiError(badErr)).toEqual({ message: 'An unexpected error occurred.' });
  });

  it('handles objects with direct message fields', () => {
    expect(normalizeApiError({ message: 'Direct error', code: 'E1', status: 400 })).toEqual({
      message: 'Direct error',
      code: 'E1',
      status: 400
    });
    
    expect(normalizeApiError({ error: 'Auth failed' })).toEqual({
      message: 'Auth failed',
      code: undefined,
      status: undefined
    });
  });

  it('handles nested error envelopes', () => {
    expect(normalizeApiError({ error: { message: 'Nested error', code: 'E2', status: 500 } })).toEqual({
      message: 'Nested error',
      code: 'E2',
      status: 500
    });
  });

  it('prevents [object Object] from leaking', () => {
    expect(normalizeApiError({ message: '[object Object]' })).toEqual({ message: 'An unexpected error occurred.' });
    expect(normalizeApiError({})).toEqual({ message: 'An unexpected error occurred.' });
  });
});
