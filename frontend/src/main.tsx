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
            50: '#FDF0EC',
            100: '#F9D4C9',
            200: '#F4B8A6',
            300: '#EF9C83',
            400: '#EA7F60',
            500: '#D65A31',
            600: '#C24A21',
            700: '#9A3B1A',
            800: '#722C13',
            900: '#4A1D0C'
        },
        accent: {
            50: '#FDF0EC',
            100: '#F9D4C9',
            200: '#F4B8A6',
            300: '#EF9C83',
            400: '#EA7F60',
            500: '#D65A31',
            600: '#C24A21',
            700: '#9A3B1A',
            800: '#722C13',
            900: '#4A1D0C'
        },
        navy: {
            50: '#F5F5F5',
            100: '#EEEEEE',
            200: '#D1D1D1',
            300: '#B4B4B4',
            400: '#7A7D82',
            500: '#393E46',
            600: '#2F333A',
            700: '#25282E',
            800: '#222831',
            900: '#1A1D23'
        },
        cyber: {
            bg: '#222831',
            surface: '#393E46',
            border: '#4A4F57',
            text: '#EEEEEE',
            muted: '#7A7D82'
        }
    },
    styles: {
        global: {
            body: {
                bg: '#222831',
                color: '#EEEEEE',
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(214, 90, 49, 0.05) 0%, transparent 50%)',
                backgroundAttachment: 'fixed'
            },
            '*::selection': {
                bg: 'brand.500',
                color: 'navy.100'
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
                    bg: 'brand.500',
                    color: 'navy.100',
                    _hover: {
                        bg: 'brand.400',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 0 20px rgba(214, 90, 49, 0.4)'
                    }
                },
                outline: {
                    borderColor: 'brand.500',
                    color: 'brand.500',
                    _hover: {
                        bg: 'rgba(214, 90, 49, 0.1)',
                        transform: 'translateY(-2px)'
                    }
                },
                ghost: {
                    color: 'navy.200',
                    _hover: {
                        bg: 'rgba(214, 90, 49, 0.1)',
                        color: 'brand.500'
                    }
                }
            }
        },
        Card: {
            baseStyle: {
                container: {
                    bg: '#393E46',
                    borderRadius: 'xl',
                    border: '1px solid',
                    borderColor: '#4A4F57',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.2s',
                    _hover: {
                        borderColor: 'brand.500',
                        boxShadow: '0 0 20px rgba(214, 90, 49, 0.2)'
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
