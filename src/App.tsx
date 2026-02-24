import logo from '/wu-logo.png'
import { Box, Flex } from '@chakra-ui/react'

function App() {
  return (
    <Flex direction="column">
      <Box>
          <img src={logo} alt="Logo" width={256} />
      </Box>
      <Box>
        <h1>Welcome</h1>
      </Box>
    </Flex>
  )
}

export default App
