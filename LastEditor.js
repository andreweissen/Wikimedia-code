/**
 * LastEditor.js
 * @file Displays information related to page's last editor
 * @author Eizzen <en.wikipedia.org/wiki/User_talk:Eizzen>
 * @license Apache-2.0
 * @external "jQuery"
 * @external "mediawiki.util"
 * @external "mediawiki.api"
 */

/*jslint browser, this:true */
/*global mw, jQuery, window */

mw.loader.using(["mediawiki.util", "mediawiki.api"]).then(function () {
    "use strict";

    /**
     * @class LastEditor
     * @classdesc The central LastEditor class
     */
    var LastEditor = {
        conf: mw.config.get([
            "skin",
            "wgPageName",
            "wgArticleId",
            "wgUserLangu$age",
            "wgNamespaceNumber"
        ]),
        lang: {
            main: "Last edited by $1",
            talk: "talk",
            contribs: "contribs",
            diff: "diff",
            minor: "m",
            summary: "Summary",
            ago: "ago",
            second: "second",
            seconds: "seconds",
            minute: "minute",
            minutes: "minutes",
            hour: "hour",
            hours: "hours",
            day: "day",
            days: "days",
            week: "week",
            weeks: "weeks",
            month: "month",
            months: "months",
            year: "year",
            years: "years"
        },
        /**
         * @method getData
         * @param {function} callback
         * @returns {void}
         */
        getData: function (callback) {
            var that = this;

            this.api.get({
                action: "query",
                prop: "revisions",
                titles: this.conf.wgPageName,
                rvprop: "timestamp|user|userid|size|parsedcomment|flags",
                rvlimit: "2",
                rvdiffto: "prev",
                format: "json"
            }).done(function ($data) {
                if (!$data.error) {
                    callback(that, $data);
                }
            });
        },
        /**
         * @method handleData
         * @param {object} that
         * @param {json} $result
         * @returns {void}
         */
        handleData: function (that, $result) {
            var $data = $result.query.pages[that.conf.wgArticleId].revisions[0];
            var $divElement = mw.html.element("div", {id: "last-editor"});

            var $html =
                    "<a href='/wiki/User:" + $data.user + "'>" + $data.user +
                    "</a> (<a href='/wiki/User_talk:" + $data.user + "'>" +
                    that.lang.talk + "</a> | <a href='/wiki/Special:Contributions/" +
                    $data.user + "'>" + that.lang.contribs + "</a>)";

            if (jQuery("#page-creator").length) {
                jQuery($divElement).insertAfter("#page-creator");
            } else {
                switch (that.conf.skin) {
                case "vector":
                    jQuery($divElement).insertBefore("#siteSub");
                    break;
                case "monobook":
                    jQuery($divElement).prependTo("#bodyContent");
                    break;
                }
            }

            if (that.options.showTime) {
                $html += " " + "<span id='last-editor-time'>" +
                        that.convertDate(that, new Date($data.timestamp)) + "</span>";
            }

            if (that.options.showDiff) {
                $html += " " + "<a id='last-editor-diff' href='/?diff=" + $data.diff.to +
                        "' target='_blank'</a>(" + that.lang.diff + ")</a>";

                if ($data.minor === "") {
                    $html += " " + "<span id='last-editor-minor'>[" + that.lang.minor + "]</span>";
                }
            }

            if (that.options.showSummary && $data.parsedcomment) {
                $html += "<br/>" + that.lang.summary + ": " + $data.parsedcomment;
            }

            jQuery("#last-editor").html(that.lang.main.replace(/\$1/g, $html));
        },
        /**
         * @method convertDate
         * @param {object} that
         * @param {number} $lastRev
         * @returns {void}
         */
        convertDate: function (that, $lastRev) {
            var $age;
            var $now;
            var $ageNumber;
            var $ageRemainder;
            var $ageWords;

            $now = new Date();
            $age = $now.getTime() - $lastRev.getTime();

            if ($age < 60000) {
                $ageNumber = Math.floor($age / 1000);
                $ageWords = that.formatDate(that, $ageNumber, that.lang.second, that.lang.seconds);
            } else if ($age < 3600000) {
                $ageNumber = Math.floor($age / 60000);
                $ageWords = that.formatDate(that, $ageNumber, that.lang.minute, that.lang.minutes);
            } else if ($age < 86400000) {
                $ageNumber = Math.floor($age / 3600000);
                $ageWords = that.formatDate(that, $ageNumber, that.lang.hour, that.lang.hours);
                $ageRemainder = Math.floor(($age - $ageNumber * 3600000) / 60000);
            } else if ($age < 604800000) {
                $ageNumber = Math.floor($age / 86400000);
                $ageWords = that.formatDate(that, $ageNumber, that.lang.day, that.lang.days);
            } else if ($age < 2592000000) {
                $ageNumber = Math.floor($age / 604800000);
                $ageWords = that.formatDate(that, $ageNumber, that.lang.week, that.lang.weeks);
            } else if ($age < 31536000000) {
                $ageNumber = Math.floor($age / 2592000000);
                $ageWords = that.formatDate(that, $ageNumber, that.lang.month, that.lang.months);
            } else {
                $ageNumber = Math.floor($age / 31536000000);
                $ageWords = that.formatDate(that, $ageNumber, that.lang.year, that.lang.years);
                $ageRemainder = Math.floor(($age - $ageNumber * 31536000000) / 2592000000);
                if ($ageRemainder) {
                    $ageWords += " " +
                            that.formatDate(that, $ageRemainder, that.lang.month, that.lang.months);
                }
            }

            return $ageWords;
        },
        /**
         * @method formatDate
         * @param {object} that
         * @param {number} $number
         * @param {string} $singular
         * @param {string} $plural
         * @returns {void}
         */
        formatDate: function (that, $number, $singular, $plural) {
            return String($number).replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,") + "\u00a0" +
                    ($number === 1
                ? $singular
                : $plural) + " " + that.lang.ago;
        },
        /**
         * @method init
         * @returns {void}
         */
        init: function () {
            if (jQuery("#last-editor").length || window.isLastEditorLoaded) {
                return;
            }
            window.isLastEditorLoaded = true;

            this.api = new mw.Api();
            this.options = {
                namespaces: [0, 4, 8, 10],
                excluded: [],
                showTime: true,
                showDiff: true,
                showSummary: true
            };

            jQuery.extend(this.options, window.LastEditorOptions);

            mw.util.addCSS(
                "#last-editor {" +
                    "line-height: normal;" +
                    "font-size: 12px;" +
                    "font-weight: normal;" +
                "}" +
                "#last-editor-minor {" +
                    "font-weight: bold;" +
                "}"
            );

            if (
                jQuery.inArray(this.conf.wgNamespaceNumber, this.options.namespaces) !== -1 &&
                jQuery.inArray(this.conf.wgPageName, this.options.excluded) === -1
            ) {
                this.getData(this.handleData);
            }
        }
    };

    jQuery(document).ready(function () {
        LastEditor.init();
    });
});