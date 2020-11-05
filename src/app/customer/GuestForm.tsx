import { withFormik, FieldProps, FormikProps } from 'formik';
import React, { memo, useCallback, FunctionComponent, ReactNode } from 'react';
import { object, string } from 'yup';

import { withLanguage, TranslatedHtml, TranslatedString, WithLanguageProps } from '../locale';
import { getPrivacyPolicyValidationSchema, PrivacyPolicyField } from '../privacyPolicy';
import { Button, ButtonVariant } from '../ui/button';
import { BasicFormField, Fieldset, Form, Legend  } from '../ui/form';

import EmailField from './EmailField';
import PasswordField from './PasswordField';
import SubscribeField from './SubscribeField';

export interface GuestFormProps {
    canSubscribe: boolean;
    checkoutButtons?: ReactNode;
    requiresMarketingConsent: boolean;
    defaultShouldSubscribe: boolean;
    email?: string;
    isContinuingAsGuest: boolean;
    privacyPolicyUrl?: string;
    onChangeEmail(email: string): void;
    onContinueAsGuest(data: GuestFormValues): void;
    onShowLogin(): void;
}

export interface GuestFormValues {
    email: string;
    shouldSubscribe: boolean;
    password: string;
}

const GuestForm: FunctionComponent<GuestFormProps & WithLanguageProps & FormikProps<GuestFormValues>> = ({
    canSubscribe,
    checkoutButtons,
    isContinuingAsGuest,
    onChangeEmail,
    onShowLogin,
    privacyPolicyUrl,
    requiresMarketingConsent,
}) => {
    const renderField = useCallback((fieldProps: FieldProps<boolean>) => (
        <SubscribeField
            { ...fieldProps }
            requiresMarketingConsent={ requiresMarketingConsent }
        />
    ), [
        requiresMarketingConsent,
    ]);

    return (
        <Form
            className="checkout-form"
            id="checkout-customer-guest"
            testId="checkout-customer-guest"
        >
            <Fieldset
                legend={
                    <Legend hidden>
                        <TranslatedString id="customer.guest_customer_text" />
                    </Legend>
                }
            >
                <p>
                    <TranslatedHtml id="customer.create_account" />
                </p>

                <div className="customerEmail-container">
                    <div className="customerEmail-body">
                        <EmailField onChange={ onChangeEmail } />
                        <PasswordField forgotPasswordUrl={ '' } />

                        { (canSubscribe || requiresMarketingConsent) && <BasicFormField
                            name="shouldSubscribe"
                            render={ renderField }
                        /> }

                        { privacyPolicyUrl && <PrivacyPolicyField
                            url={ privacyPolicyUrl }
                        /> }
                    </div>

                    <div className="form-actions ">
                        <Button
                            className="customerEmail-button"
                            id="checkout-customer-continue"
                            isLoading={ isContinuingAsGuest }
                            testId="customer-continue-as-guest-button"
                            type="submit"
                            variant={ ButtonVariant.Primary }
                        >
                            <TranslatedString id="common.continue_action" />
                        </Button>
                    </div>
                </div>

                <p>
                    <TranslatedString id="customer.login_text" />
                    { ' ' }
                    <a
                        data-test="customer-continue-button"
                        id="checkout-customer-login"
                        onClick={ onShowLogin }
                    >
                        <TranslatedString id="customer.login_action" />
                    </a>
                </p>

                { checkoutButtons }
            </Fieldset>
        </Form>
    );
};

export default withLanguage(withFormik<GuestFormProps & WithLanguageProps, GuestFormValues>({
    mapPropsToValues: ({
        email = '',
        defaultShouldSubscribe = false,
        requiresMarketingConsent,
    }) => ({
        email,
        password: '',
        shouldSubscribe: requiresMarketingConsent ? false : defaultShouldSubscribe,
        privacyPolicy: false,
    }),
    handleSubmit: (values, { props: { onContinueAsGuest } }) => {
        onContinueAsGuest(values);
    },
    validationSchema: ({ language, privacyPolicyUrl }: GuestFormProps & WithLanguageProps) => {
        const email = string()
            .email(language.translate('customer.email_invalid_error'))
            .max(256)
            .required(language.translate('customer.email_required_error'));

        const password = string()
                .required(language.translate('customer.password_required_error'))
                .matches(/[0-9]/, language.translate('customer.password_number_required_error'))
                .matches(/[a-zA-Z]/, language.translate('customer.password_letter_required_error'))
                .min(7, language.translate('customer.password_under_minimum_length_error'))
                .max(100, language.translate('customer.password_over_maximum_length_error'));

        const baseSchema = object({ email, password });

        if (privacyPolicyUrl) {
            return baseSchema.concat(getPrivacyPolicyValidationSchema({
                isRequired: !!privacyPolicyUrl,
                language,
            }));
        }

        return baseSchema;
    },
})(memo(GuestForm)));
