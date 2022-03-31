define(['jquery'], function ($) {
    'use strict';

    return function (originalWidget) {
        $.widget('mage.myOrdersFilter', originalWidget, {
            createFilterSummary: function () {
                var $filterRemove,
                    currentLabel = '';

                this._super();
                $filterRemove =  this.els.filterSummaryFieldset.find('.action-remove:not(.action-clear-all)');
                if ($filterRemove.length > 0) {
                    $.each($filterRemove, function () {
                        var labelString;

                        currentLabel = $(this).parent().find('.label').text().replace(':', '');
                        labelString = $.mage.__('Remove %1 filter').replace('%1', currentLabel);
                        $(this).append($('<span class="nhsuk-u-visually-hidden">' + labelString + '</span>'));
                    });
                }
            }
        });

        return $.mage.myOrdersFilter;
    };
});
