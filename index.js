// index.js
class IPMonster {
  static config = {
    apiKey: null,
    baseUrl: 'https://api.bestipapi.com/query',
    timeout: 5000
  };
  static configure(options) {
    this.config = { ...this.config, ...options };
  }
  static validate(ip) {
    if (!ip || typeof ip !== 'string') return false;
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }
  static async lookup(ip, options = {}) {
    if (!this.validate(ip)) {
      throw new Error('Invalid IP address format');
    }
    const apiKey = options.apiKey || this.config.apiKey || process.env.IPMONSTER_API_KEY;
    if (!apiKey) {
      throw new Error('API key not configured. Use IPMonster.configure({ apiKey: "your-key" }) or set IPMONSTER_API_KEY environment variable');
    }
    const baseUrl = options.baseUrl || this.config.baseUrl;
    const timeout = options.timeout || this.config.timeout;
    const output = options.output || 'json';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const url = new URL(`${baseUrl}/single`);
      url.searchParams.set('ip', ip);
      if (output !== 'json') {
        url.searchParams.set('output', output);
      }
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'ip-monster-npm/1.0.0'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(`IP Monster API error: ${errorMessage}`);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }
  static async batchLookup(ips, options = {}) {
    if (!Array.isArray(ips)) {
      throw new Error('IPs must be an array');
    }

    if (ips.length === 0) {
      throw new Error('At least one IP address is required');
    }

    if (ips.length > 300) {
      throw new Error('Maximum of 300 IP addresses per request');
    }
    const validIPs = ips.filter(ip => this.validate(ip));
    if (validIPs.length === 0) {
      throw new Error(`No valid IP Addresses to process`);
    }
    const apiKey = options.apiKey || this.config.apiKey || process.env.IPMONSTER_API_KEY;
    if (!apiKey) {
      throw new Error('API key not configured');
    }
    const baseUrl = options.baseUrl || this.config.baseUrl;
    const timeout = options.timeout || this.config.timeout;
    const output = options.output || 'json';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const url = new URL(`${baseUrl}/multiple`);
      url.searchParams.set('ip', validIPs.join(','));
      if (output !== 'json') {
        url.searchParams.set('output', output);
      }
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'ip-monster-npm/1.0.0'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(`IP Monster API error: ${errorMessage}`);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }
}
module.exports = IPMonster;