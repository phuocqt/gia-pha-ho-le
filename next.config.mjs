/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/*/**",
      },
      {
        protocol: "https",
        hostname: "https://www.svgrepo.com",
        port: "",
        pathname: "/*/**",
      },
    ],
  },
};

export default nextConfig;
