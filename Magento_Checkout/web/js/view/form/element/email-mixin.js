define(
    [
        'jquery',
        'ko',
        'Magento_Customer/js/model/customer',
        'Magento_Checkout/js/model/quote',
        'Magento_Customer/js/action/login',
        'Magento_Checkout/js/model/full-screen-loader',
        'Magento_Checkout/js/model/step-navigator'
    ], function ($, ko, customer, quote, loginAction, fullScreenLoader) {
        'use strict';

        var mixin = {


            initialize: function () {
                this.checkDelay = 250;
                this._super();
                return this;
            },

            /**
             * Log in form submitting callback.
             *
             * @param {HTMLElement} loginForm - form element.
             */
            login: function (loginForm) {
                var loginData = {},
                    formDataArray = $(loginForm).serializeArray();

                formDataArray.forEach(function (entry) {
                    loginData[entry.name] = entry.value;
                });

                if (this.isPasswordVisible() && $(loginForm).validation() && $(loginForm).validation('isValid')) {
                    fullScreenLoader.startLoader();
                    loginAction(loginData).fail(function () {
                        window.location = window.checkoutConfig.checkoutUrl + '#login_step';
                        fullScreenLoader.stopLoader();
                    }).done(function (response) {
                        if (response.errors) {
                            window.location = window.checkoutConfig.checkoutUrl + '#login_step';
                            fullScreenLoader.stopLoader();
                        } else {
                            window.location = window.checkoutConfig.checkoutUrl;
                        }
                    });
                }
            }
        };

        return function (target) {
            return target.extend(mixin);
        };
    }
);
