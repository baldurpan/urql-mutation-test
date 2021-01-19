import React, { useCallback, useReducer } from 'react';
import { gql, useMutation } from 'urql';

const MUTATION = gql`
    mutation LoginMutation($data: LoginInput) {
        login(data: $data) {
            token
        }
    }
`;

interface FormState {
    values: {
        username: string;
        password: string;
    };
    isSubmitting: boolean;
    submitSucceeded: boolean;
    error: string | null;
}

type FormAction =
    | { type: 'SUBMIT' }
    | { type: 'INPUT_CHANGE'; payload: { field: string; value: string } }
    | { type: 'SUBMIT_SUCCESS'; payload: { token: string } }
    | { type: 'SUBMIT_FAILED'; payload: { error: string } };

const getInitialReducerState = (): FormState => ({
    values: { username: '', password: '' },
    isSubmitting: false,
    submitSucceeded: false,
    error: null,
});

const LoginForm = () => {
    const [, mutation] = useMutation(MUTATION);
    const [formState, dispatch] = useReducer(
        (state: FormState, action: FormAction): FormState => {
            switch (action.type) {
                case 'INPUT_CHANGE': {
                    return {
                        ...state,
                        values: {
                            ...state.values,
                            [action.payload.field]: action.payload.value,
                        },
                    };
                }
                case 'SUBMIT': {
                    return {
                        ...state,
                        isSubmitting: true,
                        error: null,
                    };
                }
                case 'SUBMIT_SUCCESS': {
                    return {
                        ...state,
                        isSubmitting: false,
                        submitSucceeded: true,
                    };
                }
                case 'SUBMIT_FAILED': {
                    return {
                        ...state,
                        isSubmitting: false,
                        submitSucceeded: false,
                        error: action.payload.error,
                    };
                }
                default: {
                    return state;
                }
            }
        },
        getInitialReducerState()
    );

    const handleSubmit = useCallback(
        async (evt: React.FormEvent<HTMLFormElement>) => {
            evt.preventDefault();
            dispatch({ type: 'SUBMIT' });

            const result = await mutation(formState.values);
            if (result.error) {
                dispatch({
                    type: 'SUBMIT_FAILED',
                    payload: { error: result.error.message },
                });
            } else {
                dispatch({
                    type: 'SUBMIT_SUCCESS',
                    payload: { token: result.data.token },
                });
            }
        },
        [mutation, formState.values]
    );

    const handleChange = useCallback(
        (evt: React.ChangeEvent<HTMLInputElement>) => {
            dispatch({
                type: 'INPUT_CHANGE',
                payload: {
                    field: evt.target.name,
                    value: evt.target.value,
                },
            });
        },
        [dispatch]
    );

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        value={formState.values.username}
                        onChange={handleChange}
                        placeholder="username"
                        id="username"
                        name="username"
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        value={formState.values.password}
                        onChange={handleChange}
                        placeholder="password"
                        id="password"
                        name="password"
                    />
                </div>
                <div>
                    <button type="submit">Login</button>
                </div>
            </form>
            {formState.error && <p>{formState.error}</p>}
        </div>
    );
};

export default LoginForm;
