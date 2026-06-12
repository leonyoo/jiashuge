/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f7f1e1',
        ink: '#3a342b',
        moss: '#7c9885',
        clay: '#c08566',
        sky1: '#cfe1ea',
        sun1: '#e7b75f'
      },
      fontFamily: {
        hand: ['"Ma Shan Zheng"', '"KaiTi"', '"STKaiti"', 'serif'],
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif']
      },
      boxShadow: {
        soft: '0 2px 10px rgba(58,52,43,0.08)'
      }
    }
  },
  plugins: []
};
