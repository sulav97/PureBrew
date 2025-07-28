const dns = require('dns').promises;
const { URL } = require('url');

// List of allowed hostnames (add your trusted domains here)
const ALLOWED_HOSTS = ['example.com', 'api.trusted.com'];

async function isInternalIp(hostname) {
  const addresses = await dns.lookup(hostname, { all: true });
  return addresses.some(addr => {
    return (
      addr.address.startsWith('10.') ||
      addr.address.startsWith('127.') ||
      addr.address.startsWith('192.168.') ||
      addr.address.startsWith('169.254.') ||
      addr.address === '::1'
    );
  });
}

module.exports = async function ssrfProtection(req, res, next) {
  try {
    const { urlToFetch } = req.body; // or req.query, depending on your API
    if (!urlToFetch) return res.status(400).json({ error: 'No URL provided' });

    const parsedUrl = new URL(urlToFetch);

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Invalid protocol' });
    }

    // Whitelist check
    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
      return res.status(400).json({ error: 'Host not allowed' });
    }

    // Block internal IPs
    if (await isInternalIp(parsedUrl.hostname)) {
      return res.status(400).json({ error: 'Internal IPs are not allowed' });
    }

    next();
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
}; 