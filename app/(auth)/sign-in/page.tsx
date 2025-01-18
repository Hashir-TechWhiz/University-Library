
'use client';

import AuthForm from '@/components/AuthForm';
import { signInSchema } from '@/lib/validations';
import { SignInWithCredentials } from '@/lib/actions/auth';

const page = () => (
    <AuthForm
        type="SIGN_IN"
        schema={signInSchema}
        defaultValues={{
            email: '',
            password: ''
        }}
        onSubmit={SignInWithCredentials}
    />
);

export default page;
