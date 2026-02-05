import AuthLayout from "@/app/(auth)/layout";
import OnboardingWizard from "@/features/onboarding/components/OnboardingWizard";

export default function OnboardingPage() {
    return (
        <AuthLayout>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Welcome to Rupya</h1>
                <p className="text-slate-400">Let's personalize your trading terminal</p>
            </div>
            <OnboardingWizard />
        </AuthLayout>
    );
}
