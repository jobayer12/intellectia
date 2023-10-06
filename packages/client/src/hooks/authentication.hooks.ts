/**
 * These file holds all the hooks related to the application authentication
 * Note the file naming convention is different from the other hooks
 * file name should be like -> **.hooks.ts ( if file holds more than one hook )
 * file name should be like -> **.hook.ts ( if file holds one hook )
 */

import { signupWithEmailPassword } from "@/api/api";
import { dispatchAPIError } from "@/lib/appUtils";
import { APIErrorType, IHookSignUpWithEmailAndPassword } from "@/types/types";
import { AxiosError, AxiosResponse } from "axios";
import { useMutation } from "react-query";
import { NavigateFunction } from "react-router-dom";

/**
 * Hook - Authentication
 * Signup user with email and password
 */
export function useSignUpWithEmailAndPassword(navigate: NavigateFunction): IHookSignUpWithEmailAndPassword {
  const signupMutation = useMutation<AxiosResponse<any, any>, AxiosError, { email: string; password: string }, unknown>(
    (inputData) => signupWithEmailPassword(inputData.email, inputData.password),
    {
      onError: (error) => {
        dispatchAPIError({
          errorType: APIErrorType.EmailPasswordSignup,
          message: error,
        });
      },
      onSuccess: () => {},
    },
  );

  const signup = async (email: string, password: string) => {
    try {
      await signupMutation.mutateAsync({ email, password });
    } catch (error: any) {
      dispatchAPIError({
        errorType: APIErrorType.EmailPasswordSignup,
        message: error,
      });
    }
  };

  return { signup, isLoading: signupMutation.isLoading };
}