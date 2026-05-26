/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cho phép next/image load từ Cloudinary (host CDN ảnh chính của LAVIPCO)
    // và các nguồn placeholder thường dùng khi dev.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
