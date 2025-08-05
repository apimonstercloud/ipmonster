# IP Monster

Simple, lightweight client for the IP Monster enrichment service. Get comprehensive geolocation, ISP, timezone, and network data for any IP address with just one line of code.

## Installation

```bash
npm install ip-monster
```

## Getting Started

1. **Get your API key**: Create a free account at [bestipapi.com/register](https://bestipapi.com/register) to get your API key
2. **Install the package**: `npm install ip-monster`
3. **Start using**: Configure your API key and make calls

## Quick Start

```javascript
const IPMonster = require('ip-monster');

// Configure your API key (do this once)
IPMonster.configure({ apiKey: 'your-api-key-here' });

// Validate IP addresses
console.log(IPMonster.validate('192.168.1.1')); // true
console.log(IPMonster.validate('invalid-ip')); // false

// Look up IP enrichment data
const data = await IPMonster.lookup('8.8.8.8');
console.log(data);
```

## Configuration

### Method 1: Configure programmatically
```javascript
IPMonster.configure({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.bestipapi.com/query', // optional
  timeout: 5000 // optional, in milliseconds
});
```

### Method 2: Environment variable
```bash
export IPMONSTER_API_KEY=your-api-key
```

## API Reference

### `IPMonster.validate(ip)`

Validates IP address format (both IPv4 and IPv6).

```javascript
IPMonster.validate('192.168.1.1');    // true
IPMonster.validate('2001:db8::1');    // true
IPMonster.validate('invalid');        // false
```

**Parameters:**
- `ip` (string): IP address to validate

**Returns:** `boolean`

### `IPMonster.lookup(ip, [options])`

Look up enrichment data for a single IP address.

```javascript
const result = await IPMonster.lookup('8.8.8.8');

// Example response:
{
  "ip_address": "8.8.8.8",
  "ip_type": "IPv4",
  "network": "8.8.8.0/24",
  "latitude": 37.751,
  "longitude": -97.822,
  "postal_code": null,
  "accuracy_radius": 1000,
  "city_name": null,
  "country_name": "United States",
  "country_iso_code": "US",
  "subdivision_1_name": null,
  "subdivision_1_iso_code": null,
  "subdivision_2_name": null,
  "continent_name": "North America",
  "continent_code": "NA",
  "time_zone": "America/Chicago",
  "time_zone_offset": -5,
  "is_in_european_union": false,
  "currency_code": "USD",
  "currency_name": "US Dollar",
  "primary_language_code": "EN",
  "primary_language_name": "English",
  "isp": "Google LLC",
  "isp_name": "Google LLC",
  "asn": 15169,
  "aso": "GOOGLE",
  "mobile_country_code": null,
  "mobile_network_code": null,
  "tor_detected": false
}
```

**Parameters:**
- `ip` (string): IP address to lookup
- `options` (object, optional): Request options
  - `apiKey` (string): API key override
  - `baseUrl` (string): API base URL override
  - `timeout` (number): Request timeout in milliseconds
  - `output` (string): Response format ('json', 'xml', 'plain')

**Returns:** `Promise<Object>` - Enrichment data

### `IPMonster.batchLookup(ips, [options])`

Look up multiple IP addresses in a single request (maximum 300 IPs).

```javascript
const results = await IPMonster.batchLookup([
  '8.8.8.8',
  '1.1.1.1',
  '192.168.1.1'
]);

// Example response:
{
  "results": [
    {
      "ip_address": "8.8.8.8",
      "ip_type": "IPv4",
      "country_name": "United States",
      "city_name": null,
      // ... full enrichment data
    },
    {
      "ip_address": "192.168.1.1",
      "error": "No location data found for this IP address",
      "error_code": "NOT_FOUND"
    }
  ],
  "summary": {
    "total_processed": 3,
    "successful": 2,
    "errors": 1,
    "skipped": 0
  }
}
```

**Parameters:**
- `ips` (string[]): Array of IP addresses (max 300)
- `options` (object, optional): Same as lookup options plus:
  - `output` (string): Response format ('json', 'xml', 'text', 'plain')

**Returns:** `Promise<Object>` - Object with results array and summary

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `ip_address` | string | The queried IP address |
| `ip_type` | string | IP version (IPv4 or IPv6) |
| `network` | string | Network range in CIDR notation |
| `latitude` | number | Geographic latitude coordinate |
| `longitude` | number | Geographic longitude coordinate |
| `postal_code` | string\|null | Postal/ZIP code |
| `accuracy_radius` | number | Accuracy radius in kilometers |
| `city_name` | string\|null | City name |
| `country_name` | string | Country name |
| `country_iso_code` | string | ISO 3166-1 alpha-2 country code |
| `subdivision_1_name` | string\|null | State/province/region name |
| `subdivision_1_iso_code` | string\|null | State/province/region ISO code |
| `subdivision_2_name` | string\|null | Secondary subdivision name |
| `continent_name` | string | Continent name |
| `continent_code` | string | Two-letter continent code |
| `time_zone` | string | IANA timezone identifier |
| `time_zone_offset` | number | UTC timezone offset in hours |
| `is_in_european_union` | boolean | Whether IP is in European Union |
| `currency_code` | string | ISO 4217 currency code |
| `currency_name` | string | Currency name |
| `primary_language_code` | string | ISO 639-1 language code |
| `primary_language_name` | string | Primary language name |
| `isp` | string | Internet Service Provider name |
| `asn` | number | Autonomous System Number |
| `aso` | string | Autonomous System Organization |
| `mobile_country_code` | string\|null | Mobile Country Code (for cellular networks) |
| `mobile_network_code` | string\|null | Mobile Network Code (for cellular networks) |
| `tor_detected` | boolean | Whether the IP is associated with Tor network |

## Error Handling

The package throws descriptive errors for various scenarios:

```javascript
try {
  const result = await IPMonster.lookup('8.8.8.8');
} catch (error) {
  console.error(error.message);
  // Possible errors:
  // - "Invalid IP address format"
  // - "API key not configured"
  // - "Request timeout after 5000ms"
  // - "IP Monster API error: Invalid API key"
  // - "IP Monster API error: Rate limit exceeded"
}
```

## Requirements

- Node.js 18+ (for built-in fetch support)
- IP Monster API key

## Examples

### Basic Usage
```javascript
const IPMonster = require('ip-monster');

IPMonster.configure({ apiKey: process.env.IPMONSTER_API_KEY });

async function checkIP(ip) {
  if (!IPMonster.validate(ip)) {
    console.log('Invalid IP address');
    return;
  }
  
  try {
    const data = await IPMonster.lookup(ip);
    console.log(`${ip} is from ${data.city_name || 'Unknown City'}, ${data.country_name}`);
    console.log(`ISP: ${data.isp}, Timezone: ${data.time_zone}`);
  } catch (error) {
    console.error('Lookup failed:', error.message);
  }
}

checkIP('8.8.8.8');
```

### Batch Processing
```javascript
async function analyzeIPs(ipList) {
  const validIPs = ipList.filter(ip => IPMonster.validate(ip));
  
  if (validIPs.length === 0) {
    console.log('No valid IPs found');
    return;
  }
  
  try {
    const response = await IPMonster.batchLookup(validIPs);
    
    console.log(`Processed ${response.summary.total_processed} IPs`);
    console.log(`Successful: ${response.summary.successful}, Errors: ${response.summary.errors}`);
    
    response.results.forEach(result => {
      if (result.error) {
        console.log(`${result.ip_address}: Error - ${result.error}`);
      } else {
        console.log(`${result.ip_address}: ${result.country_name} (${result.isp})`);
      }
    });
  } catch (error) {
    console.error('Batch lookup failed:', error.message);
  }
}

analyzeIPs(['8.8.8.8', '1.1.1.1', '192.168.1.1']);
```

### Custom Output Format
```javascript
// Get XML response
const xmlResult = await IPMonster.lookup('8.8.8.8', { output: 'xml' });

// Get plain text response  
const plainResult = await IPMonster.lookup('8.8.8.8', { output: 'plain' });
```

### Custom Configuration
```javascript
// Use custom timeout and base URL
const result = await IPMonster.lookup('8.8.8.8', {
  timeout: 10000,
  baseUrl: 'https://custom-api.bestipapi.com/query'
});
```

### Processing Large Datasets
```javascript
async function processLargeIPList(allIPs) {
  const batchSize = 300; // API maximum
  const results = [];
  
  for (let i = 0; i < allIPs.length; i += batchSize) {
    const batch = allIPs.slice(i, i + batchSize);
    const validBatch = batch.filter(ip => IPMonster.validate(ip));
    
    if (validBatch.length > 0) {
      try {
        const response = await IPMonster.batchLookup(validBatch);
        results.push(...response.results);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Batch ${i / batchSize + 1} failed:`, error.message);
      }
    }
  }
  
  return results;
}
```

## License

MIT