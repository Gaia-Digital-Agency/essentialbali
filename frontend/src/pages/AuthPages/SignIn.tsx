import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
// import "../../index.css"

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | essentialbali"
        description="Sign in to essentialbali admin."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
