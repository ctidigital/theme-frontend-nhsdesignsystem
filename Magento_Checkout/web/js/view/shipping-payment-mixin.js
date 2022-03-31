define(
    [
        'ko',
        'jquery',
        'Magento_Customer/js/model/customer',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/model/step-navigator'
    ], function (ko, $, customer, quote) {
        'use strict';

        var mixin = {
            visible: ko.observable(false),

            initialize: function () {
                var customerEmailSet = (window.checkoutConfig.loginStepComplete === true || (customer.isLoggedIn())),
                 visiblilityObservableValue = (!quote.isVirtual() && (customerEmailSet));

                this.visible = ko.observable(visiblilityObservableValue);
               // this.isVisible = ko.observable(visiblilityObservableValue);
                this._super();

                if (customerEmailSet === false) {
                    window.location = window.checkoutConfig.checkoutUrl + '#login_step';
                }

                return this;
            },

            validateShippingInformation: function () {
                // Show the postcode lookup fields to
                // enable validation as validation won't work
                // on hidden fields
                var $postcodeLookup = $('#enter-address-manually');

                if ($postcodeLookup.length > 0) {
                    if ($postcodeLookup.is(':visible')) {
                        $postcodeLookup.click();
                    }
                }

                return this._super();
            }
        };

        return function (target) {
            return target.extend(mixin);
        };
    }
);
