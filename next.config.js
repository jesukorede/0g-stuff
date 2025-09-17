/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@web3modal/wagmi']
  },
  swcMinify: true,
  compiler: {
    removeConsole: false
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        readline: false,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false
      }
      // Stub out optional server-only deps pulled by transitive packages
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'pino-pretty': false
      }
    }
    return config
  }
}

module.exports = nextConfig
