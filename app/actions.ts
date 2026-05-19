"use server";

import { clearAuthSessionCookies, setAuthSessionCookie } from "@/utils/auth/session-cookie";
import { encodedRedirect } from "@/utils/utils";
import { getLocalePath, normalizeLocale } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { getAppKey } from "@/utils/supabase/project";
import { headers } from "next/headers";
import { getRequestOrigin } from "@/utils/request";
import { redirect } from "next/navigation";
import { isCloudflareDataBackend } from "@/utils/backend/runtime";
import { createCredentialsUser, getAuthUserByEmail, updateUserPassword, verifyCredentialsPassword } from "@/utils/d1/auth-users";
import { provisionCustomerIfMissing } from "@/utils/d1/customers";
import { createPasswordResetToken, getValidPasswordResetToken, markPasswordResetTokenUsed } from "@/utils/d1/password-reset";
import { sendPasswordResetEmail } from "@/utils/email/resend";

function resolveActionLocale(formData?: FormData) {
  const localeFromForm = formData?.get("locale")?.toString();
  if (localeFromForm === "en" || localeFromForm === "zh") {
    return localeFromForm;
  }

  return "en";
}

function resolveSafeNextPath(formData: FormData | undefined, locale: string, fallbackPath: string) {
  const rawNext = formData?.get("next")?.toString();
  if (!rawNext) {
    return getLocalePath(fallbackPath, locale);
  }

  if (/^https?:\/\//i.test(rawNext)) {
    return getLocalePath(fallbackPath, locale);
  }

  if (!/^\/(en|zh)(\/|$)/.test(rawNext)) {
    return getLocalePath(fallbackPath, locale);
  }

  return rawNext;
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const locale = resolveActionLocale(formData);

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
      locale
    );
  }

  if (password.length < 8) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Password must be at least 8 characters.",
      locale
    );
  }

  if (isCloudflareDataBackend()) {
    try {
      const existingUser = await getAuthUserByEmail(email);
      if (existingUser) {
        return encodedRedirect("error", "/sign-up", "An account with this email already exists.", locale);
      }

      const user = await createCredentialsUser({
        email,
        password,
      });

      if (!user) {
        throw new Error("Created user could not be loaded.");
      }

      await provisionCustomerIfMissing({
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      const origin = await getRequestOrigin();
      await setAuthSessionCookie({
        userId: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        secure: origin.startsWith("https://"),
      });
    } catch (error) {
      console.error("Cloudflare sign-up create user failed", error);
      return encodedRedirect(
        "error",
        "/sign-up",
        "We couldn't create your account right now. Please try again in a moment.",
        locale
      );
    }

    return redirect(getLocalePath("/dashboard", locale));
  }

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        app_key: getAppKey(),
      },
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message, locale);
  } else {
    return encodedRedirect("success", "/dashboard", "Thanks for signing up!", locale);
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = resolveActionLocale(formData);
  const nextPath = resolveSafeNextPath(formData, locale, "/dashboard");

  if (isCloudflareDataBackend()) {
    try {
      const user = await verifyCredentialsPassword(email, password);
      if (!user) {
        return encodedRedirect("error", "/sign-in", "Invalid email or password.", locale);
      }

      await provisionCustomerIfMissing({
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      const origin = await getRequestOrigin();
      await setAuthSessionCookie({
        userId: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        secure: origin.startsWith("https://"),
      });
    } catch (error) {
      console.error("Cloudflare credentials sign-in failed", error);
      return encodedRedirect("error", "/sign-in", "Sign-in failed. Please try again.", locale);
    }
    return redirect(nextPath);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message, locale);
  }

  return redirect(nextPath);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const locale = resolveActionLocale(formData);
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required", locale);
  }

  if (isCloudflareDataBackend()) {
    const origin = await getRequestOrigin();
    const user = await getAuthUserByEmail(email);

    if (user) {
      const token = await createPasswordResetToken(user.id, new Date(Date.now() + 30 * 60 * 1000));
      const resetUrl = new URL(getLocalePath("/reset-password", locale), origin);
      resetUrl.searchParams.set("token", token);
      await sendPasswordResetEmail({
        to: email,
        resetUrl: resetUrl.toString(),
        locale,
      });
    }

    if (callbackUrl) {
      return redirect(callbackUrl);
    }

    return encodedRedirect(
      "success",
      "/forgot-password",
      "If an account exists for this email, a reset link will be sent shortly.",
      locale
    );
  }

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=${encodeURIComponent(getLocalePath("/dashboard/reset-password", locale))}`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
      locale
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
    locale
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const locale = resolveActionLocale(formData);
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const token = formData.get("token")?.toString();

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Password and confirm password are required",
      locale
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match",
      locale
    );
  }

  if (password.length < 8) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Password must be at least 8 characters.",
      locale
    );
  }

  if (isCloudflareDataBackend()) {
    if (!token) {
      return encodedRedirect("error", "/forgot-password", "Reset token is missing.", locale);
    }

    const record = await getValidPasswordResetToken(token);
    if (!record) {
      return encodedRedirect("error", "/forgot-password", "This reset link is invalid or has expired.", locale);
    }

    await updateUserPassword(record.user_id, password);
    await markPasswordResetTokenUsed(record.id);
    return encodedRedirect("success", "/sign-in", "Password updated. You can sign in now.", locale);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Password update failed",
      locale
    );
  }

  return encodedRedirect("success", "/reset-password", "Password updated", locale);
};

export const signOutAction = async () => {
  const headerList = await headers();
  const referer = headerList.get("referer");
  const localeMatch = referer?.match(/\/(en|zh)(?:\/|$)/);
  const locale = normalizeLocale(localeMatch?.[1]);

  if (isCloudflareDataBackend()) {
    await clearAuthSessionCookies();
    return redirect(getLocalePath("/sign-in", locale));
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect(getLocalePath("/sign-in", locale));
};

export async function createCheckoutSession(
  productId: string,
  email: string,
  userId: string,
  productType: "subscription" | "credits",
  credits_amount?: number,
  discountCode?: string
) {
  try {
    type CheckoutSessionResponse = {
      checkout_url?: string;
    };

    const requestBody: any = {
      product_id: productId,
      // request_id: `${userId}-${Date.now()}`, // use Unique request ID if you need
      customer: {
        email: email,
      },
      metadata: {
        user_id: userId,
        product_type: productType,
        credits: credits_amount || 0,
        app_key: getAppKey(),
      },
    };

    // 如果配置了成功重定向 URL，则添加到请求中
    if (process.env.CREEM_SUCCESS_URL) {
      requestBody.success_url = process.env.CREEM_SUCCESS_URL;
    }

    // 添加折扣码（如果有）
    if (discountCode) {
      requestBody.discount_code = discountCode;
    }

    const response = await fetch(process.env.CREEM_API_URL + "/v1/checkouts", {
      method: "POST",
      headers: {
        "x-api-key": process.env.CREEM_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const data = (await response.json()) as CheckoutSessionResponse;
    return data.checkout_url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}
