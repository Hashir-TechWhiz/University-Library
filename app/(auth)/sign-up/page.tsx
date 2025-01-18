'use client';

import { signUp } from '@/lib/actions/auth';
import AuthForm from '@/components/AuthForm';
import { signUpSchema } from '@/lib/validations';

const page = () => (
    <AuthForm
        type="SIGN_UP"
        schema={signUpSchema}
        defaultValues={{
            email: '',
            password: '',
            fullName: '',
            universityId: 0,
            universityCard: ''
        }}
        onSubmit={signUp}
    />
);

export default page;
