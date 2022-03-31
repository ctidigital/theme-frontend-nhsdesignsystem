/**
 * File:
 * js/my-validation.js
 */

define(['jquery'], function ($) {
    'use strict';

    return function () {
        var fieldEl = [];

        $.validator.setDefaults({
            highlight: function (element) {
                fieldEl =  $(element).closest('.field');

                if (fieldEl.length > 0) {
                    fieldEl.addClass('field-mage-error');
                }
            },
            unhighlight: function (element) {
                fieldEl =  $(element).closest('.field');

                if (fieldEl.length > 0) {
                    fieldEl.removeClass('field-mage-error');
                }
            }
        });
    };
});
