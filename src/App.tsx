import React from 'react';
import { Provider, createClient } from 'urql';
import LoginPage from './LoginPage';

const client = createClient({
    url: 'http://localhost:3000/graphql',
});

export default function App() {
    return (
        <Provider value={client}>
            <LoginPage />
        </Provider>
    );
}
