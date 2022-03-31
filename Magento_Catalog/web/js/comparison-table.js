/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'jquery-ui-modules/widget'
], function ($) {
    'use strict';

    $.widget('mage.comparisonTable', {

        /** @inheritdoc */
        _create: function () {
            var elem = this.element,
                _self = this,
                $row;

            _self.$hideSimilarCheckbox = $('#hide-similar-properties', elem);

            if (_self.$hideSimilarCheckbox.length > 0) {
                _self.$hideSimilarCheckbox.on('change', function () {
                   _self.showDifferencesUpdated();
                });
            }

            $row = $('tbody > tr', elem);

            $row.each(function () {
                var $this = $(this),
                    $col,
                    firstColText,
                    isDifferent;

                $col = $('td', $this);
                firstColText = false;
                isDifferent = false;

                $col.each(function (idx) {
                    if (idx === 0) {
                        firstColText = $(this).text();
                    } else {
                        if ($(this).text() !== firstColText) {
                            isDifferent = true;
                        }
                        if ($(this).find('.product-item-actions').length > 0) {
                            isDifferent = true;
                        }
                    }
                });

                if (isDifferent === true) {
                    $this.addClass('is-row-different');
                }
            });

            _self.updateRowHighlights(false);
        },
        showDifferencesUpdated: function () {
            if (this.$hideSimilarCheckbox.is(':checked')) {
                this.element.addClass('table-comparison--show-differences');
                this.updateRowHighlights(true);
            } else {
                this.element.removeClass('table-comparison--show-differences');
                this.updateRowHighlights(false);
            }
        },

        updateRowHighlights: function (differenceOnly) {
            var $tableRow = $('.table-comparison__row-bg');

            $('.table-comparison__row-bg.is-even').removeClass('is-even');

            if (differenceOnly === true) {
                $tableRow = $('.table-comparison__row-bg.is-row-different');
                $tableRow.each(function (idx) {
                    if (idx % 2 === 0) {
                        $(this).addClass('is-even');
                    }
                });
            } else {
                $tableRow.each(function (idx) {
                    if (idx % 2 === 0) {
                        $(this).addClass('is-even');
                    }
                });
            }
        }
    });

    return $.mage.comparisonTable;
});
