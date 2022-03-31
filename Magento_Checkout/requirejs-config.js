/* exported config */
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
// eslint-disable-next-line no-unused-vars
var config = {
    'map': {
        '*': {
            'basketItemAjaxUpdate': 'Magento_Checkout/js/basket-item-ajax-update'
        }
    },
    'config': {
        'mixins': {
            'mage/dropdown': {
                'Magento_Checkout/js/dropdown-dialog-mixin': true
            },
            'Magento_Checkout/js/view/shipping': {
                'Magento_Checkout/js/view/shipping-payment-mixin': true
            },
            'Magento_Checkout/js/view/form/element/email': {
                'Magento_Checkout/js/view/form/element/email-mixin': true
            },
            'Magento_Checkout/js/view/payment': {
                'Magento_Checkout/js/view/shipping-payment-mixin': true
            },
            'Magento_Checkout/js/view/progress-bar': {
                'Magento_Checkout/js/view/progress-bar-mixin': true
            }
        }
    }
};
