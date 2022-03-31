define(
    [
        'ko',
        'uiComponent',
        'jquery',
        'underscore',
        'Magento_Checkout/js/model/step-navigator',
        'Magento_Customer/js/model/customer',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/checkout-data',
        'Magento_Ui/js/lib/view/utils/async'
    ],
    function (
        ko,
        Component,
        $,
        _,
        stepNavigator,
        customer
    ) {
        'use strict';
        /**
         *
         * loginstep - is the name of the component's .html template,
         * <Vendor>_<Module>  - is the name of the your module directory.
         *
         */
        return Component.extend({
            defaults: {
                template: 'Magento_Checkout/loginstep'
            },

            // add here your logic to display step,
            isVisible: ko.observable(!customer.isLoggedIn()),


            /**
             *
             * @returns {*}
             */
            initialize: function () {
                this._super();

                // Avoid Registering Login Step when customer is already logged In
                if (customer.isLoggedIn()) {
                    window.checkoutConfig.loginStepComplete = true;
                    // stepNavigator.next();
                } else {
                    // register your step
                    stepNavigator.registerStep(
                        // step code will be used as step content id in the component template
                        'login_step',
                        // step alias
                        null,
                        // step title value
                        'Sign in',
                        // observable property with logic when display step or hide step
                        this.isVisible,

                        _.bind(this.navigate, this),

                        /**
                         * sort order value
                         * 'sort order value' < 10: step displays before shipping step;
                         * 10 < 'sort order value' < 20 : step displays between shipping and payment step
                         * 'sort order value' > 20 : step displays after payment step
                         */
                        0
                    );
                }


                return this;
            },

            loginStepRenderComplete: function () {
                window.checkoutConfig.loginStepComplete = false;
            },

            /**
             * The navigate() method is responsible for navigation between checkout step
             * during checkout. You can add custom logic, for example some conditions
             * for switching to your custom step
             */
            navigate: function (step) {
                if (step) {
                    step.isVisible(true);
                }
            },

            /**
             * @returns void
             */
            navigateToNextStep: function () {
                if (this.validateLoginInformation()) {
                    window.checkoutConfig.loginStepComplete = true;
                    stepNavigator.next();
                }
            },

            /**
             * Check
             * If user is logged in
             * If Guest, the user has entered valid email
             * Before continuing to next step
             * @returns {boolean}
             */
            validateLoginInformation: function () {
                var loginFormSelector = 'form[data-role=email-with-possible-login]',
                    emailValidationResult = customer.isLoggedIn();

                if (!customer.isLoggedIn()) {
                    $(loginFormSelector).validation();
                    emailValidationResult = Boolean($(loginFormSelector + ' input[name=username]').valid());
                }

                if (!emailValidationResult) {
                    $(loginFormSelector + ' input[name=username]').focus();
                    return false;
                }

                return true;
            }
        });
    }
);
