/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Extend Ant Design colors
        'ant-primary': '#1677ff',
        'ant-success': '#52c41a',
        'ant-warning': '#faad14',
        'ant-error': '#ff4d4f',
      },
      spacing: {
        // Add more spacing options that work well with Ant Design
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
  // Prefix all Tailwind classes to avoid conflicts with Ant Design
  // prefix: 'tw-',
  
  // Disable preflight to prevent conflicts with Ant Design's CSS reset
  corePlugins: {
    preflight: false,
  },
  
  // Important to override Ant Design styles when needed
  important: true,
}