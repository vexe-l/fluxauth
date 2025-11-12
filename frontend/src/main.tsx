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
            50: '#F5F5F5',
            100: '#E0E0E0',
            200: '#BDBDBD',
            300: '#9E9E9E',
            400: '#757575',
            500: '#616161',
            600: '#424242',
            700: '#303030',
            800: '#212121',
            900: '#0A0A0A'
        },
        accent: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121'
        },
        navy: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121'
        },
        cyber: {
            bg: '#0A0A0A',
            surface: '#1A1A1A',
            border: '#2A2A2A',
            text: '#FFFFFF',
            muted: '#757575'
        }
    },
    styles: {
        global: {
            body: {
                bg: '#0A0A0A',
                color: '#FFFFFF',
                backgroundAttachment: 'fixed'
            },
            '*::selection': {
                bg: 'brand.400',
                color: 'white'
            }
        }
    },
    components: {
        Heading: {
            baseStyle: {
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontWeight: 700,
                color: 'white !important',
                letterSpacing: '-0.02em'
            }
        },
        Text: {
            baseStyle: {
                color: 'white'
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
                    bg: 'brand.600',
                    color: 'white',
                    _hover: {
                        bg: 'brand.500',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 0 20px rgba(97, 97, 97, 0.3)'
                    }
                },
                outline: {
                    borderColor: 'brand.400',
                    color: 'brand.300',
                    _hover: {
                        bg: 'rgba(158, 158, 158, 0.1)',
                        transform: 'translateY(-2px)'
                    }
                },
                ghost: {
                    color: 'brand.200',
                    _hover: {
                        bg: 'rgba(158, 158, 158, 0.1)',
                        color: 'brand.100'
                    }
                }
            }
        },
        Card: {
            baseStyle: {
                container: {
                    bg: '#1A1A1A',
                    borderRadius: 'xl',
                    border: '1px solid',
                    borderColor: '#2A2A2A',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
                    transition: 'all 0.2s',
                    _hover: {
                        borderColor: 'brand.500',
                        boxShadow: '0 0 20px rgba(97, 97, 97, 0.2)'
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
