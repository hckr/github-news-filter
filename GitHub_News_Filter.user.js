// ==UserScript==
// @name        GitHub News Filter
// @namespace   hckr
// @description Userscript to filter GitHub news feed using case-insensitive regular expression
// @include     https://github.com/
// @version     0.6
// @author      Jakub Młokosiewicz
// @source      https://github.com/hckr/github-news-filter
// @updateURL   https://hckr.pl/github-news-filter/GitHub_News_Filter.user.js
// @downloadURL https://hckr.pl/github-news-filter/GitHub_News_Filter.user.js
// @supportURL  https://github.com/hckr/github-news-filter/issues
// @license     MIT
// ==/UserScript==

let minimum = 10;

let initialObserver = new MutationObserver(function() {
    if (document.querySelector('.news .body')) {
        initialObserver.disconnect();
        initializeFilter();
    }
});
initialObserver.observe(document.querySelector('.news'), { childList: true });

function initializeFilter() {
    console.log('aa');
    let activity = document.querySelector('.js-all-activity-header + div'),
        activityWrapper = document.createElement('div');
    activityWrapper.style.position = 'relative';
    activityWrapper.innerHTML = `
        <label class="sr-only" for="pattern-input">News filter</label>
        <input id="pattern-input" class="form-control" style="width: 150px; position: absolute; top: -30px; right: 0px;" placeholder="Filter activity...">
    `;

        activity.parentNode.insertBefore(activityWrapper, activity);
    activityWrapper.appendChild(activity);

    let patternInput = document.getElementById('pattern-input'),
        underMinimum = 0,
        forcedMore = false,
        inputTimeout = null;

    patternInput.addEventListener('input', function() {
        clearTimeout(inputTimeout);
        setTimeout(function() {
            let notHidden = filterNews(findTopLevelNewsItems(activity.querySelectorAll('div')), patternInput.value);
            if (notHidden < minimum) {
                underMinimum = minimum - notHidden;
                forcedMore = true;
                clickMoreIfExists();
            }
        }, 1000);
    });

    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes) {
                if (!forcedMore) {
                    underMinimum = minimum;
                }
                forcedMore = false;
                let notHidden = filterNews(findTopLevelNewsItems(mutation.addedNodes), patternInput.value);
                underMinimum -= notHidden;
                if (notHidden == 0 || underMinimum > 0) {
                    forcedMore = true;
                    clickMoreIfExists();
                }
            }
        });
    });

    observer.observe(activity, { childList: true, subtree: true });
}

function findChildElements(parentNodes, selector) {
        return [].reduce.call(parentNodes, (ns, n) => ns.concat([].slice.call(n.querySelectorAll ? n.querySelectorAll(selector) : [])), []);
}

function findTopLevelNewsItems(parentNodes) {
    let children = findChildElements(parentNodes, '.body .body');
    return [].filter.call(findChildElements(parentNodes, '.body'),
                          node => !children.includes(node));
}

function filterNews(newsItems, pattern) {
    let regexp = new RegExp(pattern, 'i'),
        notHidden = 0;
    newsItems.forEach(el => {
        if (el.innerText.match(regexp)) {
            el.style.removeProperty('display');
            notHidden += 1;
        } else {
            el.style.display = 'none';
        }
    });
    return notHidden;
}

function clickMoreIfExists() {
    let moreButton = document.querySelector('.ajax-pagination-btn');
    if (moreButton) {
        moreButton.click();
    }
}
