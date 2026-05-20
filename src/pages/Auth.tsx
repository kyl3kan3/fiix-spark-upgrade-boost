
import React from "react";
import { Helmet } from "react-helmet";
import { AuthContainer } from "@/components/auth/AuthContainer";

const Auth: React.FC = () => {
 return (
 <>
 <Helmet>
 <title>Sign in or create your account | MaintenEase</title>
 <meta name="description" content="Sign in to MaintenEase or create a new account to manage your assets, work orders, inspections, and maintenance team in one place." />
 <link rel="canonical" href="https://maintenease.com/auth" />
 <meta property="og:title" content="Sign in to MaintenEase" />
 <meta property="og:description" content="Sign in or create a MaintenEase account to manage your maintenance operations." />
 <meta property="og:url" content="https://maintenease.com/auth" />
 <meta property="og:type" content="website" />
 </Helmet>
 <AuthContainer />
 </>
 );
};

export default Auth;
