import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function RegistrationStatus() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.userData;

    useEffect(() => {
        if (!user?.email) {
            navigate('/login'); // redirect if accessed directly
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background text-center px-6">
            <div className="max-w-md p-6 rounded-xl shadow-md border border-gray-200 bg-white">
                <h1 className="text-2xl font-semibold text-gray-800 mb-3">
                    Registration Submitted
                </h1>
                <p className="text-gray-600 mb-4">
                    Hi <span className="font-medium">{user?.name}</span>, your account request has been
                    submitted successfully.
                </p>
                <p className="text-gray-600">
                    Our team will review your application and notify you at{' '}
                    <span className="font-medium">{user?.email}</span> once approved.
                </p>

                <div className="mt-6">
                    <p className="text-sm text-muted-foreground">
                        You can close this window or return later after approval.
                    </p>
                </div>
            </div>
        </div>
    );
}
