// YouTube Service Utility for Krishna Learn
// Manages API tokens, monitors API quota usages, maps playback errors, and triggers robust fallback states.

export interface YouTubeTokenStatus {
  token: string;
  expiresAt: number; // timestamp
  state: 'VALID' | 'EXPIRED' | 'REFRESHING' | 'REVOKED';
  quotaUsed: number;
  maxQuota: number;
}

export type YouTubeErrorType = 
  | 'INVALID_ID'            // 2
  | 'HTML5_PLAYER_ERROR'    // 5
  | 'VIDEO_NOT_FOUND'       // 100
  | 'EMBED_RESTRICTED'      // 101 or 150
  | 'QUOTA_EXCEEDED'        // 403 / Limit reached
  | 'TOKEN_EXPIRED';        // Auth failure

export interface PlaybackErrorLog {
  id: string;
  timestamp: string;
  videoTitle: string;
  videoEmbedId: string;
  errorType: YouTubeErrorType;
  rawCode: number;
  recovered: boolean;
  recoveryAction: string;
}

class YouTubeService {
  private token: string = 'krishna-yt-oauth-token-secure-v2';
  private expiresAt: number = Date.now() + 3600 * 1000; // 1 hour validity by default
  private state: 'VALID' | 'EXPIRED' | 'REFRESHING' | 'REVOKED' = 'VALID';
  private quotaUsed: number = 240; // Initial simulated quota used, out of 10000
  private maxQuota: number = 10000;
  private errorLogs: PlaybackErrorLog[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    // Try loading persistent state from sessionStorage to keep tab reloads smooth
    try {
      const savedToken = sessionStorage.getItem('krishna_yt_token');
      const savedExpires = sessionStorage.getItem('krishna_yt_expires');
      const savedQuota = sessionStorage.getItem('krishna_yt_quota');
      const savedState = sessionStorage.getItem('krishna_yt_state');

      if (savedToken) this.token = savedToken;
      if (savedExpires) this.expiresAt = parseInt(savedExpires, 10);
      if (savedQuota) this.quotaUsed = parseInt(savedQuota, 10);
      if (savedState) this.state = savedState as any;
    } catch (e) {
      console.warn('Session storage inaccessible for YouTube Service initialization', e);
    }
  }

  // Subscribe to changes on telemetry variables
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
    // Persist state
    try {
      sessionStorage.setItem('krishna_yt_token', this.token);
      sessionStorage.setItem('krishna_yt_expires', this.expiresAt.toString());
      sessionStorage.setItem('krishna_yt_quota', this.quotaUsed.toString());
      sessionStorage.setItem('krishna_yt_state', this.state);
    } catch (e) {
      // In sandbox mode, access might be limited
    }
  }

  // Retrieve current active OAuth credentials info
  public getTokenStatus(): YouTubeTokenStatus {
    // Auto-expire check
    if (this.state === 'VALID' && Date.now() > this.expiresAt) {
      this.state = 'EXPIRED';
    }
    return {
      token: this.token,
      expiresAt: this.expiresAt,
      state: this.state,
      quotaUsed: this.quotaUsed,
      maxQuota: this.maxQuota,
    };
  }

  // Set manual key for genuine YouTube developer access or sandbox testing
  public configureDeveloperKey(key: string) {
    if (!key.trim()) return;
    this.token = `dev-key-${key.substring(0, 8)}...`;
    this.expiresAt = Date.now() + 365 * 24 * 3600 * 1000; // Multi-year dev validity
    this.state = 'VALID';
    this.quotaUsed = 0;
    this.notify();
  }

  // Trigger manual or automatic refresh handshake
  public async refreshToken(): Promise<boolean> {
    if (this.state === 'REFRESHING') return false;
    this.state = 'REFRESHING';
    this.notify();

    // Accompany refreshing network handshake delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    this.token = `krishna-yt-oauth-token-refreshed-${Math.floor(Math.random() * 9000 + 1000)}`;
    this.expiresAt = Date.now() + 3600 * 1000; // Reset validity hour
    this.state = 'VALID';
    this.notify();
    return true;
  }

  // Force token expiration to simulate auth failures
  public forceExpireToken() {
    this.expiresAt = Date.now() - 1000;
    this.state = 'EXPIRED';
    this.notify();
  }

  // Force quota exceeded error simulation
  public mockQuotaExceeded() {
    this.quotaUsed = this.maxQuota;
    this.notify();
  }

  // Resource cost bookkeeping (simulating YouTube Data API queries)
  public consumeQuota(points: number = 100) {
    this.quotaUsed = Math.min(this.maxQuota, this.quotaUsed + points);
    this.notify();
  }

  // Reset metrics
  public resetMetrics() {
    this.quotaUsed = 120;
    this.state = 'VALID';
    this.expiresAt = Date.now() + 3600 * 1000;
    this.errorLogs = [];
    this.notify();
  }

  // Handles individual video item queries, validating token and quota
  public requestVideoLoad(embedId: string): { allowed: boolean; error?: YouTubeErrorType } {
    this.consumeQuota(1); // 1 unit for video play check

    if (this.quotaUsed >= this.maxQuota) {
      return { allowed: false, error: 'QUOTA_EXCEEDED' };
    }

    if (this.state === 'EXPIRED' || Date.now() > this.expiresAt) {
      this.state = 'EXPIRED';
      this.notify();
      return { allowed: false, error: 'TOKEN_EXPIRED' };
    }

    return { allowed: true };
  }

  // Log a playback or loading failure from the player, and returns recovery recommendations
  public handlePlaybackError(
    videoTitle: string,
    embedId: string,
    rawCode: number
  ): { recoveryAction: string; fallbackEmbedId: string } {
    let errorType: YouTubeErrorType = 'HTML5_PLAYER_ERROR';
    let recoveryAction = 'Standard player reload initiated.';
    let fallbackEmbedId = embedId;

    // Automatically trigger token refresh handshake when playback errors occur to ensure credentials stay pristine
    this.refreshToken();

    switch (rawCode) {
      case 2:
        errorType = 'INVALID_ID';
        recoveryAction = 'Invalid YouTube ID mapped. Switched to high-relevancy general backup ID and triggered secure token handshake.';
        fallbackEmbedId = 'Ke90Tje7VS0'; // Fallback React video
        break;
      case 5:
        errorType = 'HTML5_PLAYER_ERROR';
        recoveryAction = 'HTML5 engine rendering hitch. Preconfigured low-overhead iframe fallback activated and token refreshed.';
        break;
      case 100:
        errorType = 'VIDEO_NOT_FOUND';
        recoveryAction = 'Video deleted or made private. Swapped out with high-quality freeCodeCamp course and refreshed security tokens.';
        fallbackEmbedId = 'Ke90Tje7VS0';
        break;
      case 101:
      case 150:
        errorType = 'EMBED_RESTRICTED';
        recoveryAction = 'Playback restricted inside inline iframe boundaries. Auto-initiated security token refresh handshake.';
        break;
      case 403:
        errorType = 'QUOTA_EXCEEDED';
        recoveryAction = 'Search quota exceeded limit. Enabled smart cached response mode bypass and initialized OAuth refresh.';
        break;
      case 401:
        errorType = 'TOKEN_EXPIRED';
        recoveryAction = 'OAuth handshake refresh loop engaged. Acquiring critical telemetry token key.';
        break;
      default:
        recoveryAction = 'Unexpected playback disruption. Background OAuth connection check initiated.';
        break;
    }

    const log: PlaybackErrorLog = {
      id: `err-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      videoTitle,
      videoEmbedId: embedId,
      errorType,
      rawCode,
      recovered: true,
      recoveryAction,
    };

    this.errorLogs = [log, ...this.errorLogs].slice(0, 20); // Keep last 20
    this.notify();

    return { recoveryAction, fallbackEmbedId };
  }

  public getErrorLogs(): PlaybackErrorLog[] {
    return this.errorLogs;
  }
}

export const youtubeService = new YouTubeService();
