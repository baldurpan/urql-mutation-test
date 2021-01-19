import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'urql';
import { fromValue } from 'wonka';
import LoginPage from './LoginPage';

const mockClient: any = {
    executeMutation: jest.fn(() =>
        fromValue({
            data: {
                login: {
                    token: 'some secret token string',
                },
            },
        })
    ),
};

describe('Login test that fails', () => {
    it('submits login values to server', async () => {
        render(
            <Provider value={mockClient}>
                <LoginPage />
            </Provider>
        );

        await waitFor(() => {
            screen.getByLabelText('Username');
            screen.getByLabelText('Password');
        });

        // Nothing has happened yet
        expect(mockClient.executeMutation).not.toHaveBeenCalled();

        // Fill out the form
        fireEvent.change(screen.getByLabelText('Username'), {
            target: { value: 'test' },
        });
        fireEvent.change(screen.getByLabelText('Password'), {
            target: { value: 'test' },
        });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        //  has been called
        await waitFor(() => {
            expect(mockClient.executeMutation).toHaveBeenCalledTimes(1);
        });
    });
});
