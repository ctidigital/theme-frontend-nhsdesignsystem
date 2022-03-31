/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'mage/template',
    'jquery-ui-modules/widget',
    'mage/translate',
    'jquery/validate'
], function ($, mageTemplate) {
    var showLabel,
        errorSummaryTemplate,
        tmpl,
        $tmpl,
        errorSummaryTitle,
        errorSummaryListItemTemplate;

    showLabel = $.validator.prototype.showLabel;
    errorSummaryTemplate = '<div class="nhsuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabindex="-1">' +
                                '<h2 class="nhsuk-error-summary__title" id="error-summary-title">' +
                                    '<%= data.title %>' +
                                '</h2>' +
                                '<div class="nhsuk-error-summary__body">' +
                                   '<ul class="nhsuk-list nhsuk-error-summary__list">' +
                                    '</ul>' +
                                '</div>' +
                            '</div>';
    errorSummaryListItemTemplate = '<li><a href="#<%= data.id %>"><%= data.message %></a></li>';


    function addErrorItemToSummaryList(id, message, $list) {
        var _tmpl;

        _tmpl = mageTemplate(errorSummaryListItemTemplate)({
            data: {
                id: id,
                message: message
            }
        });
        // Add list item to summary
        $(_tmpl)
            .appendTo($list);
    }

    $.extend(true, $.validator.prototype, {
        /**
         * @param {*} element
         * @param {*} message
         */
        showLabel: function (element, message) {
            var _message,
                $nhsErrorSummaryList,
                $nhsErrorSummary = $(this.currentForm).find('.nhsuk-error-summary');

            errorSummaryTitle = $.mage.__('There is a problem');

            if ($(this.currentForm).attr('data-enable-error-summary') === 'true') {
                // Transform the message using, label of the element to make
                // sense of message
                if (message.toLowerCase().indexOf('this is a') !== -1) {
                    _message = message
                        .toLowerCase()
                        .replace(
                            'this is a',
                            $('label[for=' + element.id + ']').text() + ' is a');
                }

                // Check if error summary exisits for the form already
                if ($nhsErrorSummary.length > 0) {
                    // Check if error is not shown already for the element id
                    if ($nhsErrorSummary.find('[href="#' + element.id + '"]').length <= 0) {
                        $nhsErrorSummaryList = $nhsErrorSummary.find('.nhsuk-list');
                    }
                } else {
                    // Create new error summary element using template
                    tmpl = mageTemplate(errorSummaryTemplate)({
                        data: {
                            title: errorSummaryTitle
                        }
                    });
                    $tmpl = $(tmpl);
                    $nhsErrorSummaryList = $tmpl.find('.nhsuk-list');
                }

                // Add error
                addErrorItemToSummaryList(element.id, _message, $nhsErrorSummaryList);

                // Add new error sumary list if its not prexisiting
                if ($tmpl.length > 0) {
                    // Add list item to summary
                    $tmpl
                        .prependTo($(this.currentForm));
                    $tmpl = [];
                }

                if ($nhsErrorSummary.length > 0) {
                    // Focus on error summary
                    setTimeout(function () {
                        $nhsErrorSummary.focus();
                    }, 200);
                }
            }

            showLabel.call(this, element, message);
        }
    });
});
