import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';

const theme = extendTheme({
    config: {
        initialColorMode: 'light',
        useSystemColorMode: false
    },
    fonts: {
        heading: "'Manrope', sans-serif",
        body: "'Inter', system-ui, sans-serif"
    },
    colors: {
        brand: {
            50: '#E6F9F7',
            100: '#B3EDE8',
            200: '#80E1D9',
            300: '#4DD5CA',
            400: '#4ECDC4', // Cyan from logo
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
            500: '#FF9F4A', // Orange from logo
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
            500: '#1E293B', // Dark navy from logo text
            600: '#182133',
            700: '#12192B',
            800: '#0C1123',
            900: '#06091B'
        }
    },
    styles: {
        global: (props: any) => ({
            body: {
                bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
                color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800'
            }
        })
    },
    components: {
        Heading: {
            baseStyle: (props: any) => ({
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                color: props.colorMode === 'dark' ? 'white' : 'gray.800'
            })
        },
        Text: {
            baseStyle: (props: any) => ({
                fontFamily: "'Inter', system-ui, sans-serif",
                color: props.colorMode === 'dark' ? 'gray.300' : 'gray.600'
            })
        },
        Button: {
            baseStyle: {
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 500
            }
        },
        Card: {
            baseStyle: (props: any) => ({
                container: {
                    bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
                    borderRadius: 'lg',
                    boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'md'
                }
            })
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
