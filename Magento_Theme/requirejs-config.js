/* exported config */
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
// eslint-disable-next-line no-unused-vars
var config = {
    paths: {
        'slickslider': 'js/vendor/slick',
        'picturefill': 'js/vendor/picturefill',
        'objectfit': 'js/vendor/ofi',
        'lazysizes': 'js/vendor/lazysizes',
        'scrolllock': 'js/vendor/scrolllock',
        'globalVars': 'Magento_Theme/js/global-vars'
    },
    deps: [
        'Magento_Theme/js/responsive',
        'Magento_Theme/js/theme',
        'js/mage-validation-error-summary'
    ],
    shim: {
        'slickslider': {
            deps: ['jquery']
        },
        'menu': {
            deps: ['jquery', 'matchMedia', 'globalVars', 'jquery-ui-modules/menu']
        }
    },
    'map': {
        '*': {
            'menu': 'Magento_Theme/js/navigation-menu',
            'Magento_Theme/js/view/messages': 'Magento_Theme/js/view/messages-updated'
        }
    },
    config: {
        mixins: {
            'mage/validation': {
                'js/mage-validation-mixin': true
            }
        }
    }
};
