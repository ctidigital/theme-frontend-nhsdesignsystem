define(
    [
        'ko',
        'Magento_Customer/js/model/customer',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/model/step-navigator',
        'jquery'
    ], function (ko, customer, quote, stepNavigator, $) {
        'use strict';

        var mixin = {
            /**
             * @param {Object} item
             * @return {*|Boolean}
             */
            isNotLoggedIn: function (item) {
                var isUserLoggedIn,
                    isLoginStepComplete;

                if (item.code === 'login_step') {
                    isUserLoggedIn = customer.isLoggedIn();
                    isLoginStepComplete = stepNavigator.isProcessed(item.code);

                    if (isUserLoggedIn && isLoginStepComplete) {
                        return false;
                    }
                }

                return true;
            },

            progressStepCount: function (items) {
                return items.length;
            },

            currentStep: function (items) {
                var currentStep = {
                        id: '',
                        title: ''
                    },
                    _self = this;

                $.each(items, function(idx, item) {
                    if (item.isVisible() && !_self.isProcessed(item)) {
                        currentStep.id = (idx + 1) + '';
                        currentStep.title = item.title;
                    }
                });

                return currentStep;
            }
        };

        return function (target) {
            return target.extend(mixin);
        };
    }
);
