/**
 * Created by hasankhan on 24/05/2017.
 */
/* jshint jquery:true */
/* globals define */
define([
    'jquery',
    'picturefill',
    'matchMedia',
    'slickslider'
], function ($, picturefill, mediaCheck) {
    'use strict';
    var enableSliderForElement,
        _el;

    function waitForLazyLoadedImages(_slick) {
        var lazyLoadObservers = [],
            lazyLoadSelector = 'img.lazyload',
            lazyLoadedClassName = 'lazyloaded',
            loadedImages = 0,
            $lazyLoadImages,
            totalImages,
            lazyLoadObserverConfig;

        $lazyLoadImages = _slick.$slides.find(lazyLoadSelector);
        totalImages = $lazyLoadImages.length;
        lazyLoadObserverConfig = { attributes: true, childList: false, subtree: false };

        if (totalImages <= 0) {
            // console.log('no images found!');
            setTimeout(function () {
                _slick.$slider.slick('resize');
            }, 200);
            return;
        }

        function checkForImageLoadComplete() {
            var i = 0;
            // console.log('Loaded Images ' + (loadedImages) + ' of ' + (lazyLoadObservers.length) );

            if (loadedImages === lazyLoadObservers.length) {
                for (i = 0; i < lazyLoadObservers.length; i++) {
                    lazyLoadObservers[i].disconnect();
                }
                lazyLoadObservers = [];
                _slick.$slider.slick('resize');
            }
        }

        function setImageLoadObserver(target) {
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.attributeName === 'class') {
                        if ($(mutation.target).hasClass(lazyLoadedClassName)) {
                            loadedImages++;
                            checkForImageLoadComplete();
                        }
                    }
                });
            });

            observer.observe(target, lazyLoadObserverConfig);
            lazyLoadObservers.push(observer);
        }

        $lazyLoadImages.each(function (idx, imageEl) {
            setImageLoadObserver(imageEl, idx);
        });
    }

    function slickEqualHeights(s) {
        s.on('setPosition', function (event, slick) {
            var $slickSlide = slick.$list.find('.slick-slide');

            $slickSlide.css('height', 'auto');
            $slickSlide.css('height', slick.$slideTrack.height() + 'px');
        });

        s.on('init', function (event, slick) {
            waitForLazyLoadedImages(slick);
        });
    }

    function addSlickSlider(el, slickSettings, responsiveUnslick, equalHeight) {
        var _unslickBreakpoint = '',
            _mediaQuery,
            _slick;

        if (equalHeight === true) {
            slickEqualHeights(el);
        }

        _slick = el.slick(slickSettings);

        el.on('afterChange', function () {
            picturefill({ reevaluate: true });
        });

        if (responsiveUnslick) {
            // Find the Breakpoint where Slider unslicks
            if (typeof slickSettings.responsive === 'undefined') {
                return;
            }

            $.each(slickSettings.responsive, function () {
                if (this.settings === 'unslick') {
                    _unslickBreakpoint = this.breakpoint;
                }
            });

            if (_unslickBreakpoint === '') {
                return;
            }

            if (slickSettings.mobileFirst === true) {
                _mediaQuery = '(min-width: ' + _unslickBreakpoint + 'px)';
            } else {
                _mediaQuery = '(max-width: ' + _unslickBreakpoint + 'px)';
            }

            //
            mediaCheck({
                media: _mediaQuery,
                entry: function () {},
                exit: function () {
                    if (!$(el).hasClass('slick-initialized')) {
                        _slick = el.slick(slickSettings);
                        if (equalHeight === true) {
                            slickEqualHeights(_slick);
                        }
                    }
                }
            });
        }
    }

    enableSliderForElement = function (params, el) {
        _el = $(el);
        if (typeof params.slickSettings === 'undefined') {
            params.slickSettings = {};
        }

        if (typeof params.responsiveUnslick === 'undefined') {
            params.responsiveUnslick = false;
        }

        if (typeof params.equalHeight === 'undefined') {
            params.equalHeight = false;
        }

        addSlickSlider(_el, params.slickSettings, params.responsiveUnslick, params.equalHeight);
    };
    return enableSliderForElement;
});
