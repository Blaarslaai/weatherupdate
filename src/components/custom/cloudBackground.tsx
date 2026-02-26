import { Box } from '@chakra-ui/react';

function CloudBackground() {
  return (
    <Box
      aria-hidden="true"
      position="absolute"
      inset={0}
      pointerEvents="none"
      overflow="hidden"
      className="clouds-bg"
    >
      <svg
        viewBox="0 0 800 320"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%' }}
      >
        <g className="cloud-layer cloud-layer--slow" opacity="0.4">
          <path d="M70 120c0-22 18-40 40-40 5 0 10 1 14 3 8-14 23-23 40-23 24 0 44 17 49 39 4-1 8-2 12-2 22 0 40 18 40 40s-18 40-40 40H110c-22 0-40-18-40-40s18-37 40-37z" fill="#dbeafe" />
          <path d="M520 90c0-20 16-36 36-36 5 0 9 1 13 2 7-12 20-20 35-20 22 0 40 15 45 35 4-1 7-1 11-1 20 0 36 16 36 36s-16 36-36 36H556c-20 0-36-16-36-36s16-33 36-33z" fill="#bfdbfe" />
        </g>
        <g className="cloud-layer cloud-layer--mid" opacity="0.55">
          <path d="M-40 200c0-18 14-32 32-32 4 0 8 1 12 2 6-11 18-18 31-18 19 0 35 13 39 31 3-1 6-1 9-1 18 0 32 14 32 32s-14 32-32 32H-8c-18 0-32-14-32-32s14-29 32-29z" fill="#eff6ff" />
          <path d="M300 215c0-24 19-43 43-43 6 0 11 1 16 3 8-15 24-25 42-25 26 0 47 18 53 43 4-1 8-2 13-2 24 0 43 19 43 43s-19 43-43 43H343c-24 0-43-19-43-43s19-39 43-39z" fill="#e0f2fe" />
          <path d="M650 185c0-16 13-29 29-29 4 0 7 1 10 2 6-9 16-15 27-15 17 0 31 12 34 28 3-1 5-1 8-1 16 0 29 13 29 29s-13 29-29 29H679c-16 0-29-13-29-29s13-26 29-26z" fill="#dbeafe" />
        </g>
        <g className="cloud-layer cloud-layer--fast" opacity="0.35">
          <path d="M130 270c0-14 12-26 26-26 4 0 7 1 10 2 5-8 14-13 24-13 15 0 28 11 31 25 2-1 4-1 6-1 14 0 26 12 26 26s-12 26-26 26h-71c-14 0-26-12-26-26s12-23 26-23z" fill="#ffffff" />
          <path d="M560 255c0-14 12-25 25-25 3 0 6 0 9 1 5-8 14-13 24-13 15 0 27 10 30 24 2 0 4-1 6-1 14 0 25 11 25 25s-11 25-25 25h-69c-14 0-25-11-25-25s11-22 25-22z" fill="#ffffff" />
        </g>
      </svg>
    </Box>
  )
}

export default CloudBackground;
