import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';

const theme = extendTheme({
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false
    },
    fonts: {
        heading: "'JetBrains Mono', 'Fira Code', monospace",
        body: "'Inter', system-ui, sans-serif"
    },
    colors: {
        brand: {
            50: '#E6F9F7',
            100: '#B3EDE8',
            200: '#80E1D9',
            300: '#4DD5CA',
            400: '#4ECDC4',
            500: '#3DB5AD',
            600: '#2C9D96',
            700: '#1B857F',
            800: '#0A6D68',
            900: '#005551'
        },
        accent: {
            50: '#FFF4E6',
            100: '#FFE0B3',
            200: '#FFCC80',
            300: '#FFB84D',
            400: '#FFA41A',
            500: '#FF9F4A',
            600: '#E68A35',
            700: '#CC7520',
            800: '#B3600B',
            900: '#994B00'
        },
        navy: {
            50: '#E8EAED',
            100: '#C5CAD1',
            200: '#A2AAB5',
            300: '#7F8A99',
            400: '#5C6A7D',
            500: '#1E293B',
            600: '#182133',
            700: '#12192B',
            800: '#0C1123',
            900: '#06091B'
        },
        cyber: {
            bg: '#0a0e27',
            surface: '#151b3d',
            border: '#1e2749',
            text: '#e2e8f0',
            muted: '#64748b'
        }
    },
    styles: {
        global: {
            body: {
                bg: '#0a0e27',
                color: '#e2e8f0',
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(78, 205, 196, 0.03) 0%, transparent 50%)',
                backgroundAttachment: 'fixed'
            },
            '*::selection': {
                bg: 'brand.400',
                color: 'navy.900'
            }
        }
    },
    components: {
        Heading: {
            baseStyle: {
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontWeight: 700,
                color: 'white',
                letterSpacing: '-0.02em'
            }
        },
        Text: {
            baseStyle: {
                color: '#cbd5e1'
            }
        },
        Button: {
            baseStyle: {
                fontWeight: 600,
                borderRadius: 'md',
                transition: 'all 0.2s'
            },
            variants: {
                solid: {
                    bg: 'brand.400',
                    color: 'navy.900',
                    _hover: {
                        bg: 'brand.300',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 0 20px rgba(78, 205, 196, 0.4)'
                    }
                },
                outline: {
                    borderColor: 'brand.400',
                    color: 'brand.400',
                    _hover: {
                        bg: 'rgba(78, 205, 196, 0.1)',
                        transform: 'translateY(-2px)'
                    }
                },
                ghost: {
                    color: 'gray.400',
                    _hover: {
                        bg: 'rgba(78, 205, 196, 0.1)',
                        color: 'brand.400'
                    }
                }
            }
        },
        Card: {
            baseStyle: {
                container: {
                    bg: '#151b3d',
                    borderRadius: 'xl',
                    border: '1px solid',
                    borderColor: '#1e2749',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.2s',
                    _hover: {
                        borderColor: 'brand.400',
                        boxShadow: '0 0 20px rgba(78, 205, 196, 0.2)'
                    }
                }
            }
        },
        Badge: {
            baseStyle: {
                fontWeight: 600,
                fontSize: 'xs',
                px: 2,
                py: 1,
                borderRadius: 'md'
            }
        }
    }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <App />
        </ChakraProvider>
    </React.StrictMode>
);
